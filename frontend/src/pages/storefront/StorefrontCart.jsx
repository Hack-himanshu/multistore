import { Link, useParams, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from './StorefrontLayout';
import { TrashIcon } from '@heroicons/react/24/outline';

const RADII = { none: '0px', sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' };

export default function StorefrontCart() {
  const { storeSlug } = useParams();
  const { store, theme } = useOutletContext();
  const { items, removeItem, updateQty, clearCart } = useCart();
  const radius = RADII[theme.borderRadius] || '10px';
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--store-text)' }}>Your cart is empty</h2>
          <p className="text-sm opacity-60 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to={`/store/${storeSlug}/products`} className="inline-block font-bold text-white px-8 py-3 transition-all hover:-translate-y-0.5"
            style={{ background: theme.primaryColor, borderRadius: radius }}>
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--store-text)' }}>Shopping Cart</h1>
        <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Clear All</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 p-4"
                style={{ background: 'white', borderRadius: radius, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: `1px solid ${theme.primaryColor}15` }}
              >
                {/* Image */}
                <div className="w-16 h-16 shrink-0 overflow-hidden" style={{ borderRadius: `calc(${radius} * 0.75)`, background: `${theme.primaryColor}10` }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--store-text)' }}>{item.name}</h3>
                  {item.variant && <p className="text-xs opacity-50 mt-0.5">{Object.values(item.variant).join(' / ')}</p>}
                  <p className="font-bold text-sm mt-1" style={{ color: theme.primaryColor }}>${item.price.toFixed(2)}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center border rounded-lg overflow-hidden shrink-0" style={{ borderColor: `${theme.primaryColor}30` }}>
                  <button onClick={() => updateQty(item.key, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-base hover:bg-gray-100 transition-colors">−</button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.key, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-base hover:bg-gray-100 transition-colors">+</button>
                </div>

                {/* Line total */}
                <div className="text-right shrink-0 min-w-[60px]">
                  <p className="font-bold text-sm" style={{ color: 'var(--store-text)' }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                {/* Remove */}
                <button onClick={() => removeItem(item.key)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6" style={{ background: 'white', borderRadius: `calc(${radius} * 1.5)`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${theme.primaryColor}15` }}>
            <h2 className="text-base font-bold mb-5" style={{ color: 'var(--store-text)' }}>Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between opacity-70">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between opacity-70">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="border-t border-black/10 pt-3 flex justify-between font-bold text-base">
                <span style={{ color: 'var(--store-text)' }}>Total</span>
                <span style={{ color: theme.primaryColor }}>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to={`/store/${storeSlug}/checkout`}
              className="block w-full text-center font-bold text-white py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || '#a855f7'})`, borderRadius: radius }}
            >
              Proceed to Checkout →
            </Link>

            <Link to={`/store/${storeSlug}/products`} className="block text-center text-xs mt-4 opacity-50 hover:opacity-70 transition-opacity">
              ← Continue Shopping
            </Link>

            {/* Trust badges */}
            <div className="mt-5 pt-4 border-t border-black/5 flex justify-center gap-4 text-xs opacity-40">
              <span>🔒 Secure</span>
              <span>📦 Free Returns</span>
              <span>✅ Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
