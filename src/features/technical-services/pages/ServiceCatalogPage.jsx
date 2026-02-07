import React, { useEffect, useState } from 'react';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Plus, Search, ClipboardList, DollarSign, PenTool } from 'lucide-react';

export default function ServiceCatalogPage() {
  const { catalog, loading, fetchCatalog, createCatalogItem } = useServiceCatalog();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre_servicio: '', precio_sugerido: '' });

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const filteredCatalog = catalog.filter(item => 
      item.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
      e.preventDefault();
      const payload = {
          nombre_servicio: formData.nombre_servicio,
          precio_sugerido: parseFloat(formData.precio_sugerido)
      };
      
      const result = await createCatalogItem(payload);
      if (result.success) {
          setIsModalOpen(false);
          setFormData({ nombre_servicio: '', precio_sugerido: '' });
          toast({ title: "Servicio creado", variant: "success" });
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Catálogo de Servicios</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Defina los tipos de reparaciones y sus precios base.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="shadow-md">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Servicio
          </Button>
       </div>

       {/* Search */}
       <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input 
                className="block w-full pl-10 pr-3 py-3 border rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="Buscar servicio..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {loading && !catalog.length && <div className="text-slate-400">Cargando catálogo...</div>}
           
           {filteredCatalog.map(item => (
               <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between group">
                   <div>
                       <div className="flex items-center gap-3 mb-3">
                           <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg flex items-center justify-center">
                               <PenTool className="h-5 w-5" />
                           </div>
                           <h3 className="font-bold text-lg">{item.nombre_servicio}</h3>
                       </div>
                   </div>
                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                       <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Precio Sugerido</span>
                       <span className="font-bold text-lg text-slate-700 dark:text-slate-200">
                           ${item.precio_sugerido?.toLocaleString()}
                       </span>
                   </div>
               </div>
           ))}
       </div>

       {/* Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
                   <h2 className="text-lg font-bold mb-4">Nuevo Servicio</h2>
                   <form onSubmit={handleSubmit} className="space-y-4">
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Nombre del Servicio</label>
                           <Input required value={formData.nombre_servicio} onChange={e => setFormData({...formData, nombre_servicio: e.target.value})} placeholder="Ej. Formateo Windows" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Precio Sugerido</label>
                           <div className="relative">
                               <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                               <Input type="number" required className="pl-7" value={formData.precio_sugerido} onChange={e => setFormData({...formData, precio_sugerido: e.target.value})} />
                           </div>
                       </div>
                       <div className="flex justify-end gap-2 mt-6">
                           <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                           <Button type="submit">Guardar</Button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
}
