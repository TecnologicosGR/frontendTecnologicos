import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/SEO';
import { usePublicCatalog } from '../../features/products/hooks/usePublicCatalog';
import { useCart } from '../../features/sales/hooks/useCart';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';
import { 
  ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, Loader2, 
  CheckCircle, MessageCircle, ZoomIn, X, AlertTriangle, Sparkles 
} from 'lucide-react';
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
        <SEO title="Producto no encontrado" description="El producto que buscas no se encuentra disponible en nuestro catálogo de Valledupar." />
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-6 py-8 flex items-center justify-center">
          <div className="text-center max-w-md bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-2xl font-black mb-2">Producto no disponible</h2>
            <p className="text-slate-500 mb-6">Este producto no existe o ya no está activo en el catálogo.</p>
            <Link to="/catalogo" className="inline-flex items-center text-primary font-semibold hover:underline">
              <ArrowLeft size={16} className="mr-2" />
              Volver al catálogo
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const images = product.urls_imagenes && product.urls_imagenes.length > 0 
    ? product.urls_imagenes 
    : ['/placeholder-tech.jpg'];
    
  const categoryName = product.nombre_categoria || 'Hardware';

  // WhatsApp order link formatting
  const whatsappNumber = '573003436635'; // Official store WhatsApp
  const whatsappMessage = encodeURIComponent(
    `Hola Tecnológicos GR! 👋 Me interesa comprar el producto:\n\n*${product.nombre}*\n` +
    `*Precio:* ${formatCurrency(product.precio_venta_normal)}\n` +
    `*Cantidad:* ${qty}\n` +
    (product.codigo_barras ? `*Código:* ${product.codigo_barras}\n` : '') +
    `\n¿Tienen disponibilidad para envío en Valledupar?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Related products (same category & in stock)
  const relatedProducts = products
    .filter(p => p.id !== product.id && p.id_categoria === product.id_categoria && p.activo && (p.existencias || 0) > 0)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 pt-24 flex flex-col">
      <SEO 
        title={product.nombre} 
        description={`Comprar ${product.nombre} en Valledupar. ${product.descripcion ? product.descripcion.slice(0, 150) + '...' : 'Encuentra las mejores ofertas y accesorios con garantía oficial en Tecnológicos GR.'}`}
        keywords={`${product.nombre}, ${product.nombre} valledupar, comprar ${product.nombre}, tecnologicos valledupar`}
      />
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-6 py-8">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/catalogo" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
             <ArrowLeft size={16} className="mr-2" />
             Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          
          {/* FOTOS */}
          <div className="space-y-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               onClick={() => setIsLightboxOpen(true)}
               className="aspect-square bg-white dark:bg-[#111111] rounded-3xl border border-slate-200/60 dark:border-white/5 flex items-center justify-center p-8 relative overflow-hidden group cursor-zoom-in shadow-sm hover:shadow-md transition-all"
             >
               {product.existencias <= 0 && (
                   <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black rounded-lg uppercase tracking-wider backdrop-blur z-10">
                     Agotado
                   </div>
               )}

               <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                 <ZoomIn size={18} />
               </div>

               {images[activeImage] !== '/placeholder-tech.jpg' ? (
                 <img src={images[activeImage]} alt={product.nombre} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
               ) : (
                 <div className="text-4xl text-slate-800 font-bold opacity-20">TECNOLOGICOS</div>
               )}
             </motion.div>

             {/* Thumbnails */}
             {images.length > 1 && (
               <div className="flex gap-4 overflow-x-auto pb-2">
                 {images.map((img, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveImage(idx)}
                     className={`w-24 h-24 shrink-0 rounded-2xl bg-white dark:bg-[#111111] border-2 flex items-center justify-center p-2 transition-all ${activeImage === idx ? 'border-primary shadow-sm' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}
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
                
                <div className="inline-block w-fit mb-4">
                  <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-xs font-bold text-primary tracking-wider uppercase">{categoryName}</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                  {product.nombre}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100/50 dark:bg-yellow-950/30 rounded-full">
                     <div className="flex gap-0.5">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                       ))}
                     </div>
                     <span className="text-yellow-700 dark:text-yellow-300 font-bold">4.8</span>
                   </div>
                   {product.codigo_barras && (
                     <span className="text-slate-500 dark:text-slate-400 text-xs">Cód: <span className="font-mono font-bold">{product.codigo_barras}</span></span>
                   )}
                </div>

                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 flex items-baseline gap-3">
                   <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                     {formatCurrency(product.precio_venta_normal)}
                   </p>
                   <span className="text-sm text-slate-400 line-through">
                     {formatCurrency(product.precio_venta_normal * 1.08)}
                   </span>
                </div>

                {product.descripcion && (
                  <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Descripción del Producto</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                      {product.descripcion}
                    </p>
                  </div>
                )}

                {/* Diferenciadores Clave */}
                <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-2xl">
                     <Truck className="text-emerald-500 h-5 w-5 shrink-0" />
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white text-xs">Entrega Inmediata en Valledupar</p>
                       <p className="text-[11px] text-slate-500">Envíos locales el mismo día o retiro directo en local</p>
                     </div>
                   </div>

                   <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 p-3.5 rounded-2xl">
                     <ShieldCheck className="text-blue-500 h-5 w-5 shrink-0" />
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white text-xs">Garantía Directa de Fábrica / Tienda</p>
                       <p className="text-[11px] text-slate-500">Soporte y respaldo técnico en nuestro propio laboratorio</p>
                     </div>
                   </div>
                </div>

                {/* Acción de Compra */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-[#111111] border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
                >
                   
                   <div className="flex justify-between items-center pb-2">
                     <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Cantidad a llevar</span>
                     <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0A0A0A] rounded-xl p-1">
                       <button 
                         onClick={() => setQty(Math.max(1, qty - 1))}
                         className="h-8 w-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-bold text-base"
                       >
                         −
                       </button>
                       <div className="w-8 text-center font-black text-base">{qty}</div>
                       <button 
                         onClick={() => setQty(Math.min(product.existencias || 1, qty + 1))}
                         className="h-8 w-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-bold text-base disabled:opacity-50"
                         disabled={qty >= product.existencias}
                       >
                         +
                       </button>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <Button 
                       onClick={handleAddToCart}
                       disabled={product.existencias <= 0 || cartLoading}
                       className="h-12 text-sm font-black rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md transition-all gap-2"
                     >
                       {cartLoading ? (
                          <Loader2 className="animate-spin" size={18} />
                       ) : (
                          <>
                            <ShoppingCart size={18} /> Agregar al Carrito
                          </>
                       )}
                     </Button>

                     <a 
                       href={whatsappUrl} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full"
                     >
                       <Button 
                         variant="outline"
                         className="w-full h-12 text-sm font-bold rounded-xl border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all gap-2"
                       >
                         <MessageCircle size={18} /> Comprar por WhatsApp
                       </Button>
                     </a>
                   </div>
                   
                </motion.div>

             </motion.div>
          </div>
        </div>

        {/* Lightbox Photo Modal */}
        <AnimatePresence>
          {isLightboxOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-[#111111] p-4 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
              >
                <button 
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-10"
                >
                  <X size={20} />
                </button>
                <img 
                  src={images[activeImage]} 
                  alt={product.nombre} 
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl" 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-primary h-5 w-5" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Productos Relacionados</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link to={`/producto/${item.id}`} key={item.id} className="block group">
                  <div className="bg-white dark:bg-[#111111] rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 hover:border-primary/50 transition-all">
                    <div className="aspect-square bg-slate-50 dark:bg-[#1C1C1C] rounded-xl mb-3 p-4 flex items-center justify-center">
                      {item.urls_imagenes && item.urls_imagenes.length > 0 ? (
                        <img src={item.urls_imagenes[0]} alt={item.nombre} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">TECNOLOGICOS</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1 group-hover:text-primary">
                      {item.nombre}
                    </h4>
                    <p className="font-black text-slate-900 dark:text-white text-base">
                      {formatCurrency(item.precio_venta_normal)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>
      
      <PublicFooter />
    </div>
  );
}

