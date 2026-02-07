import React from 'react';
import { Edit, Trash2, Key, Shield } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

export default function RolesTable({ roles, onEdit, onDelete }) {

  if (!roles || roles.length === 0) {
     return (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
             No se encontraron roles.
        </div>
     )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/4">Rol</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Descripción</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right w-1/4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {roles.map((role) => (
             <tr key={role.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{role.nombre}</span>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{role.descripcion || 'Sin descripción'}</span>
                </td>
                <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onEdit(role)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                            title="Editar permisos"
                        >
                            <Edit className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => onDelete(role)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                            title="Eliminar rol"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
