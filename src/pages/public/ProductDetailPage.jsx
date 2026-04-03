import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicCatalog } from '../../features/products/hooks/usePublicCatalog';
import { useCart } from '../../features/sales/hooks/useCart';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, loadingProducts, getProductById } = usePublicCatalog();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let mounted = true;

    const numericId = parseInt(id, 10);
    const found = products.find(p => p.id === numericId);

    if (found) {
      setProduct(found);
      setNotFound(false);
      return;
    }

    getProductById(numericId)
      .then((data) => {
        if (mounted) {
          setProduct(data);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setProduct(null);
          setNotFound(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, products, getProductById]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, qty);
  };

  if (loadingProducts && !product && !notFound) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] flex items-center justify-center">
        <PublicNavbar />
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 pt-24 flex flex-col">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-6 py-8 flex items-center justify-center">
          <div className="text-center max-w-md bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-black mb-2">Producto no disponible</h2>
            <p className="text-slate-500 mb-6">Este producto no existe o ya no esta activo en el catalogo.</p>
            <Link to="/catalogo" className="inline-flex items-center text-primary font-semibold hover:underline">
              <ArrowLeft size={16} className="mr-2" />
              Volver al catalogo
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const images = product.urls_imagenes && product.urls_imagenes.length > 0 
    ? product.urls_imagenes 
    : ['/placeholder-tech.jpg']; // O imagen vacía
    
  // Asumiendo que las subcategorías existen, en caso contrario mostramos categoría principal
  const categoryName = product.nombre_categoria || 'Hardware';

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 pt-24 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-6 py-8">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/catalogo" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
             <ArrowLeft size={16} className="mr-2" />
             Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* FOTOS */}
          <div className="space-y-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-square bg-white dark:bg-[#111111] rounded-3xl border border-slate-200/60 dark:border-white/5 flex items-center justify-center p-8 relative overflow-hidden group"
             >
               {product.existencias <= 0 && (
                   <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black rounded-lg uppercase tracking-wider backdrop-blur z-10">
                     Agotado
                   </div>
               )}
               {images[activeImage] !== '/placeholder-tech.jpg' ? (
                 <img src={images[activeImage]} alt={product.nombre} className="w-full h-full object-contain" />
               ) : (
                 <div className="text-4xl text-slate-800 font-bold opacity-20">LOGO</div>
               )}
             </motion.div>

             {/* Thumbnails */}
             {images.length > 1 && (
               <div className="flex gap-4 overflow-x-auto pb-2">
                 {images.map((img, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveImage(idx)}
                     className={`w-24 h-24 shrink-0 rounded-xl bg-white dark:bg-[#111111] border-2 flex items-center justify-center p-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}
                   >
                     <img src={img} alt="thumb" className="w-full h-full object-contain" />
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* INFORMACIÓN Y CTA */}
          <div className="flex flex-col">
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                
                <div className="inline-block w-fit mb-6">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 dark:border-primary/30">
                    <span className="text-sm font-bold text-primary">{categoryName.toUpperCase()}</span>
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.2] mb-6">
                  {product.nombre}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-medium">
                   <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100/50 dark:bg-yellow-950/30 rounded-full">
                     <div className="flex gap-0.5">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                       ))}
                     </div>
                     <span className="text-yellow-700 dark:text-yellow-300 font-bold">4.8</span>
                   </div>
                   {product.codigo_barras && (
                     <span className="text-slate-500 dark:text-slate-400">Código: <span className="font-mono font-bold">{product.codigo_barras}</span></span>
                   )}
                </div>

                <div className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
                   <p className="text-5xl font-black text-slate-900 dark:text-white mb-2">
                     {formatCurrency(product.precio_venta_normal)}
                   </p>
                </div>

                {product.descripcion && (
                  <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {product.descripcion}
                    </p>
                  </div>
                )}

                {/* Diferenciadores Clave */}
                <div className="space-y-3 mb-8">
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 }}
                     className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 p-4 rounded-2xl"
                   >
                     <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                       <Truck className="text-emerald-600 dark:text-emerald-400 h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white text-sm">Entrega Inmediata</p>
                       <p className="text-xs text-slate-600 dark:text-slate-400">Retira en nuestro local, o te lo llevamos a tu casa</p>
                     </div>
                   </motion.div>

                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 }}
                     className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 p-4 rounded-2xl"
                   >
                     <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                       <ShieldCheck className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white text-sm">Satisfacción Garantizada</p>
                       <p className="text-xs text-slate-600 dark:text-slate-400">Devolución sin preguntas si no te agrada</p>
                     </div>
                   </motion.div>
                </div>

                {/* Acción de Compra */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-white to-slate-50 dark:from-[#111111] dark:to-[#1A1A1A] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-lg shadow-slate-200/20 dark:shadow-none"
                >
                   
                   <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                     <div className="flex justify-between items-center">
                       <span className="font-semibold text-slate-700 dark:text-slate-300">Cantidad a llevar</span>
                       <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0A0A0A] rounded-lg p-0.5">
                         <button 
                           onClick={() => setQty(Math.max(1, qty - 1))}
                           className="h-9 w-9 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-900 dark:text-white font-bold text-lg"
                         >
                           −
                         </button>
                         <div className="w-12 text-center font-black text-lg text-slate-900 dark:text-white">{qty}</div>
                         <button 
                           onClick={() => setQty(Math.min(product.existencias || 1, qty + 1))}
                           className="h-9 w-9 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-900 dark:text-white font-bold text-lg disabled:opacity-50"
                           disabled={qty >= product.existencias}
                         >
                           +
                         </button>
                       </div>
                     </div>
                   </div>

                   <Button 
                     onClick={handleAddToCart}
                     disabled={product.existencias <= 0 || cartLoading}
                     className="w-full h-14 text-lg font-black rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {cartLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                     ) : product.existencias > 0 ? (
                       <>
                         <ShoppingCart size={20} /> Agregar al Carrito
                       </>
                     ) : (
                       "Producto Agotado"
                     )}
                   </Button>
                   
                   <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm text-slate-600 dark:text-slate-400">Stock disponible:</span>
                       <span className={`text-sm font-bold ${product.existencias > 5 ? 'text-emerald-600 dark:text-emerald-400' : product.existencias > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                         {product.existencias > 0 ? `${product.existencias} unidades` : 'Agotado'}
                       </span>
                     </div>
                     <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className={`h-full transition-all ${product.existencias > 5 ? 'bg-emerald-500' : product.existencias > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                         style={{ width: `${Math.min((product.existencias / 50) * 100, 100)}%` }}
                       />
                     </div>
                   </div>
                </motion.div>

             </motion.div>
          </div>
        </div>

      </main>
      
      <PublicFooter />
    </div>
  );
}
