import React, { useEffect, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../../categories/hooks/useCategories'; // To populate filters
import { useToast } from '../../../components/ui/toast';
import ProductForm from '../components/ProductForm';
import ProductImportModal from '../components/ProductImportModal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Search, Plus, Filter, Box, AlertTriangle, CheckCircle, Tag, Upload, FileSpreadsheet } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function ProductsPage() {
  const { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Client-side filtering for search & category (if API params not fully used or for responsivenes)
  // Ideally we use server-side params for scale. The hook supports it.
  // Let's implement debounce for search? Or just simple effect.
  
  useEffect(() => {
      // Re-fetch when filters change (Server-side strategy)
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category_id = filterCategory;
      
      const timeout = setTimeout(() => {
          fetchProducts(params);
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeout);
  }, [searchTerm, filterCategory, fetchProducts]);


  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      const result = await deleteProduct(id);
      if (result.success) {
        toast({ title: 'Producto eliminado', variant: 'success' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    }
  };

  const handleSubmit = async (data) => {
    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, data);
    } else {
      result = await createProduct(data);
    }

    if (result.success) {
      setIsModalOpen(false);
      toast({ 
        title: editingProduct ? "Producto Actualizado" : "Producto Creado",
        variant: "success" 
      });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  return (
    <main className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventario de Productos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestione su catálogo, existencias y precios.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Importar Excel
            </Button>
            <Button onClick={handleCreate} className="shadow-md hover:shadow-lg transition-all active:scale-95">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Producto
            </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input 
                className="block w-full pl-10 pr-3 py-2 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="Buscar por nombre, código..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto">
             <Filter className="h-4 w-4 text-slate-500" />
             <select 
                className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm focus:outline-none focus:border-primary w-full md:w-[200px]"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
             >
                 <option value="">Todas las Categorías</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
             </select>
         </div>
      </div>

      {/* Products Grid/Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && products.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400">Cargando productos...</div>
          ) : products.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center">
                  <Box className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No se encontraron productos.</p>
              </div>
          ) : (
              products.map(product => (
                  <div key={product.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
                      {/* Image Placeholder */}
                      <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                          <Box className="h-12 w-12 text-slate-300" />
                          <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm" onClick={() => handleEdit(product)}>
                                 {/* Use a simple pencil icon or similar */}
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                              </Button>
                              <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-sm" onClick={() => handleDelete(product.id)}>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </Button>
                          </div>
                          
                          {/* Stock Badge */}
                          <div className={cn(
                              "absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm",
                              product.existencias <= product.stock_minimo 
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          )}>
                              {product.existencias <= product.stock_minimo ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                              {product.existencias} en stock
                          </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-1">
                              <span className="text-xs font-mono text-slate-400">{product.codigo_referencia}</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {product.nombre_categoria || 'Generico'}
                              </span>
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2" title={product.nombre}>{product.nombre}</h3>
                          
                          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div className="flex flex-col">
                                  <span className="text-xs text-slate-400">Precio Público</span>
                                  <span className="font-bold text-lg text-primary">${product.precio_venta_normal?.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                  <span className="text-xs text-slate-400">Técnico</span>
                                  <span className="font-medium text-sm text-slate-600 dark:text-slate-400">${product.precio_venta_tecnico?.toLocaleString()}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>

      <ProductForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingProduct} 
      />

      <ProductImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </main>
  );
}
