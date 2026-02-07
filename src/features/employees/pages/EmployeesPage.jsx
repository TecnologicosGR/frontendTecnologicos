import React, { useEffect, useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import EmployeesTable from '../components/EmployeesTable';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeProfileModal from '../components/EmployeeProfileModal';
import { useToast } from '../../../components/ui/toast';
import { DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator } from '../../../components/ui/dropdown-menu';
import { Plus, Search, Filter, ArrowUpDown, Download, Check } from 'lucide-react';

export default function EmployeesPage() {
  const { employees, loading, error, fetchEmployees, createEmployee, updateEmployee, toggleEmployeeStatus } = useEmployees();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Profile Modal State
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Advanced Filter/Sort State
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' }); // 'asc' | 'desc'
  const [filterConfig, setFilterConfig] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchEmployees(); // Default fetches all (activeOnly=false) due to hook logic
  }, [fetchEmployees]);

  useEffect(() => {
      // Filter employees locally
      if (!employees) {
          setFilteredEmployees([]);
          return;
      }
      
      let result = [...employees];

      // 1. Search Filter
      const lowerTerm = searchTerm.toLowerCase();
      if (lowerTerm) {
        result = result.filter(emp => 
            emp.nombres?.toLowerCase().includes(lowerTerm) ||
            emp.apellidos?.toLowerCase().includes(lowerTerm) ||
            emp.email?.toLowerCase().includes(lowerTerm) ||
            emp.documento_identidad?.includes(lowerTerm) || 
            emp.cargo?.toLowerCase().includes(lowerTerm)
        );
      }

      // 2. Attribute Filter
      if (filterConfig === 'active') {
          result = result.filter(e => e.activo);
      } else if (filterConfig === 'inactive') {
          result = result.filter(e => !e.activo);
      }

      // 3. Sorting
      result.sort((a, b) => {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];

          // Combine names for name sorting
          if (sortConfig.key === 'nombres') {
              aValue = `${a.nombres} ${a.apellidos}`.toLowerCase();
              bValue = `${b.nombres} ${b.apellidos}`.toLowerCase();
          }

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });

      setFilteredEmployees(result);
  }, [employees, searchTerm, sortConfig, filterConfig]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCreate = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleViewProfile = (employee) => {
      setViewingEmployee(employee);
      setIsProfileOpen(true);
  }
  
  const handleEditFromProfile = (employee) => {
      setIsProfileOpen(false);
      handleEdit(employee);
  }

  const handleToggleStatus = async (employee) => {
      const newStatus = !employee.activo;
      const action = newStatus ? "activar" : "desactivar";
      
      if(window.confirm(`¿Estás seguro de ${action} a ${employee.nombres}?`)) {
          const result = await toggleEmployeeStatus(employee.id, newStatus);
          
          // Use toast from parent/hook or context
          if (result.success) {
              toast({
                  title: "Estado Actualizado",
                  description: `El empleado ha sido ${newStatus ? 'activado' : 'desactivado'} correctamente.`,
                  variant: "success"
              });
              if (isProfileOpen) setIsProfileOpen(false); // Close profile if toggled from there
          } else {
              toast({
                  title: "Error",
                  description: result.error,
                  variant: "destructive"
              });
          }
      }
  }

  const handleSubmit = async (data) => {
    let result;
    if (editingEmployee) {
      result = await updateEmployee(editingEmployee.id, data);
    } else {
      result = await createEmployee(data);
    }

    if (result.success) {
      setIsModalOpen(false);
      toast({
        title: editingEmployee ? "Empleado Actualizado" : "Empleado Registrado",
        description: editingEmployee ? "Los datos del empleado han sido actualizados." : "El nuevo empleado ha sido registrado en el sistema.",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Algo salió mal.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Empleados</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">Gestione su equipo de trabajo, roles y permisos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Nuevo Empleado
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <input 
                className="block w-full pl-10 pr-3 py-3 border-none bg-transparent rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 sm:text-sm focus:outline-none" 
                placeholder="Buscar por nombre, cargo o email..." 
                type="text"
                value={searchTerm}
                onChange={handleSearch}
            />
          </form>
        </div>
        <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div className="w-full sm:w-auto flex items-center gap-2 px-2 pb-2 sm:pb-0">
            <DropdownMenu 
                trigger={
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto">
                        <Filter className="h-[18px] w-[18px]" />
                        Filtros
                    </button>
                }
            >
                <DropdownLabel>Filtrar por Estado</DropdownLabel>
                <DropdownItem onClick={() => setFilterConfig('all')} active={filterConfig === 'all'}>
                    Todos
                </DropdownItem>
                <DropdownItem onClick={() => setFilterConfig('active')} active={filterConfig === 'active'}>
                    Solo Activos
                </DropdownItem>
                <DropdownItem onClick={() => setFilterConfig('inactive')} active={filterConfig === 'inactive'}>
                    Solo Inactivos
                </DropdownItem>
            </DropdownMenu>

            <DropdownMenu 
                trigger={
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto">
                        <ArrowUpDown className="h-[18px] w-[18px]" />
                        Ordenar
                    </button>
                }
            >
                <DropdownLabel>Ordenar por</DropdownLabel>
                <DropdownItem onClick={() => setSortConfig({ key: 'nombres', direction: 'asc' })} active={sortConfig.key === 'nombres' && sortConfig.direction === 'asc'}>
                    Nombre (A-Z)
                </DropdownItem>
                <DropdownItem onClick={() => setSortConfig({ key: 'nombres', direction: 'desc' })} active={sortConfig.key === 'nombres' && sortConfig.direction === 'desc'}>
                    Nombre (Z-A)
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => setSortConfig({ key: 'id', direction: 'desc' })} active={sortConfig.key === 'id' && sortConfig.direction === 'desc'}>
                    Más Recientes
                </DropdownItem>
                <DropdownItem onClick={() => setSortConfig({ key: 'id', direction: 'asc' })} active={sortConfig.key === 'id' && sortConfig.direction === 'asc'}>
                    Más Antiguos
                </DropdownItem>
            </DropdownMenu>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="flex h-full min-h-[400px] items-center justify-center">
                 <div className="animate-pulse text-muted-foreground">Cargando empleados...</div>
             </div>
        ) : error ? (
            <div className="flex h-full min-h-[400px] items-center justify-center flex-col gap-2">
                 <div className="text-destructive font-medium">Error al cargar datos</div>
                 <p className="text-sm text-muted-foreground">{error}</p>
                 <button onClick={() => fetchEmployees()} className="text-primary hover:underline text-sm">Reintentar</button>
            </div>
        ) : (
            <EmployeesTable 
                employees={filteredEmployees} 
                onEdit={handleEdit} 
                onToggleStatus={handleToggleStatus} 
                onViewProfile={handleViewProfile}
            />
        )}
      </div>

      <EmployeeForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingEmployee}
      />
      
      <EmployeeProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        employee={viewingEmployee}
        onEdit={handleEditFromProfile}
        onToggleStatus={(e) => {
            handleToggleStatus(e); 
            // Note: handleToggleStatus might close the modal if we want, or we can keep it open and let the useEffect update the data
        }}
      />
    </main>
  );
}
