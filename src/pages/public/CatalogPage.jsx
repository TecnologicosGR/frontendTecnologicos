import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '../../features/products/hooks/useProducts';
import { useCategories } from '../../features/categories/hooks/useCategories';
import { useCart } from '../../features/sales/hooks/useCart';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';
import { ShoppingCart, Star, Filter, Loader2, X, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function CatalogPage() {
  const { products, loading: loadingProducts, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { addToCart } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.codigo_barras && p.codigo_barras.includes(searchTerm));
    const matchesCategory = selectedCategory ? p.id_categoria === selectedCategory : true;
    return matchesSearch && matchesCategory && p.activo;
  });

  const handleAdd = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(id, 1);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 flex flex-col pt-20">
      <PublicNavbar />
      
      {/* Search & Header Bar */}
      <div className="bg-white dark:bg-[#111111] border-b border-slate-200/60 dark:border-slate-800/50 pt-8 pb-4 sticky top-16 lg:top-20 z-40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input 
              placeholder="Buscar productos por nombre o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-[#F9F9F9] dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 focus:ring-primary rounded-xl"
            />
          </div>
          
          <Button 
            variant="outline" 
            className="md:hidden w-full flex items-center gap-2 h-12 rounded-xl border-slate-200 dark:border-slate-800"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter size={18} /> Filtros
          </Button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-6 py-8 flex gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-40 space-y-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Categorías</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Todas las categorías
                </button>
                {categories.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === c.id ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Can add pure price sliders here later */}
          </div>
        </aside>

        {/* Mobile Filters Drawer */}
        {isFilterOpen && (
           <div className="fixed inset-0 z-50 flex justify-end md:hidden">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               className="relative w-4/5 max-w-sm bg-white dark:bg-[#111111] h-full shadow-2xl p-6 overflow-y-auto"
             >
               <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold text-xl">Filtros</h2>
                 <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                   <X size={20} />
                 </button>
               </div>
               
               <h3 className="font-bold text-lg mb-4">Categorías</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => { setSelectedCategory(null); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${!selectedCategory ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Todas las categorías
                  </button>
                  {categories.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => { setSelectedCategory(c.id); setIsFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${selectedCategory === c.id ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
             </motion.div>
           </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loadingProducts ? (
             <div className="flex items-center justify-center py-32">
               <Loader2 className="animate-spin text-primary h-12 w-12" />
             </div>
          ) : filteredProducts.length === 0 ? (
             <div className="text-center py-32 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-slate-800">
               <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No encontramos resultados</h3>
               <p className="text-slate-500">Prueba con otras palabras o quita los filtros.</p>
               <Button onClick={() => {setSearchTerm(''); setSelectedCategory(null)}} variant="link" className="mt-4 text-primary">
                 Limpiar Filtros
               </Button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               <div className="col-span-full mb-2">
                  <p className="text-sm font-medium text-slate-500">Mostrando {filteredProducts.length} producto(s)</p>
               </div>
               
               {filteredProducts.map((product) => (
                 <Link to={`/producto/${product.id}`} key={product.id} className="block group">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full bg-white dark:bg-[#111111] rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 hover:border-primary/50 transition-all flex flex-col"
                  >
                    <div className="aspect-square rounded-xl bg-slate-50 dark:bg-[#1C1C1C] mb-4 overflow-hidden flex items-center justify-center p-4 relative">
                      {product.urls_imagenes && product.urls_imagenes.length > 0 ? (
                          <img 
                            src={product.urls_imagenes[0]} 
                            alt={product.nombre} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                          />
                      ) : (
                          <div className="w-1/2 h-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-inner flex items-center justify-center text-slate-300 font-bold opacity-30 group-hover:scale-110 transition-transform duration-500">
                            LOGO
                          </div>
                      )}
                      
                      {product.existencias <= product.stock_minimo && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg">
                          ¡Últimas {product.existencias}!
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {product.nombre}
                        </h4>
                        <div className="flex items-center gap-1 text-yellow-500 mb-4">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-[10px] text-slate-500 font-bold ml-1">4.5</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-col">
                           <span className="text-xs text-slate-400 line-through decoration-slate-400">
                              {formatCurrency(product.precio_venta_normal * 1.05)}
                           </span>
                           <span className="text-xl font-black text-slate-900 dark:text-white">
                             {formatCurrency(product.precio_venta_normal)}
                           </span>
                        </div>
                        
                        <Button 
                          size="icon" 
                          onClick={(e) => handleAdd(e, product.id)}
                          className="h-9 w-9 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-colors z-20"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                 </Link>
               ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
