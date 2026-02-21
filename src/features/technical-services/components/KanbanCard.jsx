import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Badge } from '../../../components/ui/badge';
import { Smartphone, User, Clock, Hash, ChevronRight, CalendarClock } from 'lucide-react';

const STATUS_COLORS = {
  'recibido':      { dot: 'bg-blue-400',   text: 'text-blue-400' },
  'en reparación': { dot: 'bg-amber-400',  text: 'text-amber-400' },
  'terminado':     { dot: 'bg-green-400',  text: 'text-green-400' },
  'entregado':     { dot: 'bg-slate-400',  text: 'text-slate-400' },
};

export default function KanbanCard({ ticket, onClick }) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TICKET',
    item: { id: ticket.id, currentStatus: ticket.estado_actual },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  drag(ref);

  const colorInfo = STATUS_COLORS[(ticket.estado_actual || '').toLowerCase()] || { dot: 'bg-slate-400', text: 'text-slate-400' };
  const isOverdue = ticket.fecha_estimada_salida && new Date(ticket.fecha_estimada_salida) < new Date() 
    && !['entregado', 'terminado'].includes((ticket.estado_actual || '').toLowerCase());

  return (
    <div
      ref={ref}
      onClick={() => onClick && onClick(ticket)}
      className={`
        group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60
        shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30
        cursor-grab active:cursor-grabbing transition-all duration-200 p-4 space-y-3
        ${isDragging ? 'opacity-40 scale-95 rotate-1' : 'opacity-100'}
      `}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Hash className="h-3 w-3" />{ticket.id}
        </div>
        {isOverdue && (
          <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
            Vencido
          </span>
        )}
      </div>

      {/* Device */}
      <div className="flex items-start gap-2">
        <Smartphone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{ticket.marca_modelo}</p>
          <p className="text-xs text-slate-400 truncate">{ticket.tipo_dispositivo}</p>
        </div>
      </div>

      {/* Client */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-slate-400 shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{ticket.nombre_cliente || '—'}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          {new Date(ticket.fecha_ingreso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
        </div>
        {ticket.fecha_estimada_salida && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            <CalendarClock className="h-3 w-3" />
            {new Date(ticket.fecha_estimada_salida).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
