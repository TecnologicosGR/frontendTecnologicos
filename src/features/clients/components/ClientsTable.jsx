import React from 'react';
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

const getRandomColor = (name) => {
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
}

export default function ClientsTable({ clients, onEdit, onDelete, onViewProfile }) {

  if (!clients || clients.length === 0) {
     return (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
             No se encontraron clientes.
        </div>
     )
  }

  // Mock pagination for UI demo purposes (since API might not send metadata yet)
  const total = clients.length;
  // const start = 1;
  // const end = clients.length;

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/4">Cliente</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/4">Contacto</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/6">Estado</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/6">Documento</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {clients.map((client) => {
             const initials = getInitials(client.nombres, client.apellidos);
             const badgeColor = getRandomColor(client.nombres + client.apellidos);
             
             return (
                <tr key={client.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm", badgeColor)}>
                        {initials}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{client.nombres} {client.apellidos}</p>
                        <p className="text-xs text-slate-500">ID: {client.id}</p>
                    </div>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{client.email}</span>
                        <span className="text-xs text-slate-500">{client.telefono}</span>
                    </div>
                </td>
                <td className="py-4 px-6">
                    {/* Mock Status - assuming Active for now as API doesn't return state */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Activo
                    </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                    {client.documento_identidad}
                </td>
                <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onViewProfile && onViewProfile(client)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 rounded-lg transition-colors" 
                        title="Ver Perfil"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => onEdit(client)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                        title="Editar"
                    >
                        <Edit className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => onDelete && onDelete(client)}
                        className="p-2 text-slate-400 hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                        title="Eliminar"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                    </div>
                </td>
                </tr>
             );
          })}
        </tbody>
      </table>
    </div>
    
    {/* Pagination Placeholder */}
    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <p className="text-sm text-slate-500">Mostrando <span className="font-bold text-slate-900 dark:text-white">1-{total}</span> de <span className="font-bold text-slate-900 dark:text-white">{total}</span> clientes</p>
        <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors" disabled>
                <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-primary text-white text-sm font-bold flex items-center justify-center">1</button>
            {/* 
            <button className="h-8 w-8 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium flex items-center justify-center transition-colors">2</button>
            */}
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" disabled>
                <ChevronRight className="h-[18px] w-[18px]" />
            </button>
        </div>
    </div>
    </>
  );
}
