import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const BUSINESS_TYPES = [
  { value: 'Fashion', label: '👗 Fashion & Apparel' },
  { value: 'Electronics', label: '📱 Electronics & Gadgets' },
  { value: 'Furniture', label: '🛋️ Furniture & Home' },
  { value: 'Jewelry', label: '💍 Jewelry & Accessories' },
  { value: 'Cosmetics', label: '💄 Cosmetics & Beauty' },
  { value: 'Restaurant', label: '🍽️ Restaurant & Food' },
  { value: 'Pharmacy', label: '💊 Pharmacy & Health' },
  { value: 'Books', label: '📚 Books & Media' },
  { value: 'Sports', label: '⚽ Sports & Fitness' },
  { value: 'PetStore', label: '🐾 Pet Store' },
  { value: 'DigitalProducts', label: '💻 Digital Products' },
  { value: 'Courses', label: '🎓 Online Courses' },
  { value: 'Agriculture', label: '🌾 Agriculture & Farming' },
  { value: 'Automobile', label: '🚗 Automobile & Parts' },
  { value: 'Grocery', label: '🛒 Grocery & Essentials' },
  { value: 'LuxuryBrands', label: '✨ Luxury Brands' },
  { value: 'Handmade', label: '🎨 Handmade Products' },
  { value: 'B2B', label: '🤝 B2B Store' },
  { value: 'Wholesale', label: '📦 Wholesale' },
  { value: 'Services', label: '🛠️ Services' },
  { value: 'Other', label: '🏪 Other' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    businessType: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.storeName.trim()) e.storeName = 'Store name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form);
    if (result.success) {
      toast.success('Welcome! Your store is ready 🎉');
      const role = result.user?.role;
      navigate(role === 'SuperAdmin' ? '/admin' : '/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="blob w-96 h-96 bg-indigo-400 top-10 -left-20 animation-delay-2000" />
      <div className="blob w-80 h-80 bg-purple-400 bottom-20 -right-16 animation-delay-4000" />
      <div className="blob w-72 h-72 bg-pink-400 top-1/2 left-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create your store</h1>
            <p className="text-sm text-gray-500 mt-1">Launch your online business in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Your Name"
              name="name"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              autoFocus
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <div className="pt-1 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Store Details</p>
              <div className="space-y-4">
                <Input
                  label="Store Name"
                  name="storeName"
                  type="text"
                  placeholder="e.g. Alex's Fashion Hub"
                  value={form.storeName}
                  onChange={handleChange}
                  error={errors.storeName}
                  required
                  hint="Your store URL will be generated from this"
                />
                <Select
                  label="Business Type"
                  name="businessType"
                  options={BUSINESS_TYPES}
                  placeholder="Select your business type"
                  value={form.businessType}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              className="mt-2"
            >
              {isLoading ? 'Creating your store...' : 'Create Free Store 🚀'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have a store?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account you agree to our{' '}
            <span className="underline cursor-pointer">Terms</span> and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
