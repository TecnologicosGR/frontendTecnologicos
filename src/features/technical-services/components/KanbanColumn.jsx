import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '../../../lib/utils';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ column, tickets, onDrop, onCardClick, isUpdating }) {
  const ref = useRef(null);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'TICKET',
    drop: (item) => {
      if (item.currentStatus?.toLowerCase() !== column.status.toLowerCase()) {
        onDrop(item.id, column.status);
      }
    },
    canDrop: (item) => item.currentStatus?.toLowerCase() !== column.status.toLowerCase(),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  drop(ref);

  const isActive = isOver && canDrop;

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col min-h-[500px] rounded-2xl transition-all duration-200',
        isActive
          ? 'bg-primary/5 ring-2 ring-primary/40 ring-dashed scale-[1.01]'
          : 'bg-slate-100/70 dark:bg-slate-800/40'
      )}
    >
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between p-4 rounded-t-2xl border-b border-slate-200/60 dark:border-slate-700/40',
        column.headerClass
      )}>
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${column.dotClass}`} />
          <column.icon className="h-4 w-4" />
          <span className="font-bold text-sm">{column.title}</span>
        </div>
        <span className="bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {tickets.length === 0 && (
          <div className={cn(
            'flex items-center justify-center h-24 rounded-xl border-2 border-dashed text-sm text-slate-400',
            isActive ? 'border-primary/50 text-primary' : 'border-slate-200 dark:border-slate-700'
          )}>
            {isActive ? '¡Soltar aquí!' : 'Sin tickets'}
          </div>
        )}
        {tickets.map(ticket => (
          <KanbanCard
            key={ticket.id}
            ticket={ticket}
            onClick={onCardClick}
          />
        ))}
        {isActive && tickets.length > 0 && (
          <div className="h-12 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center text-xs text-primary font-medium">
            Soltar aquí
          </div>
        )}
      </div>

      {isUpdating && (
        <div className="p-2 text-center text-xs text-primary animate-pulse">Actualizando…</div>
      )}
    </div>
  );
}
