import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCart } from '../../features/sales/hooks/useCart';
import api from '../../lib/axios';
import { ShoppingBag, CreditCard, ArrowLeft, Building, Truck, ShieldCheck, Banknote, Loader2, Cpu } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('TRANSFERENCIA');
  const [deliveryType, setDeliveryType] = useState('DOMICILIO');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redireccionar si no hay sesión o carrito vacío
  if (!user) {
    navigate('/auth/login');
    return null;
  }

  if (!cartLoading && cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <ShoppingCart className="h-20 w-20 text-slate-300 dark:text-slate-800 mb-6" />
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Tu carrito está vacío</h1>
        <p className="text-slate-500 mb-8">Agrega algunos productos antes de proceder al pago.</p>
        <Link to="/catalogo">
          <Button size="lg" className="h-12 rounded-xl">Explorar Productos</Button>
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (deliveryType === 'DOMICILIO' && (!address || !city)) {
      toast({ title: 'Atención', description: 'Por favor completa tu dirección y ciudad para el envío.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build order observations based on delivery info
      let obs = `Tipo Entrega: ${deliveryType}. `;
      if (deliveryType === 'DOMICILIO') {
         obs += `Dirección: ${address}, ${city}. `;
      }
      if (notes) obs += `Notas Adicionales: ${notes}`;

      const payload = {
        metodo_pago: paymentMethod,
        observaciones: obs,
        // Al ser Cliente, el backend ignora "items" y coge el carrito directamente.
        items: [] 
      };

      const { data } = await api.post('/sales/', payload);
      
      toast({
        title: "¡Pedido Confirmado!",
        description: `Tu orden #${data.id || ''} se ha registrado exitosamente.`,
        variant: "success",
      });

      // Refrescar carrito global (lo vacía el backend)
      await refreshCart();
      
      // Redirigir a panel de cliente
      navigate('/mi-cuenta');

    } catch (error) {
      toast({
        title: "Error en Checkout",
        description: error.response?.data?.detail || "No pudimos procesar tu pedido.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 pt-8 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
        
        {/* Header simple para minimizar fugas (CRO) */}
        <header className="flex items-center justify-between mb-12 border-b border-slate-200 dark:border-white/10 pb-6">
          <Link to="/catalogo" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium">
             <ArrowLeft size={18} /> Volver a comprar
          </Link>
          <div className="flex items-center gap-2">
            <Cpu className="text-primary" size={24} />
            <span className="text-xl font-black tracking-tighter">
              Checkout Seguro
            </span>
          </div>
          <div className="w-24 text-right">
             <ShieldCheck className="inline-block text-green-500 h-6 w-6" />
          </div>
        </header>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Seccion Principal (Formularios) */}
          <div className="lg:col-span-7 space-y-8">
             
            {/* Resumen de Información */}
            <section className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-black">1</span> 
                Información de Entrega
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setDeliveryType('DOMICILIO')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${deliveryType === 'DOMICILIO' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <Truck size={24} />
                  <span className="font-bold">Envío a Domicilio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('PUNTO')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${deliveryType === 'PUNTO' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <Building size={24} />
                  <span className="font-bold">Recoger en Tienda</span>
                </button>
              </div>

              <AnimatePresence>
                {deliveryType === 'DOMICILIO' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                       <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase text-slate-500">Dirección Exacta</label>
                          <input 
                            value={address} onChange={e => setAddress(e.target.value)}
                            placeholder="Ej. Calle 123 #45-67 Apto 101"
                            className="w-full h-12 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            required={deliveryType === 'DOMICILIO'}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase text-slate-500">Ciudad</label>
                          <input 
                            value={city} onChange={e => setCity(e.target.value)}
                            placeholder="Ej. Bogotá"
                            className="w-full h-12 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            required={deliveryType === 'DOMICILIO'}
                          />
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-4 space-y-1">
                 <label className="text-xs font-semibold uppercase text-slate-500">Notas de entrega (Opcional)</label>
                 <textarea 
                   rows={2}
                   value={notes} onChange={e => setNotes(e.target.value)}
                   placeholder="Dejar en portería, llevar cambio, etc."
                   className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                 />
              </div>

            </section>

            {/* Método de Pago */}
            <section className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-black">2</span> 
                Forma de Pago
              </h2>

              <div className="space-y-3">
                 <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'TRANSFERENCIA' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="TRANSFERENCIA" 
                      checked={paymentMethod === 'TRANSFERENCIA'}
                      onChange={() => setPaymentMethod('TRANSFERENCIA')}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-bold flex items-center gap-2"><CreditCard size={18} className="text-primary"/> Transferencia Bancaria (Nequi / Bancolombia)</p>
                      <p className="text-sm text-slate-500 mt-1">El pedido se despachará luego de confirmar la transferencia por WhatsApp.</p>
                    </div>
                 </label>
                 
                 <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'EFECTIVO' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="EFECTIVO" 
                      checked={paymentMethod === 'EFECTIVO'}
                      onChange={() => setPaymentMethod('EFECTIVO')}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-bold flex items-center gap-2"><Banknote size={18} className="text-primary"/> Pago Contra Entrega</p>
                      <p className="text-sm text-slate-500 mt-1">Pagas en efectivo al recibir el producto. Válido compras menores a $1.000.000 COP.</p>
                    </div>
                 </label>
              </div>

            </section>

          </div>

          {/* Sidebar (Resumen Orden) */}
          <div className="lg:col-span-5">
             <div className="bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 sticky top-24">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <ShoppingBag className="text-primary" /> Resumen de tu Pedido
               </h3>

               <ul className="space-y-4 max-h-[40vh] overflow-y-auto scrollbar-thin mb-6 pr-2">
                 {cart.items.map((item) => (
                   <li key={item.id_producto} className="flex gap-4">
                     <div className="w-16 h-16 bg-white dark:bg-[#1A1A1A] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {item.url_imagen ? (
                          <img src={item.url_imagen} alt={item.nombre_producto} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-black text-slate-300">TECH</span>
                        )}
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-semibold text-sm leading-tight line-clamp-2">{item.nombre_producto}</h4>
                        <div className="flex justify-between items-end mt-1">
                          <span className="text-xs text-slate-500 font-bold">Cant: {item.cantidad}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</span>
                        </div>
                     </div>
                   </li>
                 ))}
               </ul>

               <div className="space-y-3 mb-8 pt-6 border-t border-slate-200 dark:border-white/10">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Envío</span>
                    <span className="font-medium text-green-500">{deliveryType === 'PUNTO' ? 'Gratis' : 'Por calcular'}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mt-4">
                    <span>Total a Pagar</span>
                    <span className="text-primary">{formatCurrency(cart.total)}</span>
                  </div>
               </div>

               <Button 
                 type="submit" 
                 disabled={isSubmitting || cart.items.length === 0}
                 className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary),0.5)] transition-all flex items-center justify-center gap-3"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="animate-spin h-6 w-6" /> Procesando Orden...
                   </>
                 ) : (
                   <>
                     Confirmar Pedido <ArrowRight className="h-6 w-6" />
                   </>
                 )}
               </Button>
               
               <p className="text-xs text-center text-slate-500 mt-4 px-4">
                 Al confirmar asumes el compromiso de compra sujeto a validación de transferencias o stock.
               </p>
             </div>
          </div>

        </form>

      </div>
    </div>
  );
}
