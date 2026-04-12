import React, { useEffect, useState } from 'react';
import { useTechnicalServices } from '../hooks/useTechnicalServices';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Search, Plus, Filter, Wrench, Clock, CheckCircle, AlertCircle, Calendar, FileText, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import TicketForm from '../components/TicketForm';
import TicketDetailPage from '../components/TicketDetailPage';
import { printTicketReceipt } from '../utils/printReceipt';

export default function TechnicalServicesPage() {
  const { tickets, loading, fetchTickets, deleteTicket } = useTechnicalServices();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    fetchTickets({ es_admin: false });
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(t => 
      t.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.dispositivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.id).includes(searchTerm)
  );

  const handleDelete = async (id) => {
      if (window.confirm("¿Estás seguro de eliminar permanentemente esta orden de servicio? Esta acción no se puede deshacer.")) {
          const res = await deleteTicket(id);
          if (res.success) {
              toast({ title: "Orden eliminada", variant: "success" });
          } else {
              toast({ title: "Error al eliminar", description: res.error, variant: "destructive" });
          }
      }
  };

  const getStatusColor = (status) => {
      switch(status?.toLowerCase()) {
          case 'ingresado': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'en reparación': return 'bg-amber-100 text-amber-700 border-amber-200';
          case 'terminado': return 'bg-green-100 text-green-700 border-green-200';
          case 'entregado': return 'bg-slate-100 text-slate-700 border-slate-200';
          default: return 'bg-slate-50 text-slate-600 border-slate-200';
      }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Ordenes de Servicio
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                Gestión de reparaciones y mantenimiento de la tienda.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-md">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Orden
          </Button>
       </div>

       {/* Filters */}
       <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input 
                    className="block w-full pl-10 pr-3 py-2 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="Buscar por cliente, dispositivo o #ticket..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
           </div>
           {/* Add Date/Status filters here later */}
       </div>

       {/* List */}
       <div className="space-y-4">
           {loading && !tickets.length && <div className="text-center py-10 text-slate-400">Cargando tickets...</div>}
           
           {filteredTickets.map(ticket => (
               <div key={ticket.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                   
                   {/* Icon & ID */}
                   <div className="flex items-center gap-4 min-w-[150px]">
                       <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                           <Wrench className="h-6 w-6 text-slate-500" />
                       </div>
                       <div>
                           <span className="text-xs font-bold text-slate-400">TICKET #{ticket.id}</span>
                           <div className={cn("px-2 py-0.5 rounded text-xs font-bold border mt-1 inline-block", getStatusColor(ticket.estado_actual))}>
                               {ticket.estado_actual}
                           </div>
                       </div>
                   </div>

                   {/* Device & Client */}
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{ticket.marca_modelo}</h3>
                           <p className="text-sm text-slate-500">{ticket.tipo_dispositivo}</p>
                       </div>
                       <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <span className="text-slate-400">Cliente:</span> {ticket.nombre_cliente || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>Ingreso: {ticket.fecha_ingreso ? new Date(ticket.fecha_ingreso).toLocaleDateString() : 'N/A'}</span>
                            </div>
                       </div>
                   </div>

                   <div className="flex items-center gap-2">
                       <Button variant="outline" size="sm" onClick={() => setSelectedTicketId(ticket.id)}>
                           Ver Detalles
                       </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-primary"
                          onClick={() => printTicketReceipt(ticket, 'Consultar detalles')}
                          title="Imprimir ticket PDF"
                        >
                          <FileText className="h-4 w-4" /> Ticket
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => handleDelete(ticket.id)}
                          title="Eliminar Orden"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
               </div>
           ))}
       </div>

       {isFormOpen && (
           <TicketForm 
               isAdminService={false}
               onClose={() => setIsFormOpen(false)} 
               onSuccess={() => {
                   fetchTickets({ es_admin: false });
               }} 
           />
       )}

       {selectedTicketId && (
           <TicketDetailPage 
                ticketId={selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
           />
       )}
    </div>
  );
}
