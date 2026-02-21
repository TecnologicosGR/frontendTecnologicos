import React, { useEffect, useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useTechnicalServices } from '../hooks/useTechnicalServices';
import KanbanColumn from '../components/KanbanColumn';
import TicketDetailPage from '../components/TicketDetailPage';
import { Wrench, Calendar, CheckCircle, User, RefreshCw, Kanban, X, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/toast';

// Detect touch for mobile DnD
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const COLUMNS = [
  {
    status: 'recibido',
    title: 'Recibido',
    icon: Calendar,
    dotClass: 'bg-blue-400',
    headerClass: 'text-blue-700 dark:text-blue-300',
  },
  {
    status: 'en reparación',
    title: 'En Reparación',
    icon: Wrench,
    dotClass: 'bg-amber-400',
    headerClass: 'text-amber-700 dark:text-amber-300',
  },
  {
    status: 'terminado',
    title: 'Terminado',
    icon: CheckCircle,
    dotClass: 'bg-green-400',
    headerClass: 'text-green-700 dark:text-green-300',
  },
  {
    status: 'entregado',
    title: 'Entregado',
    icon: User,
    dotClass: 'bg-slate-400',
    headerClass: 'text-slate-500 dark:text-slate-400',
  },
];

function normalizeStatus(status) {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('reparación') || s.includes('reparacion')) return 'en reparación';
  if (s === 'recibido' || s === 'ingresado') return 'recibido';
  if (s === 'terminado' || s === 'listo') return 'terminado';
  if (s === 'entregado') return 'entregado';
  return s;
}

export default function KanbanPage() {
  const { tickets, fetchTickets, updateTicketStatus } = useTechnicalServices();
  const [updatingId, setUpdatingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const { toast } = useToast();

  const loadTickets = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTickets();
    setIsRefreshing(false);
  }, [fetchTickets]);

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 60000);
    return () => clearInterval(interval);
  }, [loadTickets]);

  const handleDrop = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);

    const backendStatus = {
      'recibido': 'recibido',
      'en reparación': 'En Reparación',
      'terminado': 'Terminado',
      'entregado': 'Entregado',
    }[newStatus] || newStatus;

    const result = await updateTicketStatus(ticketId, backendStatus, `Estado actualizado a ${backendStatus} desde tablero Kanban`);
    setUpdatingId(null);

    if (result?.success) {
      toast({ title: '✅ Estado actualizado', description: `Orden #${ticketId} → ${backendStatus}` });
      await loadTickets();
    } else {
      toast({ title: '❌ Error al actualizar', description: result?.error || 'Intenta de nuevo', variant: 'destructive' });
      loadTickets();
    }
  };

  const handleCardClick = (ticket) => {
    setSelectedTicketId(ticket.id);
  };

  const handleModalClose = () => {
    setSelectedTicketId(null);
    loadTickets(); // Refresh board after closing modal (status may have changed inside)
  };

  const groupedTickets = COLUMNS.reduce((acc, col) => {
    acc[col.status] = tickets.filter(t => normalizeStatus(t.estado_actual) === col.status);
    return acc;
  }, {});

  const DndBackend = isTouchDevice() ? TouchBackend : HTML5Backend;
  const dndOptions = isTouchDevice() ? { enableMouseEvents: true } : {};

  return (
    <DndProvider backend={DndBackend} options={dndOptions}>
      <div className="flex flex-col gap-6 h-full">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Kanban className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Tablero de Reparaciones</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Arrastra las órdenes entre columnas · Haz clic para ver los detalles.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadTickets} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLUMNS.map(col => (
            <div key={col.status} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-3 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${col.dotClass}`} />
              <div>
                <p className="text-xs text-slate-500">{col.title}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{(groupedTickets[col.status] || []).length}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.status}
              column={col}
              tickets={groupedTickets[col.status] || []}
              onDrop={handleDrop}
              onCardClick={handleCardClick}
              isUpdating={updatingId !== null && (groupedTickets[col.status] || []).some(t => t.id === updatingId)}
            />
          ))}
        </div>
      </div>

      {/* Drag-and-drop loading overlay */}
      {updatingId !== null && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-slate-900 rounded-2xl px-8 py-5 shadow-2xl flex items-center gap-4 pointer-events-auto">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Actualizando estado…</p>
              <p className="text-xs text-slate-400 mt-0.5">Guardando cambio para la Orden #{updatingId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailPage
          ticketId={selectedTicketId}
          onClose={handleModalClose}
        />
      )}
    </DndProvider>
  );
}
