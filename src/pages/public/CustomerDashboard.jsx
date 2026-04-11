import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../features/auth/hooks/useAuth';
import api from '../../lib/axios';
import { ShoppingBag, Wrench, User, LogOut, Package, ArrowRight, LayoutDashboard, Search, Loader2, Save, UserCircle, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('orders'); // orders, services, profile
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', telefono: '', direccion: '', email: '', documento_identidad: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/clients/profile/me');
        setClientProfile(data);
        setFormData({
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            email: data.email || '',
            documento_identidad: data.documento_identidad || ''
        });
        
        // Cargar servicios técnicos pasando el client_id explicitamente
        setLoadingServices(true);
        const resServices = await api.get(`/technical-services/?client_id=${data.id}`);
        setServices(resServices.data || []);
      } catch (error) {
        console.error("Error fetching profile or services:", error);
      } finally {
        setLoadingServices(false);
      }
    };

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

    fetchProfile();
    fetchOrders();
  }, [user, navigate]);

  const handleProfileChange = (e) => {
      setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSaveProfile = async (e) => {
      e.preventDefault();
      if (!clientProfile) return;
      try {
          setSavingProfile(true);
          await api.put(`/clients/${clientProfile.id}`, formData);
          toast({
              title: "Perfil actualizado",
              description: "Tus datos han sido guardados exitosamente.",
              variant: "success"
          });
          setClientProfile({...clientProfile, ...formData});
      } catch (error) {
          toast({
              title: "Error al actualizar",
              description: "Hubo un problema actualizando tus datos.",
              variant: "destructive"
          });
      } finally {
          setSavingProfile(false);
      }
  };

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
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-3xl mx-auto mb-4 border-2 border-primary/20 overflow-hidden">
              {clientProfile?.nombres ? clientProfile.nombres.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-lg leading-tight line-clamp-1">{clientProfile ? `${clientProfile.nombres} ${clientProfile.apellidos}` : user.email}</h2>
            <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Cliente VIP</p>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(var(--primary),0.3)]' : 'hover:bg-slate-100 dark:hover:bg-[#111111] text-slate-600 dark:text-slate-400'}`}
            >
              <UserCircle size={20} /> Mis Datos
            </button>
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
        <div className="flex-1 min-w-0 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-10 min-h-[500px]">
          
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                   <UserCircle className="text-primary" /> Información Personal
                 </h2>
               </div>

               <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl bg-slate-50 dark:bg-[#0A0A0A] p-6 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nombres</label>
                        <Input name="nombres" value={formData.nombres} onChange={handleProfileChange} required className="bg-white dark:bg-[#161616] border-slate-200 dark:border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Apellidos</label>
                        <Input name="apellidos" value={formData.apellidos} onChange={handleProfileChange} required className="bg-white dark:bg-[#161616] border-slate-200 dark:border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Documento de Identidad <span className="text-xs text-muted-foreground">(Solo Lectura)</span></label>
                        <Input value={formData.documento_identidad} disabled className="bg-slate-100 dark:bg-black border-slate-200 dark:border-white/5" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Teléfono Celular</label>
                        <Input name="telefono" value={formData.telefono} onChange={handleProfileChange} className="bg-white dark:bg-[#161616] border-slate-200 dark:border-white/10" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleProfileChange} className="bg-white dark:bg-[#161616] border-slate-200 dark:border-white/10" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Dirección Física</label>
                        <Input name="direccion" value={formData.direccion} onChange={handleProfileChange} className="bg-white dark:bg-[#161616] border-slate-200 dark:border-white/10" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
                      <Button type="submit" disabled={savingProfile} className="min-w-[150px]">
                        {savingProfile ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                      </Button>
                  </div>
               </form>
            </motion.div>
          )}
          
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
               
               {loadingServices ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                  </div>
               ) : services.length === 0 ? (
                 <div className="text-center py-16 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                      <Wrench className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No hay servicios vinculados</h3>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">Si dejaste un equipo en soporte, pronto aparecerá aquí con su estado en tiempo real.</p>
                 </div>
               ) : (
                  <div className="grid gap-6">
                    {services.map((svc) => (
                       <div key={svc.id} className="bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                           <div className="flex-1">
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                     TKT-{String(svc.id).padStart(5, '0')}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                    svc.estado_actual === 'completado' ? 'bg-green-500/10 text-green-500' :
                                    svc.estado_actual === 'cancelado' ? 'bg-red-500/10 text-red-500' :
                                    'bg-blue-500/10 text-blue-500'
                                  }`}>
                                    {svc.estado_actual}
                                  </span>
                               </div>
                               <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize truncate mb-1">
                                 {svc.tipo_dispositivo} {svc.marca_modelo && `- ${svc.marca_modelo}`}
                               </h3>
                               <p className="text-sm text-slate-500 dark:text-slate-400">
                                 Ingreso: {new Date(svc.fecha_ingreso).toLocaleDateString('es-CO')}
                               </p>
                           </div>
                           
                           {svc.token_rastreo && (
                               <Link to={`/tracking/${svc.token_rastreo}`} className="w-full md:w-auto shrink-0">
                                   <Button variant="default" className="w-full h-12 rounded-xl group overflow-hidden relative">
                                        <div className="absolute inset-0 w-1/4 bg-white/20 skew-x-[45deg] -left-full group-hover:animate-[tada_1s_ease-in-out]"></div>
                                        Rastrear Servicio <ArrowRight className="ml-2 h-4 w-4" />
                                   </Button>
                               </Link>
                           )}
                       </div>
                    ))}
                  </div>
               )}
            </motion.div>
          )}

        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
