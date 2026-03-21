import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left — branding column */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between p-12">
        <Link to="/">
          <span className="font-headline text-3xl font-700 text-paper"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            LnkShaw<span className="text-accent">.ty</span>
          </span>
        </Link>
        <div>
          <div className="kicker text-paper/40 mb-4">The brief</div>
          <p className="font-deck text-3xl italic text-paper leading-tight"
            style={{ fontFamily: "'Libre Baskerville', serif" }}>
            "Short links.<br />Big analytics.<br />Zero noise."
          </p>
        </div>
        <div className="border-t border-paper/10 pt-6">
          <div className="grid grid-cols-3 gap-6">
            {[['10K+','Users'],['5M+','Links'],['190+','Countries']].map(([n,l]) => (
              <div key={l}>
                <div className="font-headline text-2xl font-700 text-paper"
                  style={{ fontFamily: "'Playfair Display', serif" }}>{n}</div>
                <div className="kicker text-paper/40 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form column */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block mb-8">
            <span className="font-headline text-2xl font-700 text-ink"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              LnkShaw<span className="text-accent">.ty</span>
            </span>
          </Link>

          <div className="kicker mb-2">Sign in</div>
          <h2 className="font-headline text-3xl font-700 text-ink mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome back.
          </h2>

          {(searchParams.get('error') || error) && (
            <div className="mb-5 p-3 border-l-4 border-accent bg-accent/5 text-sm text-accent font-600">
              {searchParams.get('error') ? 'Google sign-in failed. Try again.' : error}
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4
                       border-3 border-ink bg-paper font-label font-700 text-sm tracking-wider uppercase
                       hover:bg-ink hover:text-paper transition-colors duration-150 mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-rule" /></div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-paper kicker">or email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="kicker block mb-1.5">Email address</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field w-full" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="kicker block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field w-full pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">
              {isLoading
                ? <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                    Signing in…
                  </span>
                : <>Sign in <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            No account?{' '}
            <Link to="/signup" className="text-ink font-700 underline underline-offset-2 hover:text-accent">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
