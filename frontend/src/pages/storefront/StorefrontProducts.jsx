import { useEffect, useState, useCallback } from 'react';
import { useParams, useOutletContext, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productService, categoryService } from '../../services/api';
import { useCart } from './StorefrontLayout';
import Spinner from '../../components/ui/Spinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const RADII = { none: '0px', sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' };
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'name', label: 'Name A-Z' },
];

export default function StorefrontProducts() {
  const { storeSlug } = useParams();
  const { store, theme } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { addItem } = useCart();
  const radius = RADII[theme.borderRadius] || '10px';

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const featured = searchParams.get('featured') || '';
  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort };
      if (category) params.category = category;
      if (search) params.search = search;
      if (featured) params.featured = featured;
      const [prodRes, catRes] = await Promise.all([
        productService.getPublic(storeSlug, params),
        categories.length === 0 ? categoryService.getPublic(storeSlug) : Promise.resolve({ data: { categories } }),
      ]);
      setProducts(prodRes.data.products);
      setTotal(prodRes.data.total);
      if (categories.length === 0) setCategories(catRes.data.categories);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [storeSlug, page, category, search, sort, featured]);

  useEffect(() => { load(); }, [load]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setPage(1);
    setSearchParams(next);
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--store-text)' }}>
          {featured === 'true' ? '⭐ Featured Products' : category ? categories.find(c => c._id === category)?.name || 'Products' : 'All Products'}
        </h1>
        <p className="text-sm opacity-60">{total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0">
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={search}
              onChange={e => setParam('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border focus:outline-none focus:ring-2"
              style={{ borderRadius: radius, borderColor: `${theme.primaryColor}30`, '--tw-ring-color': theme.primaryColor }}
            />
          </div>

          {/* Sort */}
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">Sort By</p>
            <select value={sort} onChange={e => setParam('sort', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border focus:outline-none appearance-none"
              style={{ borderRadius: radius, borderColor: `${theme.primaryColor}30` }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">Category</p>
              <button
                onClick={() => setParam('category', '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all ${!category ? 'font-semibold text-white' : 'opacity-70 hover:opacity-100'}`}
                style={!category ? { background: theme.primaryColor } : {}}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setParam('category', cat._id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center gap-2 transition-all"
                  style={category === cat._id ? { background: theme.primaryColor, color: 'white', borderRadius: radius } : { opacity: 0.7 }}
                >
                  <span>{cat.icon}</span>{cat.name}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-sm opacity-50">Try a different search or category</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group overflow-hidden"
                    style={{ borderRadius: radius, background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${theme.primaryColor}18` }}
                  >
                    <Link to={`/store/${storeSlug}/products/${product.slug}`}>
                      <div className="relative overflow-hidden" style={{ paddingBottom: '75%' }}>
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl" style={{ background: `${theme.primaryColor}10` }}>🛍️</div>
                        )}
                        {product.discountPercent > 0 && (
                          <span className="absolute top-2 left-2 text-xs font-bold text-white px-2 py-0.5 rounded-full bg-red-500">
                            -{product.discountPercent}%
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link to={`/store/${storeSlug}/products/${product.slug}`}>
                        <h3 className="font-semibold text-xs mb-1 line-clamp-2 hover:opacity-75">{product.name}</h3>
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-bold text-sm" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</p>
                          {product.compareAtPrice && <p className="text-xs opacity-40 line-through">${product.compareAtPrice.toFixed(2)}</p>}
                        </div>
                        <button
                          onClick={() => { addItem(product, 1); toast.success('Added!', { icon: '🛒' }); }}
                          className="text-xs text-white px-2.5 py-1.5 font-semibold transition-all hover:opacity-90"
                          style={{ background: theme.primaryColor, borderRadius: radius }}
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-lg text-sm font-semibold transition-all"
                      style={page === p ? { background: theme.primaryColor, color: 'white' } : { background: '#f3f4f6', color: '#374151' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
