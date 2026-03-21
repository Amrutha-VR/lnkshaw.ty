import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', emoji: '—', label: 'My Links' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Masthead */}
      <div className="p-5 border-b-3 border-ink">
        <Link to="/">
          <span className="font-headline text-xl font-700 text-ink"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            LnkShaw<span className="text-accent">.ty</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <div className="kicker px-3 py-2 mb-1">Navigation</div>
        {navItems.map(({ to, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/analytics');
          return (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-600 transition-colors duration-100
                ${active
                  ? 'bg-ink text-paper'
                  : 'text-ink hover:bg-rule/40'
                }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-accent' : 'bg-rule'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t-3 border-ink p-4 space-y-3">
        <div className="flex items-center gap-3">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="w-8 h-8 border-2 border-ink object-cover" />
            : <div className="w-8 h-8 border-2 border-ink bg-rule flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-ink" />
              </div>
          }
          <div className="min-w-0 flex-1">
            <p className="text-sm font-700 text-ink truncate">{user?.name}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-600 text-muted hover:text-ink hover:bg-rule/30 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-56 bg-offwhite border-r-3 border-ink flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden" />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-offwhite border-r-3 border-ink z-50">
              <button onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-offwhite border-b-3 border-ink px-4 h-12 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="text-ink">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-headline font-700 text-ink"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            LnkShaw<span className="text-accent">.ty</span>
          </span>
          <div className="w-5" />
        </header>

        <div className="flex-1 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
