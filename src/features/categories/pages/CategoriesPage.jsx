import React, { useEffect, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../../../components/ui/toast';
import { Plus, Search, Edit, Trash2, FolderOpen, Tag, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';


export default function CategoriesPage() {
  const { 
      categories, subcategories, loading, fetchCategories, createCategory, updateCategory, deleteCategory,
      fetchSubcategories, createSubcategory, deleteSubcategory
  } = useCategories();
  
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Used for both cat and subcat editing
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
      if (selectedCategory) {
          // When a category is selected, we want to see its subcategories.
          // The API might not filter by category_id directly in the search param,
          // usually one would expect GET /subcategories?category_id=X.
          // If the hook only exposes 'search', we might need to filter client side or update service.
          // Let's assume for now we fetch all and filter client side OR we added logic.
          // The service `getAllSubcategories` calls `GET /subcategories/`.
          // Let's fetch all and filter here for simplicity until API is confirmed for filtering.
          fetchSubcategories(); 
      }
  }, [selectedCategory, fetchSubcategories]);

  const filteredCategories = categories.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubcategories = subcategories.filter(s => 
      s.id_categoria === selectedCategory?.id && 
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Category Handlers ---
  const handleCreateCategory = () => {
      setEditingItem(null);
      setFormData({ nombre: '', descripcion: '' });
      setIsCatModalOpen(true);
  };

  const handleEditCategory = (cat) => {
      setEditingItem(cat);
      setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
      setIsCatModalOpen(true);
  };

  const handleDeleteCategory = async (cat) => {
      if(window.confirm(`¿Eliminar categoría "${cat.nombre}"?`)) {
          const result = await deleteCategory(cat.id);
          if (result.success) {
              if (selectedCategory?.id === cat.id) setSelectedCategory(null);
              toast({ title: "Categoría eliminada", variant: "success" });
          } else {
              toast({ title: "Error", description: result.error, variant: "destructive" });
          }
      }
  };

  const submitCategory = async (e) => {
      e.preventDefault();
      const action = editingItem ? updateCategory(editingItem.id, formData) : createCategory(formData);
      const result = await action;
      if (result.success) {
          setIsCatModalOpen(false);
          toast({ title: editingItem ? "Categoría actualizada" : "Categoría creada", variant: "success" });
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  // --- Subcategory Handlers ---
  const handleCreateSubcategory = () => {
      if (!selectedCategory) return;
      setEditingItem(null);
      setFormData({ nombre: '', id_categoria: selectedCategory.id });
      setIsSubModalOpen(true);
  };

  // Note: Update not fully implemented in Hook for Subcat yet (commented assumed PUT).
  // Assuming it works or we skip edit for subcat for now if simple. The UI will have logic.
  
  const handleDeleteSubcategory = async (sub) => {
       if(window.confirm(`¿Eliminar subcategoría "${sub.nombre}"?`)) {
          const result = await deleteSubcategory(sub.id);
          if (result.success) toast({ title: "Subcategoría eliminada", variant: "success" });
          else toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  }

  const submitSubcategory = async (e) => {
      e.preventDefault();
      // Only create implemented in this UI flow for now
      const result = await createSubcategory(formData);
      if (result.success) {
          setIsSubModalOpen(false);
          toast({ title: "Subcategoría creada", variant: "success" });
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4 p-6 bg-slate-50/50 dark:bg-slate-950/50">
       <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Categorías</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Organice su inventario en categorías y subcategorías.</p>
          </div>
       </div>

       <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Categories List (Left) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                      <FolderOpen className="h-5 w-5" />
                      Categorías Principales
                  </div>
                  <Button size="sm" onClick={handleCreateCategory} className="h-8">
                      <Plus className="h-4 w-4 mr-1" /> Nueva
                  </Button>
              </div>
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
                   <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Buscar categoría..." 
                            className="pl-9 bg-white dark:bg-slate-950" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                   </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {loading && !categories.length && <div className="p-4 text-center text-sm text-slate-400">Cargando...</div>}
                  {filteredCategories.map(cat => (
                      <div 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                            selectedCategory?.id === cat.id 
                                ? "bg-primary/5 border-primary/50 shadow-sm" 
                                : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                        )}
                      >
                          <div className="flex items-center gap-3">
                               <div className={cn(
                                   "h-8 w-8 rounded flex items-center justify-center transition-colors",
                                   selectedCategory?.id === cat.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                               )}>
                                    <span className="font-bold text-xs">{cat.nombre.substring(0,2).toUpperCase()}</span>
                               </div>
                               <div>
                                   <p className={cn("text-sm font-medium", selectedCategory?.id === cat.id ? "text-primary dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                                       {cat.nombre}
                                   </p>
                                   <p className="text-xs text-slate-500 truncate max-w-[150px]">{cat.descripcion || 'Sin descripción'}</p>
                               </div>
                          </div>
                          
                          {selectedCategory?.id === cat.id && (
                              <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }}>
                                      <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* Subcategories List (Right) */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed overflow-hidden">
             {selectedCategory ? (
                 <>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subcategorías de</span>
                            <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                                {selectedCategory.nombre}
                            </div>
                        </div>
                        <Button size="sm" onClick={handleCreateSubcategory} className="h-8">
                            <Plus className="h-4 w-4 mr-1" /> Agregar Subcategoría
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 content-start grid content-start gap-2">
                        {filteredSubcategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                                <p className="text-sm">No hay subcategorías registradas.</p>
                            </div>
                        ) : (
                            filteredSubcategories.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Tag className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{sub.nombre}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500" onClick={() => handleDeleteSubcategory(sub)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                 </>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                     <ArrowRight className="h-10 w-10 mb-4 opacity-20" />
                     <p className="font-medium">Seleccione una categoría</p>
                     <p className="text-sm">para ver o gestionar sus subcategorías.</p>
                 </div>
             )}
          </div>
       </div>

       {/* Category Modal */}
       {isCatModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
                   <h2 className="text-lg font-bold mb-4">{editingItem ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                   <form onSubmit={submitCategory} className="space-y-4">
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Nombre</label>
                           <Input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Descripción</label>
                           <Input value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                       </div>
                       <div className="flex justify-end gap-2 mt-6">
                           <Button type="button" variant="ghost" onClick={() => setIsCatModalOpen(false)}>Cancelar</Button>
                           <Button type="submit">Guardar</Button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       {/* Subcategory Modal */}
       {isSubModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
                   <h2 className="text-lg font-bold mb-4">Nueva Subcategoría en "{selectedCategory?.nombre}"</h2>
                   <form onSubmit={submitSubcategory} className="space-y-4">
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Nombre</label>
                           <Input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                       </div>
                       <div className="flex justify-end gap-2 mt-6">
                           <Button type="button" variant="ghost" onClick={() => setIsSubModalOpen(false)}>Cancelar</Button>
                           <Button type="submit">Guardar</Button>
                       </div>
                   </form>
               </div>
           </div>
       )}

    </div>
  );
}
