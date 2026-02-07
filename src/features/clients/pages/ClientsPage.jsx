import React, { useEffect, useState } from 'react';
import { useClients } from '../hooks/useClients';
import ClientsTable from '../components/ClientsTable';
import ClientForm from '../components/ClientForm';
import ClientProfileModal from '../components/ClientProfileModal';
import { useToast } from '../../../components/ui/toast';
import { DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator } from '../../../components/ui/dropdown-menu';
import { Plus, Search, Filter, ArrowUpDown, Download, Check } from 'lucide-react';

export default function ClientsPage() {
  const { clients, loading, error, fetchClients, createClient, updateClient, deleteClient } = useClients();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Advanced Filter/Sort State
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' }); // 'asc' | 'desc'
  const [filterConfig, setFilterConfig] = useState('all'); // 'all', 'with_email', 'with_phone'

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
      // Filter clients locally whenever searchTerm, clients list, sort or filter config changes
      if (!clients) {
          setFilteredClients([]);
          return;
      }
      
      let result = [...clients];

      // 1. Search Filter
      const lowerTerm = searchTerm.toLowerCase();
      if (lowerTerm) {
        result = result.filter(client => 
            client.nombres?.toLowerCase().includes(lowerTerm) ||
            client.apellidos?.toLowerCase().includes(lowerTerm) ||
            client.email?.toLowerCase().includes(lowerTerm) ||
            client.documento_identidad?.includes(lowerTerm)
        );
      }

      // 2. Attribute Filter
      if (filterConfig === 'with_email') {
          result = result.filter(c => c.email && c.email.length > 0);
      } else if (filterConfig === 'with_phone') {
          result = result.filter(c => c.telefono && c.telefono.length > 0);
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

      setFilteredClients(result);
  }, [clients, searchTerm, sortConfig, filterConfig]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleViewProfile = (client) => {
      setViewingClient(client);
      setIsProfileOpen(true);
  };
  
  const handleEditFromProfile = (client) => {
      setIsProfileOpen(false);
      handleEdit(client);
  };

  const handleDelete = async (client) => {
      if(window.confirm(`¿Estás seguro de eliminar a ${client.nombres}?`)) {
          const result = await deleteClient(client.id);
          if (result.success) {
              toast({
                  title: "Cliente eliminado",
                  description: "El cliente ha sido eliminado correctamente.",
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

  const handleSubmit = async (data) => {
    let result;
    if (editingClient) {
      result = await updateClient(editingClient.id, data);
    } else {
      result = await createClient(data);
    }

    if (result.success) {
      setIsModalOpen(false);
      toast({
        title: editingClient ? "Cliente Actualizado" : "Cliente Registrado",
        description: editingClient ? "Los datos del cliente han sido actualizados." : "El nuevo cliente ha sido registrado en el sistema.",
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">Gestione sus relaciones y perfiles de clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Download className="h-5 w-5" />
            Export
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Nuevo Cliente
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
                placeholder="Buscar por nombre, documento o email..." 
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
                <DropdownLabel>Filtrar por</DropdownLabel>
                <DropdownItem onClick={() => setFilterConfig('all')} active={filterConfig === 'all'}>
                    Todos los clientes
                </DropdownItem>
                <DropdownItem onClick={() => setFilterConfig('with_email')} active={filterConfig === 'with_email'}>
                    Con Email
                </DropdownItem>
                <DropdownItem onClick={() => setFilterConfig('with_phone')} active={filterConfig === 'with_phone'}>
                    Con Teléfono
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
                 <div className="animate-pulse text-muted-foreground">Cargando clientes...</div>
             </div>
        ) : error ? (
            <div className="flex h-full min-h-[400px] items-center justify-center flex-col gap-2">
                 <div className="text-destructive font-medium">Error al cargar datos</div>
                 <p className="text-sm text-muted-foreground">{error}</p>
                 <button onClick={() => fetchClients()} className="text-primary hover:underline text-sm">Reintentar</button>
            </div>
        ) : (
            <ClientsTable 
                clients={filteredClients} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onViewProfile={handleViewProfile}
            />
        )}
      </div>

      <ClientForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingClient}
      />
      
      <ClientProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        client={viewingClient}
        onEdit={handleEditFromProfile}
        onDelete={() => {
            setIsProfileOpen(false);
            handleDelete(viewingClient);
        }}
      />
    </main>
  );
}
