import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../components/theme-provider';
import { useAuth } from '../../../features/auth/hooks/useAuth.jsx';
import { useCart } from '../../../features/sales/hooks/useCart.jsx';
import { Sun, Moon, ShoppingBag, Search, Menu, X, Cpu, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function PublicNavbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { cart, setIsDrawerOpen } = useCart();
  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo de Productos', href: '/catalogo' },
    { name: 'Servicio Técnico', href: '/#servicio-tecnico' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-3 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.img 
            whileHover={{ scale: 1.05 }} 
            transition={{ duration: 0.2, ease: 'easeOut' }}
            src="/logo_transparent.png" 
            alt="Tecnológicos GR" 
            className="h-16 lg:h-20 w-auto object-contain drop-shadow-sm" 
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <Link 
              key={i} 
              to={link.href}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full" />
            </Link>
          ))}
        </div>

        {/* ICONS & ACTIONS */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
            <Search size={20} />
          </button>

          {/* Theme Switcher Animado */}
          <button 
            onClick={toggleTheme}
            className="relative h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={20} className="text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={20} className="text-secondary" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* User Section */}
          <div className="hidden sm:block relative">
             {user ? (
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </div>
             ) : (
                <Link to="/auth/login" className="text-sm font-bold text-primary hover:underline">
                  Ingresar
                </Link>
             )}

             {/* Profile Dropdown */}
             <AnimatePresence>
               {isProfileOpen && user && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
                 >
                   <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                     <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.email}</p>
                     <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                   </div>
                   <div className="p-2 space-y-1">
                     <Link to={user.role === 'CLIENTE' ? '/mi-cuenta' : '/admin/dashboard'} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                       <LayoutDashboard size={16} /> Panel de Control
                     </Link>
                     <button 
                       onClick={() => { logout(); navigate('/'); setIsProfileOpen(false); }}
                       className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                     >
                       <LogOut size={16} /> Cerrar Sesión
                     </button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Cart Icon */}
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="relative h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-primary hover:text-white transition-all"
          >
            <ShoppingBag size={20} />
            {cartItemCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#0A0A0A]"
              >
                {cartItemCount}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-900 dark:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-[#0A0A0A] border-b border-slate-200 dark:border-slate-800"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <Link 
                  key={i} 
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold text-slate-900 dark:text-white hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
              
              <hr className="border-slate-200 dark:border-slate-800 my-2" />
              
              {user ? (
                <>
                  <Link 
                    to={user.role === 'CLIENTE' ? '/mi-cuenta' : '/admin/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white hover:text-primary"
                  >
                    <LayoutDashboard size={20} /> Panel de Control
                  </Link>
                  <button 
                    onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 text-lg font-semibold text-red-500 text-left"
                  >
                    <LogOut size={20} /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold text-primary"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
