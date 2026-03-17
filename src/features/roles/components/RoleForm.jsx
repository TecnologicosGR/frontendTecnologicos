import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { X, Loader2, Save, Shield, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { rolesService } from '../services/roles.service';

export default function RoleForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'permissions'

  useEffect(() => {
    if (isOpen) {
        loadData();
    }
  }, [isOpen, initialData]);

  const loadData = async () => {
      setLoadingInitial(true);
      try {
          // 1. Fetch all system permissions
          const perms = await rolesService.getAllPermissions();
          setAllPermissions(perms);

          // 2. If editing, fill form and active permissions
          if (initialData) {
              setFormData({
                  nombre: initialData.nombre,
                  descripcion: initialData.descripcion || ''
              });

              // We need to fetch the ROLE details to see its current permissions (the list view might not have them)
              // Or we assume initialData passed to us HAS them. 
              // To be safe, let's re-fetch the role details if we don't have permissions in initialData
              let currentPerms = [];
              if (initialData.permisos) {
                  currentPerms = initialData.permisos;
              } else {
                  // Optional: fetch details if needed. For now assuming passed object is simple, let's rely on list
                  // Actually, better UX: fetch details on open
                  const details = await rolesService.getById(initialData.id);
                  currentPerms = details.permisos || [];
              }
              
              const permIds = new Set(currentPerms.map(p => p.id));
              setSelectedPermissions(permIds);
          } else {
              setFormData({ nombre: '', descripcion: '' });
              setSelectedPermissions(new Set());
          }
      } catch (e) {
          console.error("Error loading role data", e);
      } finally {
          setLoadingInitial(false);
      }
  };

  const togglePermission = (permId) => {
      const newSet = new Set(selectedPermissions);
      if (newSet.has(permId)) {
          newSet.delete(permId);
      } else {
          newSet.add(permId);
      }
      setSelectedPermissions(newSet);
  };

  const handleSelectAll = () => {
      if (selectedPermissions.size === allPermissions.length) {
          setSelectedPermissions(new Set()); // Deselect all
      } else {
          setSelectedPermissions(new Set(allPermissions.map(p => p.id))); // Select all
      }
  }

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          // 1. Create/Update Role
          const result = await onSubmit(formData, Array.from(selectedPermissions)); 
          // Note: The parent handler will call updateRole/createRole. 
          // BUT managing permissions is separate endpoints. 
          // Option A: Parent handles it. Option B: We handle it here.
          // Let's defer to parent to keep component dumb-ish, passing back data + perms list
      } finally {
          setIsSubmitting(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6 shrink-0 bg-white dark:bg-slate-950">
            <div>
                <h2 className="text-xl font-bold tracking-tight">{initialData ? 'Editar Rol' : 'Nuevo Rol'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Defina el nombre del rol y sus permisos de acceso.
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
            </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-muted/30 shrink-0">
            <button 
                onClick={() => setActiveTab('general')}
                className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === 'general' ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:bg-muted/50"
                )}
            >
                Información General
            </button>
            <button 
                onClick={() => setActiveTab('permissions')}
                className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === 'permissions' ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:bg-muted/50"
                )}
            >
                Permisos ({selectedPermissions.size})
            </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            {loadingInitial ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'general' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Rol <span className="text-destructive">*</span></label>
                                <Input 
                                    name="nombre" 
                                    value={formData.nombre} 
                                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                    required 
                                    placeholder="Ej. SUPERVISOR" 
                                    className="uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <textarea 
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    name="descripcion" 
                                    value={formData.descripcion} 
                                    onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                                    placeholder="Descripción corta de las responsabilidades..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'permissions' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-muted-foreground">Seleccione los accesos permitidos para este rol.</p>
                                <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 text-xs">
                                    {selectedPermissions.size === allPermissions.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                </Button>
                            </div>
                            
                            {/* Grouped by module */}
                            {Object.entries(
                                allPermissions.reduce((acc, perm) => {
                                    const [module] = perm.codigo.split(':');
                                    if (!acc[module]) acc[module] = [];
                                    acc[module].push(perm);
                                    return acc;
                                }, {})
                            ).map(([module, perms]) => {
                                const allSelected = perms.every(p => selectedPermissions.has(p.id));
                                const someSelected = perms.some(p => selectedPermissions.has(p.id));
                                const toggleModule = () => {
                                    const newSet = new Set(selectedPermissions);
                                    if (allSelected) {
                                        perms.forEach(p => newSet.delete(p.id));
                                    } else {
                                        perms.forEach(p => newSet.add(p.id));
                                    }
                                    setSelectedPermissions(newSet);
                                };
                                return (
                                    <div key={module} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        {/* Module header */}
                                        <div
                                            onClick={toggleModule}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none transition-colors",
                                                allSelected
                                                    ? "bg-primary/10 text-primary"
                                                    : someSelected
                                                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                                    : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                                allSelected ? "bg-primary border-primary text-white" : someSelected ? "bg-amber-400 border-amber-400 text-white" : "border-slate-300 dark:border-slate-600"
                                            )}>
                                                {(allSelected || someSelected) && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="font-bold text-sm capitalize tracking-wide">{module}</span>
                                            <span className="ml-auto text-xs font-normal opacity-60">{perms.filter(p => selectedPermissions.has(p.id)).length}/{perms.length}</span>
                                        </div>
                                        {/* Individual permissions */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800">
                                            {perms.map(perm => {
                                                const isSelected = selectedPermissions.has(perm.id);
                                                return (
                                                    <div
                                                        key={perm.id}
                                                        onClick={() => togglePermission(perm.id)}
                                                        className={cn(
                                                            "flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                                            isSelected && "bg-primary/5"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                                            isSelected ? "bg-primary border-primary text-white" : "border-slate-300 dark:border-slate-600"
                                                        )}>
                                                            {isSelected && (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn("text-xs font-bold leading-none mb-1", isSelected && "text-primary")}>{perm.codigo.split(':')[1]}</p>
                                                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{perm.descripcion}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </form>
            )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="role-form" disabled={isSubmitting} className="px-6 min-w-[140px]">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Rol
                    </>
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}
