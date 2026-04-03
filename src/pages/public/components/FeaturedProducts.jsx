import React from 'react';
import { motion } from 'framer-motion';
import { usePublicCatalog } from '../../../features/products/hooks/usePublicCatalog';
import { useCart } from '../../../features/sales/hooks/useCart';
import { ShoppingCart, Star, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { formatCurrency } from '../../../lib/utils';

// Framer motion variants for staggered reveal
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function FeaturedProducts() {
  const { products, loadingProducts: loading } = usePublicCatalog();
  const { addToCart } = useCart();
  
  // Just grab the first 4 for now as featured
  const featured = products.slice(0, 4);

  const handleAdd = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(id, 1);
  };

  return (
    <section id="novedades" className="py-24 bg-white dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-slate-800/50 relative">
      
      {/* Glow background accent */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6">
        
        {/* Section Header & Categories */}
        <div className="flex flex-col mb-12">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Escaparate de Ventas</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Lo Último en Stock</h3>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <a href="/catalogo">
                <Button variant="outline" className="rounded-2xl shadow-sm hover:border-primary/50 transition-colors bg-white dark:bg-[#111111] h-12 px-6">
                  Ver Todo el Catálogo
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Quick Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center gap-3"
          >
            {['Laptops & PCs', 'Smartphones', 'Componentes', 'Accesorios', 'Gaming'].map((cat, i) => (
               <a href="/catalogo" key={i}>
                 <div className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors cursor-pointer border border-transparent dark:border-white/5">
                   {cat}
                 </div>
               </a>
            ))}
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Product Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {featured.map((product) => (
            <motion.div 
              key={product.id}
              variants={item}
              className="group relative bg-[#F9F9F9] dark:bg-[#111111] rounded-3xl p-5 border border-slate-200/60 dark:border-white/5 hover:border-primary/30 transition-colors"
            >
              {/* Image Container with hover zoom */}
              <div className="aspect-square rounded-2xl bg-white dark:bg-[#1C1C1C] mb-6 overflow-hidden flex items-center justify-center p-6 relative">
                 {product.urls_imagenes && product.urls_imagenes.length > 0 ? (
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
                      src={product.urls_imagenes[0]} 
                      alt={product.nombre} 
                      className="w-full h-full object-contain"
                    />
                 ) : (
                    <motion.div 
                       whileHover={{ scale: 1.1 }}
                       transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
                       className="w-3/4 h-3/4 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center shadow-inner"
                    >
                      <span className="text-slate-400 font-bold text-2xl opacity-20">LOGO</span>
                    </motion.div>
                 )}

                 {/* Badges */}
                 <div className="absolute top-3 left-3 flex gap-2">
                    {product.existencias <= product.stock_minimo && (
                      <span className="px-2 py-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold rounded uppercase tracking-wider">
                        Pocas unid.
                      </span>
                    )}
                 </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {product.nombre}
                  </h4>
                </div>

                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current opacity-50" />
                  <span className="text-xs text-slate-500 font-medium ml-1">4.5</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(product.precio_venta_normal)}
                  </span>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleAdd(e, product.id)}
                    className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-[0_0_0_rgba(var(--primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--primary),0.6)] transition-all z-20 relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
