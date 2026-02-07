import React, { useEffect, useState } from 'react';
import { useProviders } from '../hooks/useProviders';
import { useToast } from '../../../components/ui/toast';
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';


export default function ProvidersPage() {
  const { providers, loading, fetchProviders, createProvider, updateProvider, deleteProvider } = useProviders();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({ 
      nombre_empresa: '', 
      contacto_nombre: '', 
      email: '', 
      telefono: '' 
  });

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const filteredProviders = providers.filter(p => 
      p.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contacto_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
      setEditingProvider(null);
      setFormData({ nombre_empresa: '', contacto_nombre: '', email: '', telefono: '' });
      setIsModalOpen(true);
  };

  const handleEdit = (provider) => {
      setEditingProvider(provider);
      setFormData({
          nombre_empresa: provider.nombre_empresa,
          contacto_nombre: provider.contacto_nombre || '',
          email: provider.email || '',
          telefono: provider.telefono || ''
      });
      setIsModalOpen(true);
  };

  const handleDelete = async (provider) => {
      if(window.confirm(`¿Eliminar proveedor "${provider.nombre_empresa}"?`)) {
          const result = await deleteProvider(provider.id);
          if (result.success) toast({ title: "Proveedor eliminado", variant: "success" });
          else toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const action = editingProvider ? updateProvider(editingProvider.id, formData) : createProvider(formData);
      const result = await action;
      if (result.success) {
          setIsModalOpen(false);
          toast({ title: editingProvider ? "Proveedor actualizado" : "Proveedor creado", variant: "success" });
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Proveedores</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gestione las empresas proveedoras de productos y servicios.</p>
          </div>
          <Button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Proveedor
          </Button>
       </div>

       {/* Search */}
       <div className="bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="relative">
               <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
               <input 
                   className="block w-full pl-10 pr-3 py-3 border-none bg-transparent rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 outline-none" 
                   placeholder="Buscar proveedor por nombre o contacto..." 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
               />
           </div>
       </div>

       {/* Grid */}
       {loading && !providers.length ? (
           <div className="text-center py-20 text-slate-400">Cargando proveedores...</div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredProviders.map(provider => (
                   <div key={provider.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4">
                       <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                                   <Truck className="h-5 w-5" />
                               </div>
                               <div>
                                   <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{provider.nombre_empresa}</h3>
                                   <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {provider.id}</p>
                               </div>
                           </div>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleEdit(provider)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors">
                                   <Edit className="h-4 w-4" />
                               </button>
                               <button onClick={() => handleDelete(provider)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                   <Trash2 className="h-4 w-4" />
                               </button>
                           </div>
                       </div>
                       
                       <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                           <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                               <User className="h-4 w-4 text-slate-400 shrink-0" />
                               <span className="truncate">{provider.contacto_nombre || 'Sin contacto'}</span>
                           </div>
                           <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                               <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                               <span className="truncate">{provider.email || 'No registrado'}</span>
                           </div>
                           <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                               <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                               <span className="truncate">{provider.telefono || 'No registrado'}</span>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       )}

       {/* Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6">
                   <h2 className="text-xl font-bold mb-1">{editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                   <p className="text-sm text-slate-500 mb-6">Información de la empresa proveedora.</p>
                   
                   <form onSubmit={handleSubmit} className="space-y-4">
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Nombre Empresa <span className="text-red-500">*</span></label>
                           <Input required value={formData.nombre_empresa} onChange={e => setFormData({...formData, nombre_empresa: e.target.value})} placeholder="Ej. Distribuidora S.A." />
                       </div>
                       
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Nombre de Contacto</label>
                           <Input value={formData.contacto_nombre} onChange={e => setFormData({...formData, contacto_nombre: e.target.value})} placeholder="Ej. Juan Pérez" />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <label className="text-sm font-medium">Email</label>
                               <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contacto@empresa.com" />
                           </div>
                           <div className="space-y-2">
                               <label className="text-sm font-medium">Teléfono</label>
                               <Input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="+57 300..." />
                           </div>
                       </div>

                       <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                           <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                           <Button type="submit">Guardar Proveedor</Button>
                       </div>
                   </form>
               </div>
           </div>
       )}

    </div>
  );
}
