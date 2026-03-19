import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../../features/products/hooks/useProducts';
import { useCart } from '../../features/sales/hooks/useCart';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, Loader2, Plus, Minus, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading: loadingProducts, fetchProducts } = useProducts();
  const { addToCart, loading: cartLoading } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(p => p.id === parseInt(id));
      setProduct(found);
    }
  }, [id, products]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, qty);
  };

  if (loadingProducts || !product) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] flex items-center justify-center">
        <PublicNavbar />
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );
  }

  const images = product.urls_imagenes && product.urls_imagenes.length > 0 
    ? product.urls_imagenes 
    : ['/placeholder-tech.jpg']; // O imagen vacía
    
  // Asumiendo que las subcategorías existen, en caso contrario mostramos categoría principal
  const categoryName = product.categoria ? product.categoria.nombre : 'Hardware';

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
                
                <div className="text-sm font-bold tracking-widest text-primary uppercase mb-3 flex items-center gap-2">
                  <span>{categoryName}</span>
                  {product.marca && <>
                     <span className="w-1 h-1 bg-slate-400 rounded-full" />
                     <span className="text-slate-500 dark:text-slate-400">{product.marca}</span>
                  </>}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] mb-4">
                  {product.nombre}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium">
                   <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">
                     <Star size={16} className="fill-current mr-1" />
                     4.8 <span className="text-slate-500 ml-1">(120 reseñas)</span>
                   </div>
                   {product.codigo_barras && (
                     <span className="text-slate-400">SKU: {product.codigo_barras}</span>
                   )}
                </div>

                <div className="mb-8">
                   <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                     {formatCurrency(product.precio_venta_normal)}
                   </p>
                   <p className="text-sm text-green-500 font-bold mt-2">
                     Precio incluye todos los impuestos.
                   </p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 mb-8 font-medium">
                  {product.descripcion ? product.descripcion : "Descripción completa no disponible. Equipo de última generación ideal para gaming y productividad."}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#1A1A1A] p-4 rounded-2xl">
                     <ShieldCheck className="text-primary h-6 w-6 shrink-0" />
                     <div className="text-sm">
                       <p className="font-bold text-slate-900 dark:text-white leading-tight">Garantía Protegida</p>
                       <p className="text-slate-500">12 meses de cobertura</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#1A1A1A] p-4 rounded-2xl">
                     <Truck className="text-primary h-6 w-6 shrink-0" />
                     <div className="text-sm">
                       <p className="font-bold text-slate-900 dark:text-white leading-tight">Envío Seguro</p>
                       <p className="text-slate-500">Llega en 48 hrs</p>
                     </div>
                   </div>
                </div>

                {/* Acción de Compra */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-slate-200/10 dark:shadow-none">
                   
                   <div className="flex justify-between items-center mb-6">
                     <span className="font-semibold text-slate-700 dark:text-slate-300">Cantidad</span>
                     <div className="flex items-center bg-slate-100 dark:bg-[#1A1A1A] rounded-xl p-1">
                       <button 
                         onClick={() => setQty(Math.max(1, qty - 1))}
                         className="h-10 w-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-900 dark:text-white"
                       >
                         <Minus size={18} />
                       </button>
                       <div className="w-12 text-center font-bold text-lg">{qty}</div>
                       <button 
                         onClick={() => setQty(Math.min(product.existencias || 1, qty + 1))}
                         className="h-10 w-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                         disabled={qty >= product.existencias}
                       >
                         <Plus size={18} />
                       </button>
                     </div>
                   </div>

                   <Button 
                     onClick={handleAddToCart}
                     disabled={product.existencias <= 0 || cartLoading}
                     className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary),0.5)] transition-all gap-3"
                   >
                     {cartLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                     ) : product.existencias > 0 ? (
                       <>
                         <ShoppingCart size={24} /> Agregar al Carrito
                       </>
                     ) : (
                       "Producto Agotado"
                     )}
                   </Button>
                   
                   <p className="text-center text-sm font-medium text-slate-500 mt-4 flex justify-center items-center gap-2">
                     <CheckCircle size={16} className="text-green-500" />
                     {product.existencias} unidades disponibles
                   </p>
                </div>

             </motion.div>
          </div>
        </div>

      </main>
      
      <PublicFooter />
    </div>
  );
}
