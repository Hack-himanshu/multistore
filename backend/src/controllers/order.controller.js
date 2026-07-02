const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Owner: List orders ───────────────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  const storeId = req.user.storeId; // 🔑 TENANT ISOLATION
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = { storeId }; // 🔑 Always scope by storeId
  if (status) filter.status = status;
  if (search) filter.$or = [
    { orderNumber: { $regex: search, $options: 'i' } },
    { customerEmail: { $regex: search, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    orders,
  });
});

// ─── Owner: Get single order ──────────────────────────────────────────────────
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, storeId: req.user.storeId }) // 🔑
    .populate('customer', 'name email')
    .populate('items.product', 'name images slug');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.status(200).json({ success: true, order });
});

// ─── Owner: Update order status ───────────────────────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, trackingUrl } = req.body;
  const order = await Order.findOne({ _id: req.params.id, storeId: req.user.storeId }); // 🔑
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  order.statusHistory.push({ status, note: note || '' });
  await order.save();

  res.status(200).json({ success: true, message: 'Order status updated.', order });
});

// ─── Owner: Dashboard stats ───────────────────────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const storeId = req.user.storeId; // 🔑
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders,
    pendingOrders,
    monthlyOrders,
    lastMonthOrders,
    revenueAgg,
    lastMonthRevenueAgg,
  ] = await Promise.all([
    Order.countDocuments({ storeId }),
    Order.countDocuments({ storeId, status: 'pending' }),
    Order.countDocuments({ storeId, createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ storeId, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Order.aggregate([
      { $match: { storeId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { storeId, paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  // Revenue by day (last 30 days) for chart
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const revenueByDay = await Order.aggregate([
    { $match: { storeId, paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      monthlyOrders,
      lastMonthOrders,
      totalRevenue,
      lastMonthRevenue,
      revenueByDay,
    },
  });
});

// ─── Public: Create order ─────────────────────────────────────────────────────
// Called from storefront checkout — storeId comes from resolved store, not client
const createPublicOrder = asyncHandler(async (req, res) => {
  const storeId = req.store._id; // 🔑 From resolveStore middleware — cannot be spoofed
  const { items, shippingAddress, customerEmail, paymentMethod, customerNote, couponCode } = req.body;

  if (!items?.length) {
    return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
  }

  // Validate and price items from DB (never trust client prices)
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, storeId, isActive: true }); // 🔑
    if (!product) {
      return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
    }
    if (product.trackInventory && product.stock < item.quantity && !product.allowBackorder) {
      return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
    }

    const price = product.price;
    subtotal += price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      price,
      quantity: item.quantity,
      image: product.images?.[0]?.url || '',
      sku: product.sku,
      selectedVariant: item.selectedVariant || null,
    });

    // Decrement stock
    if (product.trackInventory) {
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity, totalSold: item.quantity },
      });
    }
  }

  const order = await Order.create({
    storeId,
    items: orderItems,
    shippingAddress,
    customerEmail,
    paymentMethod: paymentMethod || 'cod',
    customerNote,
    couponCode,
    subtotal,
    total: subtotal, // Tax/shipping can be added later
    currency: req.store.currency || 'USD',
  });

  // Update store revenue stats
  await Store.findByIdAndUpdate(storeId, {
    $inc: { 'stats.totalOrders': 1, 'stats.totalRevenue': subtotal },
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order: {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      items: order.items,
    },
  });
});

module.exports = { getOrders, getOrder, updateOrderStatus, getDashboardStats, createPublicOrder };
