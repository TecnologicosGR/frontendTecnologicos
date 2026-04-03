import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useCart } from '../../features/sales/hooks/useCart';
import { companyService } from '../../features/company/services/company.service';
import api from '../../lib/axios';
import { ShoppingBag, ShoppingCart, CreditCard, ArrowLeft, ArrowRight, Building, Truck, ShieldCheck, Banknote, Loader2, Cpu, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('Transferencia');
  const [deliveryType, setDeliveryType] = useState('domicilio');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [baseDeliveryPrice, setBaseDeliveryPrice] = useState(0);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState('');
  const [loadingDeliveryConfig, setLoadingDeliveryConfig] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cartSubtotal = Array.isArray(cart.items)
    ? cart.items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0)
    : 0;
  const cartTotal = Number(cart.total ?? cartSubtotal);
  const selectedZone = selectedZoneIndex !== '' ? deliveryZones[Number(selectedZoneIndex)] : null;
  const shippingCost = deliveryType === 'domicilio'
    ? Number(selectedZone?.precio_base ?? baseDeliveryPrice ?? 0)
    : 0;
  const finalTotal = cartTotal + shippingCost;

  useEffect(() => {
    let mounted = true;

    const loadDeliveryConfig = async () => {
      try {
        const config = await companyService.getConfig();
        if (!mounted) return;

        const zones = Array.isArray(config.zonas_domicilio)
          ? config.zonas_domicilio.filter((z) => z && z.nombre)
          : [];

        setDeliveryZones(zones);
        setBaseDeliveryPrice(parseFloat(config.precio_domicilio_base) || 0);
        setSelectedZoneIndex(zones.length > 0 ? '0' : '');
      } catch (error) {
        if (!mounted) return;
        setDeliveryZones([]);
        setBaseDeliveryPrice(0);
      } finally {
        if (mounted) setLoadingDeliveryConfig(false);
      }
    };

    loadDeliveryConfig();
    return () => {
      mounted = false;
    };
  }, []);

  // Redireccionar si no hay sesión o carrito vacío
  if (!user) {
    return <Navigate to="/auth/login" replace />;
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
    if (deliveryType === 'domicilio' && (!address || !city)) {
      toast({ title: 'Atención', description: 'Por favor completa tu dirección y ciudad para el envío.', variant: 'destructive' });
      return;
    }

    if (deliveryType === 'domicilio' && deliveryZones.length > 0 && selectedZoneIndex === '') {
      toast({ title: 'Atención', description: 'Selecciona una zona de domicilio para calcular el envío.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build order observations based on delivery info
      let obs = `Tipo Entrega: ${deliveryType}. `;
      if (deliveryType === 'domicilio') {
         obs += `Dirección: ${address}, ${city}. `;
        if (selectedZone?.nombre) obs += `Zona: ${selectedZone.nombre}. `;
        obs += `Envío: ${formatCurrency(shippingCost)}. `;
      }
      if (notes) obs += `Notas Adicionales: ${notes}`;

      const tipoEntregaBackend = deliveryType === 'domicilio' ? 'domicilio' : 'recoger_en_punto';
      const direccionEntrega = deliveryType === 'domicilio'
        ? `${address}, ${city}${selectedZone?.nombre ? ` (${selectedZone.nombre})` : ''}`
        : null;

      const payload = {
        metodo_pago: paymentMethod,
        observaciones: obs,
        tipo_entrega: tipoEntregaBackend,
        direccion_entrega: direccionEntrega,
        procedencia: 'web',
        // Al ser Cliente, el backend ignora "items" y coge el carrito directamente.
        items: [] 
      };

      const { data } = await api.post('/sales/', payload);

      const itemsSummary = (cart.items || [])
        .map((item) => `- ${item.nombre_producto} x${item.cantidad} (${formatCurrency(item.subtotal)})`)
        .join('%0A');
      const deliverySummary = deliveryType === 'domicilio'
        ? `Domicilio: ${address}, ${city}${selectedZone?.nombre ? ` (${selectedZone.nombre})` : ''}`
        : 'Recoge en tienda';
      const whatsappText = [
        `Nuevo pedido web #${data.id || ''}`,
        `Cliente: ${user?.email || 'N/D'}`,
        `Pago: ${paymentMethod}`,
        `${deliverySummary}`,
        `Envío: ${formatCurrency(shippingCost)}`,
        `Total productos: ${formatCurrency(cartTotal)}`,
        `Total final: ${formatCurrency(finalTotal)}`,
        notes ? `Notas: ${notes}` : '',
        'Items:',
        itemsSummary || '- Sin items'
      ].filter(Boolean).join('%0A');

      window.open(`https://wa.me/573001234567?text=${whatsappText}`, '_blank');
      
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
    } finally {
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
                  onClick={() => setDeliveryType('domicilio')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${deliveryType === 'domicilio' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <Truck size={24} />
                  <span className="font-bold">Envío a Domicilio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('recoger_en_punto')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${deliveryType === 'recoger_en_punto' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <Building size={24} />
                  <span className="font-bold">Recoger en Tienda</span>
                </button>
              </div>

              <AnimatePresence>
                {deliveryType === 'domicilio' && (
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
                            required={deliveryType === 'domicilio'}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase text-slate-500">Ciudad</label>
                          <input 
                            value={city} onChange={e => setCity(e.target.value)}
                            placeholder="Ej. Bogotá"
                            className="w-full h-12 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                             required={deliveryType === 'domicilio'}
                          />
                       </div>
                    </div>

                    <div className="space-y-1 mt-2">
                      <label className="text-xs font-semibold uppercase text-slate-500">Zona de Domicilio</label>
                      {loadingDeliveryConfig ? (
                        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                      ) : deliveryZones.length > 0 ? (
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <select
                            value={selectedZoneIndex}
                            onChange={(e) => setSelectedZoneIndex(e.target.value)}
                            className="w-full h-12 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            required={deliveryType === 'domicilio'}
                          >
                            {deliveryZones.map((zone, idx) => (
                              <option key={`${zone.nombre}-${idx}`} value={String(idx)}>
                                {zone.nombre} - {formatCurrency(zone.precio_base || 0)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="h-12 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl px-4 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Tarifa base de domicilio</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(baseDeliveryPrice)}</span>
                        </div>
                      )}
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
                 <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'Transferencia' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="Transferencia" 
                      checked={paymentMethod === 'Transferencia'}
                      onChange={() => setPaymentMethod('Transferencia')}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-bold flex items-center gap-2"><CreditCard size={18} className="text-primary"/> Transferencia Bancaria (Nequi / Bancolombia)</p>
                      <p className="text-sm text-slate-500 mt-1">El pedido se despachará luego de confirmar la transferencia por WhatsApp.</p>
                    </div>
                 </label>
                 
                 <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'Efectivo' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="Efectivo" 
                      checked={paymentMethod === 'Efectivo'}
                      onChange={() => setPaymentMethod('Efectivo')}
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
                        {item.urls_imagenes?.[0] ? (
                          <img src={item.urls_imagenes[0]} alt={item.nombre_producto} className="w-full h-full object-contain" />
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
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Envío</span>
                    <span className="font-medium text-green-500">
                      {deliveryType === 'recoger_en_punto' ? 'Gratis' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-slate-200 dark:border-white/10 text-slate-900 dark:text-white mt-4">
                    <span>Total a Pagar</span>
                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
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
