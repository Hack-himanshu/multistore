import { useState } from 'react';
import { useParams, useOutletContext, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { orderService } from '../../services/api';
import { useCart } from './StorefrontLayout';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const RADII = { none: '0px', sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' };
const PAYMENT_METHODS = [
  { value: 'cod', label: '💵 Cash on Delivery' },
  { value: 'card', label: '💳 Credit / Debit Card' },
  { value: 'upi', label: '📱 UPI / Mobile Payment' },
  { value: 'bank_transfer', label: '🏦 Bank Transfer' },
];

export default function StorefrontCheckout() {
  const { storeSlug } = useParams();
  const { store, theme } = useOutletContext();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const radius = RADII[theme.borderRadius] || '10px';

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    street: '', city: '', state: '', country: '', zip: '',
    paymentMethod: 'cod', customerNote: '',
  });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.street.trim()) e.street = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.country.trim()) e.country = 'Required';
    if (!form.zip.trim()) e.zip = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fill all required fields'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setPlacing(true);
    try {
      const { data } = await orderService.createPublic(storeSlug, {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, selectedVariant: i.variant })),
        shippingAddress: {
          fullName: form.fullName, email: form.email, phone: form.phone,
          street: form.street, city: form.city, state: form.state,
          country: form.country, zip: form.zip,
        },
        customerEmail: form.email,
        paymentMethod: form.paymentMethod,
        customerNote: form.customerNote,
      });

      clearCart();
      navigate(`/store/${storeSlug}`, { state: { orderSuccess: true, orderNumber: data.order.orderNumber } });
      toast.success(`Order placed! #${data.order.orderNumber}`, { duration: 6000, icon: '🎉' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-bold mb-3">Your cart is empty</h2>
        <Link to={`/store/${storeSlug}/products`} className="inline-block font-bold text-white px-6 py-3"
          style={{ background: theme.primaryColor, borderRadius: radius }}>
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--store-text)' }}>Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6" noValidate>
          {/* Contact Info */}
          <div className="p-6" style={{ background: 'white', borderRadius: `calc(${radius} * 1.5)`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${theme.primaryColor}12` }}>
            <h2 className="font-bold text-base mb-4" style={{ color: 'var(--store-text)' }}>Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Full Name" value={form.fullName} onChange={e => set('fullName', e.target.value)} error={errors.fullName} required autoFocus />
              </div>
              <Input label="Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} required />
              <Input label="Phone Number" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6" style={{ background: 'white', borderRadius: `calc(${radius} * 1.5)`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${theme.primaryColor}12` }}>
            <h2 className="font-bold text-base mb-4" style={{ color: 'var(--store-text)' }}>Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Street Address" value={form.street} onChange={e => set('street', e.target.value)} error={errors.street} required placeholder="123 Main Street, Apt 4B" />
              </div>
              <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} error={errors.city} required />
              <Input label="State / Province" value={form.state} onChange={e => set('state', e.target.value)} />
              <Input label="Country" value={form.country} onChange={e => set('country', e.target.value)} error={errors.country} required />
              <Input label="ZIP / Postal Code" value={form.zip} onChange={e => set('zip', e.target.value)} error={errors.zip} required />
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6" style={{ background: 'white', borderRadius: `calc(${radius} * 1.5)`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${theme.primaryColor}12` }}>
            <h2 className="font-bold text-base mb-4" style={{ color: 'var(--store-text)' }}>Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 p-3 cursor-pointer transition-all rounded-xl"
                  style={form.paymentMethod === value ? { background: `${theme.primaryColor}12`, border: `1.5px solid ${theme.primaryColor}`, borderRadius: radius } : { border: '1.5px solid #e5e7eb', borderRadius: radius }}>
                  <input type="radio" name="paymentMethod" value={value} checked={form.paymentMethod === value} onChange={() => set('paymentMethod', value)} className="w-4 h-4" style={{ accentColor: theme.primaryColor }} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="p-6" style={{ background: 'white', borderRadius: `calc(${radius} * 1.5)`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${theme.primaryColor}12` }}>
            <label className="text-sm font-medium block mb-1.5">Order Note (optional)</label>
            <textarea value={form.customerNote} onChange={e => set('customerNote', e.target.value)} rows={2} className="w-full text-sm border border-gray-200 p-3 focus:outline-none resize-none" style={{ borderRadius: radius }} placeholder="Special instructions, delivery preferences..." />
          </div>

          <button
            type="submit"
            disabled={placing}
            className="w-full py-4 font-bold text-white text-base transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || '#a855f7'})`, borderRadius: radius }}
          >
            {placing ? 'Placing Order...' : `Place Order — $${subtotal.toFixed(2)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 p-5" style={{ background: 'white', borderRadius: `calc(${radius} * 1.5)`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${theme.primaryColor}15` }}>
            <h2 className="font-bold text-sm mb-4 uppercase tracking-wider opacity-50">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.key} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: `${theme.primaryColor}10` }}>
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🛍️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-xs">{item.name}</p>
                    <p className="text-xs opacity-50">×{item.quantity}</p>
                  </div>
                  <p className="font-bold text-xs shrink-0" style={{ color: theme.primaryColor }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-black/5 pt-3 space-y-2 text-sm">
              <div className="flex justify-between opacity-60"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between opacity-60"><span>Shipping</span><span className="text-emerald-600">Free</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-black/5">
                <span>Total</span>
                <span style={{ color: theme.primaryColor }}>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 text-xs opacity-40 text-center">🔒 Secure SSL checkout</div>
          </div>
        </div>
      </div>
    </div>
  );
}
