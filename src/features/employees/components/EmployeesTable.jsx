import React from 'react';
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight, UserX, UserCheck } from 'lucide-react';
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

export default function EmployeesTable({ employees, onEdit, onToggleStatus, onViewProfile }) {

  if (!employees || employees.length === 0) {
     return (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
             No se encontraron empleados.
        </div>
     )
  }

  // Mock pagination for UI demo purposes
  const total = employees.length;

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/4">Empleado</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/5">Cargo / Rol</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/5">Contacto</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/6">Estado</th>
            <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {employees.map((employee) => {
             const initials = getInitials(employee.nombres, employee.apellidos);
             const badgeColor = getRandomColor(employee.nombres + employee.apellidos);
             
             return (
                <tr key={employee.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm", badgeColor)}>
                        {initials}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{employee.nombres} {employee.apellidos}</p>
                        <p className="text-xs text-slate-500">ID: {employee.documento_identidad}</p>
                    </div>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm text-slate-900 dark:text-white">{employee.cargo || 'Sin cargo'}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 w-fit">
                            {employee.nombre_rol || 'N/A'}
                        </span>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{employee.email}</span>
                        {/* <span className="text-xs text-slate-500">{employee.telefono}</span> */}
                    </div>
                </td>
                <td className="py-4 px-6">
                    {employee.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Activo
                        </span>
                    ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Inactivo
                        </span>
                    )}
                </td>
                <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onViewProfile && onViewProfile(employee)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 rounded-lg transition-colors" 
                        title="Ver Perfil"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => onEdit(employee)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                        title="Editar"
                    >
                        <Edit className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => onToggleStatus && onToggleStatus(employee)}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            employee.activo 
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20" 
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        )}
                        title={employee.activo ? "Desactivar" : "Activar"}
                    >
                        {employee.activo ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
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
        <p className="text-sm text-slate-500">Mostrando <span className="font-bold text-slate-900 dark:text-white">1-{total}</span> de <span className="font-bold text-slate-900 dark:text-white">{total}</span> empleados</p>
        <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors" disabled>
                <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-primary text-white text-sm font-bold flex items-center justify-center">1</button>
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" disabled>
                <ChevronRight className="h-[18px] w-[18px]" />
            </button>
        </div>
    </div>
    </>
  );
}
