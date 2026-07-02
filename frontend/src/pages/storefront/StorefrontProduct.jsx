import { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productService } from '../../services/api';
import { useCart } from './StorefrontLayout';
import Spinner from '../../components/ui/Spinner';

const RADII = { none: '0px', sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' };

export default function StorefrontProduct() {
  const { storeSlug, productSlug } = useParams();
  const { store, theme } = useOutletContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCart();
  const radius = RADII[theme.borderRadius] || '10px';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await productService.getPublic(storeSlug, {});
        // Use slug-based lookup via public API
        const res = await fetch(`/api/products/public/${storeSlug}/${productSlug}`);
        const json = await res.json();
        setProduct(json.product);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeSlug, productSlug]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  if (!product) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-xl font-bold mb-3">Product Not Found</h2>
      <p className="opacity-60 mb-6">This product may have been removed.</p>
      <Link to={`/store/${storeSlug}/products`} className="inline-block font-semibold text-white px-6 py-3"
        style={{ background: theme.primaryColor, borderRadius: radius }}>
        Browse Products
      </Link>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [{ url: '', alt: product.name }];

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${qty > 1 ? `${qty}× ` : ''}${product.name} added to cart!`, { icon: '🛒' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs opacity-50 mb-6 flex items-center gap-2">
        <Link to={`/store/${storeSlug}`}>Home</Link>
        <span>/</span>
        <Link to={`/store/${storeSlug}/products`}>Products</Link>
        <span>/</span>
        <span className="opacity-100 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full aspect-square overflow-hidden mb-3"
            style={{ borderRadius: `calc(${radius} * 1.5)`, background: `${theme.primaryColor}10` }}
          >
            {images[activeImg]?.url ? (
              <img src={images[activeImg].url} alt={images[activeImg].alt || product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
            )}
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className="w-16 h-16 shrink-0 overflow-hidden transition-all"
                  style={{ borderRadius: radius, border: i === activeImg ? `2px solid ${theme.primaryColor}` : '2px solid transparent' }}>
                  {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">🛍️</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            {product.isBestSeller && <span className="text-xs font-bold text-white px-3 py-1 rounded-full" style={{ background: theme.secondaryColor || '#f59e0b' }}>🔥 Best Seller</span>}
            {product.isFeatured && <span className="text-xs font-bold text-white px-3 py-1 rounded-full" style={{ background: theme.primaryColor }}>⭐ Featured</span>}
            {!product.inStock && <span className="text-xs font-bold text-white px-3 py-1 rounded-full bg-red-500">Out of Stock</span>}
          </div>

          {product.category && <p className="text-xs opacity-50 uppercase tracking-wider mb-2">{product.category.name}</p>}
          <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--store-text)' }}>{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-black" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg line-through opacity-40">${product.compareAtPrice.toFixed(2)}</span>
                <span className="text-sm font-bold text-red-600">Save {product.discountPercent}%</span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-sm opacity-70 leading-relaxed mb-5">{product.shortDescription}</p>
          )}

          {/* Stock */}
          <div className="mb-5">
            {product.inStock ? (
              <p className="text-sm font-medium text-emerald-600">✓ In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-sm font-medium text-red-500">✗ Out of Stock</p>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: `${theme.primaryColor}40` }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors">−</button>
              <span className="w-12 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-11 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 py-3 font-bold text-base text-white transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || '#a855f7'})`, borderRadius: radius }}
            >
              🛒 Add to Cart — ${(product.price * qty).toFixed(2)}
            </button>
          </div>

          {/* SKU / Tags */}
          {(product.sku || product.tags?.length > 0) && (
            <div className="border-t border-black/5 pt-4 space-y-2 text-xs opacity-60">
              {product.sku && <p>SKU: {product.sku}</p>}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full border text-xs" style={{ borderColor: `${theme.primaryColor}30`, color: theme.primaryColor }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <section className="mt-12 border-t border-black/5 pt-8">
          <h2 className="text-xl font-bold mb-5">Product Details</h2>
          <div className="prose prose-sm max-w-none opacity-80 leading-relaxed whitespace-pre-line">{product.description}</div>
        </section>
      )}
    </div>
  );
}
