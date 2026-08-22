import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/SEO';
import { usePublicCatalog } from '../../features/products/hooks/usePublicCatalog';
import { useCart } from '../../features/sales/hooks/useCart';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';
import { 
  ShoppingCart, Star, Loader2, X, Search, 
  ArrowUpDown, SlidersHorizontal, RotateCcw, CheckCircle2, Tag 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function CatalogPage() {
  const { products, categories, loadingProducts } = usePublicCatalog();
  const { addToCart } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter products: MUST be active and have existencias > 0
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const hasStock = (p.existencias || 0) > 0;
        if (!hasStock || !p.activo) return false;

        const matchesSearch = 
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (p.codigo_barras && p.codigo_barras.includes(searchTerm));
        
        const matchesCategory = selectedCategory ? p.id_categoria === selectedCategory : true;
        
        const price = Number(p.precio_venta_normal || 0);
        const matchesMinPrice = minPrice === '' || price >= Number(minPrice);
        const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice);

        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return (a.precio_venta_normal || 0) - (b.precio_venta_normal || 0);
        if (sortBy === 'price_desc') return (b.precio_venta_normal || 0) - (a.precio_venta_normal || 0);
        if (sortBy === 'name_asc') return a.nombre.localeCompare(b.nombre);
        return 0;
      });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

  // Count available products per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      if (p.activo && (p.existencias || 0) > 0 && p.id_categoria) {
        counts[p.id_categoria] = (counts[p.id_categoria] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const hasActiveFilters = Boolean(searchTerm || selectedCategory || minPrice || maxPrice || sortBy !== 'featured');

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
  };

  const handleAdd = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(id, 1);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 flex flex-col pt-20">
      <SEO 
        title="Catálogo de Productos" 
        description="Explora nuestro catálogo de tecnología en Valledupar. Celulares, accesorios, repuestos y componentes con disponibilidad inmediata y garantía oficial."
        keywords="comprar celulares valledupar, accesorios tecnologicos valledupar, repuestos celulares valledupar, tienda de tecnologia valledupar"
      />
      <PublicNavbar />
      
      {/* Search & Header Bar */}
      <div className="bg-white dark:bg-[#111111] border-b border-slate-200/60 dark:border-slate-800/50 pt-8 pb-4 sticky top-16 lg:top-20 z-40 shadow-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="flex-1 w-full max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input 
              placeholder="Buscar productos por nombre, modelo o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-10 h-12 bg-[#F9F9F9] dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 focus:ring-primary rounded-xl text-base"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Sort Selector & Mobile Filter Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 bg-[#F9F9F9] dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl px-3 h-12">
              <ArrowUpDown size={16} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
              >
                <option value="featured" className="bg-white dark:bg-[#111111]">Destacados</option>
                <option value="price_asc" className="bg-white dark:bg-[#111111]">Precio: Menor a Mayor</option>
                <option value="price_desc" className="bg-white dark:bg-[#111111]">Precio: Mayor a Menor</option>
                <option value="name_asc" className="bg-white dark:bg-[#111111]">Nombre A - Z</option>
              </select>
            </div>

            <Button 
              variant="outline" 
              className="md:hidden flex items-center gap-2 h-12 rounded-xl border-slate-200 dark:border-slate-800"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal size={18} /> Filtros {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="container mx-auto px-6 mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0">Filtros activos:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">
                Categoría: {categories.find(c => c.id === selectedCategory)?.nombre}
                <X size={12} className="cursor-pointer hover:opacity-75" onClick={() => setSelectedCategory(null)} />
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">
                Precio: ${minPrice || '0'} - ${maxPrice || '∞'}
                <X size={12} className="cursor-pointer hover:opacity-75" onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
              </span>
            )}
            <button 
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-red-500 font-semibold underline ml-2 shrink-0"
            >
              <RotateCcw size={12} /> Limpiar todo
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 container mx-auto px-6 py-8 flex gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 space-y-8">
            
            {/* Categorías */}
            <div>
              <h3 className="font-bold text-base mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <Tag size={18} className="text-primary" /> Categorías
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span>Todas</span>
                  <span className="text-xs font-normal opacity-75">
                    ({products.filter(p => p.activo && (p.existencias || 0) > 0).length})
                  </span>
                </button>
                {categories.map(c => {
                  const count = categoryCounts[c.id] || 0;
                  return (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === c.id ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <span className="truncate">{c.nombre}</span>
                      <span className="text-xs font-normal opacity-75 ml-2">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rango de Precio */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" /> Rango de Precio
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <Input
                  type="number"
                  placeholder="Min ($)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-10 text-xs bg-white dark:bg-[#111111] rounded-lg"
                />
                <span className="text-slate-400 font-bold">-</span>
                <Input
                  type="number"
                  placeholder="Max ($)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-10 text-xs bg-white dark:bg-[#111111] rounded-lg"
                />
              </div>
            </div>
            
          </div>
        </aside>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
             <div className="fixed inset-0 z-50 flex justify-end md:hidden">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                 onClick={() => setIsFilterOpen(false)} 
               />
               <motion.div 
                 initial={{ x: '100%' }}
                 animate={{ x: 0 }}
                 exit={{ x: '100%' }}
                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                 className="relative w-4/5 max-w-sm bg-white dark:bg-[#111111] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
               >
                 <div>
                   <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                     <h2 className="font-bold text-xl flex items-center gap-2">
                       <SlidersHorizontal size={20} className="text-primary" /> Filtros
                     </h2>
                     <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                       <X size={20} />
                     </button>
                   </div>
                   
                   {/* Categorías Mobile */}
                   <div className="mb-6">
                     <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-slate-400">Categorías</h3>
                     <div className="space-y-1">
                       <button 
                         onClick={() => { setSelectedCategory(null); setIsFilterOpen(false); }}
                         className={`w-full flex justify-between px-3 py-2 rounded-xl text-sm font-medium ${!selectedCategory ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}
                       >
                         <span>Todas las categorías</span>
                       </button>
                       {categories.map(c => (
                         <button 
                           key={c.id}
                           onClick={() => { setSelectedCategory(c.id); setIsFilterOpen(false); }}
                           className={`w-full flex justify-between px-3 py-2 rounded-xl text-sm font-medium ${selectedCategory === c.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}
                         >
                           <span>{c.nombre}</span>
                           <span className="text-xs opacity-75">({categoryCounts[c.id] || 0})</span>
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Precio Mobile */}
                   <div className="mb-6">
                     <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-slate-400">Precio ($)</h3>
                     <div className="flex items-center gap-2">
                       <Input
                         type="number"
                         placeholder="Min"
                         value={minPrice}
                         onChange={(e) => setMinPrice(e.target.value)}
                         className="h-10 text-sm"
                       />
                       <span>-</span>
                       <Input
                         type="number"
                         placeholder="Max"
                         value={maxPrice}
                         onChange={(e) => setMaxPrice(e.target.value)}
                         className="h-10 text-sm"
                       />
                     </div>
                   </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                   <Button 
                     onClick={() => setIsFilterOpen(false)}
                     className="w-full bg-primary text-white font-bold h-12 rounded-xl"
                   >
                     Ver {filteredProducts.length} Resultados
                   </Button>
                   {hasActiveFilters && (
                     <Button 
                       onClick={handleClearFilters}
                       variant="ghost"
                       className="w-full text-slate-500 text-xs"
                     >
                       Limpiar Filtros
                     </Button>
                   )}
                 </div>
               </motion.div>
             </div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          {loadingProducts ? (
             <div className="flex items-center justify-center py-32">
               <Loader2 className="animate-spin text-primary h-12 w-12" />
             </div>
          ) : filteredProducts.length === 0 ? (
             <div className="text-center py-24 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No encontramos productos en stock</h3>
               <p className="text-slate-500 max-w-sm mx-auto text-sm mb-6">
                 {hasActiveFilters 
                   ? 'No hay productos disponibles que coincidan con los filtros seleccionados.' 
                   : 'Actualmente no hay productos con existencias para esta categoría.'}
               </p>
               {hasActiveFilters && (
                 <Button onClick={handleClearFilters} variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/10">
                   Limpiar Filtros
                 </Button>
               )}
             </div>
          ) : (
             <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                 <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                   Mostrando <span className="text-slate-900 dark:text-white font-bold">{filteredProducts.length}</span> producto(s) disponible(s)
                 </p>
                 <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                   <CheckCircle2 size={14} /> Con disponibilidad inmediata
                 </span>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filteredProducts.map((product) => (
                   <Link to={`/producto/${product.id}`} key={product.id} className="block group">
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3 }}
                       className="h-full bg-white dark:bg-[#111111] rounded-2xl p-4 border border-slate-200/60 dark:border-white/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between"
                     >
                       <div className="aspect-square rounded-xl bg-slate-50 dark:bg-[#1C1C1C] mb-4 overflow-hidden flex items-center justify-center p-4 relative">
                         {product.urls_imagenes && product.urls_imagenes.length > 0 ? (
                             <img 
                               src={product.urls_imagenes[0]} 
                               alt={product.nombre} 
                               className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                             />
                         ) : (
                             <div className="w-1/2 h-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-inner flex items-center justify-center text-slate-400 font-bold text-xs opacity-40 group-hover:scale-105 transition-transform duration-500">
                               TECNOLOGICOS
                             </div>
                         )}
                       </div>

                       <div className="flex-1 flex flex-col justify-between">
                         <div>
                           <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                             {product.nombre}
                           </h4>
                           <div className="flex items-center gap-1 text-yellow-500 mb-3">
                             <Star className="h-3.5 w-3.5 fill-current" />
                             <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-1">4.8</span>
                           </div>
                         </div>
                         
                         <div className="flex items-end justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
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
                             title="Agregar al carrito"
                             className="h-10 w-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all shadow-sm z-20"
                           >
                             <ShoppingCart className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     </motion.div>
                   </Link>
                 ))}
               </div>
             </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
