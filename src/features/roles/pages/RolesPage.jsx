import React, { useEffect, useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import RolesTable from '../components/RolesTable';
import RoleForm from '../components/RoleForm';
import { useToast } from '../../../components/ui/toast';
import { Plus, Search, ShieldCheck } from 'lucide-react';

export default function RolesPage() {
  const { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole, assignPermission, revokePermission, getRoleDetails } = useRoles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
      if (!roles) {
          setFilteredRoles([]);
          return;
      }
      
      const lowerTerm = searchTerm.toLowerCase();
      const result = roles.filter(role => 
          role.nombre?.toLowerCase().includes(lowerTerm) ||
          role.descripcion?.toLowerCase().includes(lowerTerm)
      );

      setFilteredRoles(result);
  }, [roles, searchTerm]);

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role) => {
      if(window.confirm(`¿Estás seguro de eliminar el rol "${role.nombre}"? Esta acción no se puede deshacer.`)) {
          const result = await deleteRole(role.id);
          if (result.success) {
              toast({
                  title: "Rol Eliminado",
                  description: "El rol ha sido eliminado correctamente.",
                  variant: "success"
              });
          } else {
              toast({
                  title: "Error",
                  description: result.error,
                  variant: "destructive"
              });
          }
      }
  }

  const handleSubmit = async (data, selectedPermissionIds) => {
    // 1. Save Role Basic Info
    let roleId;
    let isNew = false;
    
    if (editingRole) {
      roleId = editingRole.id;
      const result = await updateRole(roleId, data);
      if (!result.success) {
          toast({ title: "Error", description: result.error, variant: "destructive" });
          return;
      }
    } else {
      isNew = true;
      const result = await createRole(data);
      if (!result.success) {
          toast({ title: "Error", description: result.error, variant: "destructive" });
          return;
      }
      roleId = result.data.id;
    }

    // 2. Manage Permissions (Diffing)
    // We need current permissions to diff. 
    // If it's new, current is empty.
    // If it's edit, we better fetched details inside form or passed them.
    // Assuming 'editingRole' has 'permisos' array if we fetched getAll with details... 
    // BUT getAll usually implies lightweight list. 
    // SO, robust way: get current perms from API before diffing, or trust what Form passed (Form loaded fresh data).
    // Let's assume the Form handled the logic of what is selected versus what was selected.
    
    // Actually, to keep page logic simple, let's do this: 
    // We need to know what to ADD and what to REMOVE.
    // Ideally the API would support "syncPermissions([ids])" but here we have add/remove one by one.
    
    // Fetch fresh details to be sure what we have on server
    let currentPermIds = new Set();
    if (!isNew) {
        const details = await getRoleDetails(roleId);
        if (details && details.permisos) {
            currentPermIds = new Set(details.permisos.map(p => p.id));
        }
    }

    const targetPermIds = new Set(selectedPermissionIds);

    // Calc changes
    const toAdd = [...targetPermIds].filter(id => !currentPermIds.has(id));
    const toRemove = [...currentPermIds].filter(id => !targetPermIds.has(id));

    // Execute changes (Parallel or Serial? Serial is safer for many requests)
    let errorCount = 0;
    
    // We can run these in parallel groups to speed up
    await Promise.all([
        ...toAdd.map(pid => assignPermission(roleId, pid).then(res => !res.success && errorCount++)),
        ...toRemove.map(pid => revokePermission(roleId, pid).then(res => !res.success && errorCount++))
    ]);

    if (errorCount > 0) {
        toast({
            title: "Advertencia",
            description: `Rol guardado, pero hubo errores al actualizar ${errorCount} permisos. Revise la configuración.`,
            variant: "warning"
        });
    } else {
        toast({
            title: isNew ? "Rol Creado" : "Rol Actualizado",
            description: "La configuración del rol y sus permisos se ha guardado exitosamente.",
            variant: "success",
        });
    }

    setIsModalOpen(false);
    fetchRoles(); // Refresh main list
  };

  return (
    <main className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Roles y Permisos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">Defina los niveles de acceso y seguridad del sistema.</p>
        </div>
        <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
            <Plus className="h-5 w-5" />
            Nuevo Rol
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
                className="block w-full pl-10 pr-3 py-3 border-none bg-transparent rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 sm:text-sm focus:outline-none" 
                placeholder="Buscar rol..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="flex h-full min-h-[400px] items-center justify-center">
                 <div className="animate-pulse text-muted-foreground">Cargando roles...</div>
             </div>
        ) : error ? (
            <div className="flex h-full min-h-[400px] items-center justify-center flex-col gap-2">
                 <div className="text-destructive font-medium">Error al cargar datos</div>
                 <p className="text-sm text-muted-foreground">{error}</p>
                 <button onClick={() => fetchRoles()} className="text-primary hover:underline text-sm">Reintentar</button>
            </div>
        ) : (
            <RolesTable 
                roles={filteredRoles} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
            />
        )}
      </div>

      <RoleForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingRole}
      />
    </main>
  );
}
