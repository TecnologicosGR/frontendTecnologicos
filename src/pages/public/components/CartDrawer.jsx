import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../features/sales/hooks/useCart';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { formatCurrency } from '../../../lib/utils';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, loading, updateCartItem, removeFromCart, isDrawerOpen, setIsDrawerOpen } = useCart();

  const handleUpdate = (id, newQty) => {
    if (newQty < 0) return;
    if (newQty === 0) {
      removeFromCart(id);
    } else {
      updateCartItem(id, newQty);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white dark:bg-[#0A0A0A] shadow-2xl z-[1000] border-l border-slate-200 dark:border-white/5 flex flex-col"
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="text-primary" /> Mi Carrito
              </h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#111111] rounded-xl transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-[#111111] rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tu carrito está vacío</h3>
                  <p className="text-slate-500 max-w-[250px]">Parece que aún no has añadido productos a tu carrito. ¡Explora nuestro catálogo!</p>
                  <Button onClick={() => setIsDrawerOpen(false)} className="mt-8" variant="outline">
                    Seguir Comprando
                  </Button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {cart.items.map((item) => (
                    <li key={item.id_producto} className="flex gap-4">
                      
                      <div className="w-20 h-20 bg-slate-100 dark:bg-[#111111] rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-white/5 relative">
                        {loading && <div className="absolute inset-0 bg-white/50 animate-pulse z-10" />}
                        {item.url_imagen ? (
                          <img src={item.url_imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-300">N/A</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                         <div className="flex justify-between items-start">
                           <div>
                             <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{item.nombre_producto}</h4>
                             <p className="text-xs text-slate-500 mt-1">Precio ud: {formatCurrency(item.precio_unitario)}</p>
                           </div>
                           <button 
                             onClick={() => removeFromCart(item.id_producto)}
                             className="text-slate-400 hover:text-red-500 transition-colors p-1"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>

                         <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-slate-100 dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-white/5">
                              <button 
                                onClick={() => handleUpdate(item.id_producto, item.cantidad - 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 rounded-l-lg transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-50"
                                disabled={loading}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                              <button 
                                onClick={() => handleUpdate(item.id_producto, item.cantidad + 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 rounded-r-lg transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-50"
                                disabled={loading}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <p className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(item.subtotal)}
                            </p>
                         </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Summary */}
            {cart.items.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111111] mt-auto">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Impuestos (IVA incl.)</span>
                    <span>{formatCurrency(cart.impuestos)}</span>
                  </div>
                  <div className="flex justify-between font-black text-xl text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-white/10">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cart.total)}</span>
                  </div>
                </div>

                <Link to="/checkout" onClick={() => setIsDrawerOpen(false)} className="w-full">
                  <Button className="w-full h-14 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
                    Tramitar Pedido <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
