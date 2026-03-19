import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../features/auth/hooks/useAuth';
import api from '../../lib/axios';
import { ShoppingBag, Wrench, User, LogOut, Package, ArrowRight, LayoutDashboard, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/utils';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders'); // orders, services, profile
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const { data } = await api.get('/sales/?limit=20');
        setOrders(data.items || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 flex flex-col pt-20">
      <PublicNavbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-3xl p-6 mb-4 text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-3xl mx-auto mb-4 border-2 border-primary/20">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-lg leading-tight line-clamp-1">{user.email}</h2>
            <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Cliente VIP</p>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${activeTab === 'orders' ? 'bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(var(--primary),0.3)]' : 'hover:bg-slate-100 dark:hover:bg-[#111111] text-slate-600 dark:text-slate-400'}`}
            >
              <Package size={20} /> Mis Compras
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${activeTab === 'services' ? 'bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(var(--primary),0.3)]' : 'hover:bg-slate-100 dark:hover:bg-[#111111] text-slate-600 dark:text-slate-400'}`}
            >
              <Wrench size={20} /> Mis Servicios
            </button>
            
            <hr className="border-slate-200 dark:border-white/10 my-2" />
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold hover:bg-red-500/10 text-red-500 transition-all"
            >
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-10 min-h-[500px]">
          
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                   <Package className="text-primary" /> Historial de Compras
                 </h2>
               </div>

               {loadingOrders ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                  </div>
               ) : orders.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <ShoppingBag className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No hay compras registradas</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">Aún no has realizado ninguna compra en nuestra tienda en línea.</p>
                    <Link to="/catalogo">
                      <Button>Ir de Compras</Button>
                    </Link>
                  </div>
               ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-sm font-bold text-slate-500">#{String(order.id).padStart(5, '0')}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${order.pagado ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                  {order.pagado ? 'Pagado' : 'Pendiente'}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {new Date(order.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </p>
                              {order.metodo_pago && (
                                <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                                  {order.metodo_pago}
                                </p>
                              )}
                           </div>
                           
                           <div className="text-left md:text-right">
                             <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Obligación</p>
                             <p className="text-2xl font-black text-primary">{formatCurrency(order.total_venta)}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
               )}
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                   <Wrench className="text-primary" /> Mis Servicios Técnicos
                 </h2>
               </div>
               
               <div className="text-center py-16 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <Wrench className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No hay servicios vinculados</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">Si dejaste un equipo en soporte, pronto aparecerá aquí con su estado en tiempo real.</p>
               </div>
            </motion.div>
          )}

        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
