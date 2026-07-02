import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '🛍️', title: 'Any Business Type', desc: 'Fashion, Electronics, Food, Services — one platform fits all.' },
  { icon: '🎨', title: 'Theme Customizer', desc: 'Colors, fonts, and layouts fully customizable without code.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Built-in AI to write product descriptions, SEO, and more.' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Track revenue, orders, and customers in one dashboard.' },
  { icon: '🔐', title: 'Multi-tenant Security', desc: 'Each store is fully isolated with enterprise-grade security.' },
  { icon: '📱', title: 'Mobile-first Storefronts', desc: 'Beautiful, fast stores that work on any device.' },
];

const storeExamples = [
  { emoji: '👗', label: 'Fashion' },
  { emoji: '📱', label: 'Electronics' },
  { emoji: '💄', label: 'Beauty' },
  { emoji: '🍕', label: 'Food' },
  { emoji: '📚', label: 'Books' },
  { emoji: '🏋️', label: 'Sports' },
  { emoji: '💍', label: 'Jewelry' },
  { emoji: '🌿', label: 'Organic' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-lg">🏪</span>
          </div>
          <span className="font-bold text-lg">MultiStore</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5">
            Start Free →
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-24 px-4">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-20 right-20 w-48 h-48 bg-pink-600/20 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Multi-tenant Store Platform · 2025
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            Build Your Online Store
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Without Writing Code
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 text-balance"
          >
            One platform, unlimited stores. Every user gets their own isolated storefront with custom theme, products, and AI assistant.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl shadow-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-indigo-500/50"
            >
              Create Free Store 🚀
            </Link>
            <Link
              to="/store/demo-fashion"
              className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:bg-white/5"
            >
              View Demo Store →
            </Link>
          </motion.div>

          {/* Store type pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {storeExamples.map((s, i) => (
              <span key={s.label} className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-sm px-4 py-2 rounded-full hover:bg-white/10 transition-colors cursor-default">
                {s.emoji} {s.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to sell online</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From storefront to analytics, every tool built in. No plugins. No hidden costs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to launch?</h2>
            <p className="text-gray-400 mb-8">Create your store in 60 seconds. No credit card required.</p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-500/30 transition-all hover:-translate-y-1"
            >
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-xl">🏪</span>
            <span className="font-semibold">MultiStore</span>
            <span className="text-sm">· Built with MERN Stack</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 MultiStore Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
