import { DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator } from '../../../components/ui/dropdown-menu';
import { 
  X, Edit, MoreHorizontal, Mail, Phone, MapPin, 
  Trash2, Briefcase, User
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeProfileModal({ isOpen, onClose, employee, onEdit, onToggleStatus }) {
  if (!isOpen || !employee) return null;

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-black/50 rounded-full z-10 hover:bg-white/80 transition-colors">
                    <X className="h-5 w-5" />
                </button>

                {/* Profile Header */}
                <div className="pt-14 pb-8 px-6 flex flex-col items-center text-center relative bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    {/* Avatar / Initials */}
                    <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4 ring-4 ring-white dark:ring-slate-900 shadow-sm">
                        {employee.nombres?.[0]}{employee.apellidos?.[0]}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {employee.nombres} {employee.apellidos}
                    </h1>
                    <p className="text-slate-500 text-sm mb-2">{employee.documento_identidad}</p>
                    
                    <div className="flex gap-2 mb-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {employee.cargo || 'Sin Cargo'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {employee.nombre_rol || 'Sin Rol'}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex gap-3">
                        <button 
                            onClick={() => onEdit(employee)}
                            className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                        >
                            <Edit className="h-4 w-4" />
                            Editar
                        </button>
                        
                        <DropdownMenu 
                            trigger={
                                <button className="px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            }
                        >
                            <DropdownLabel>Opciones</DropdownLabel>
                            <DropdownItem onClick={() => onToggleStatus && onToggleStatus(employee)} className={employee.activo ? "text-amber-600 focus:text-amber-700" : "text-emerald-600 focus:text-emerald-700"}>
                                {employee.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                            </DropdownItem>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Details List */}
                <div className="p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Detalles</h3>
                    
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                            <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-400">Email</span>
                            <span className="text-sm font-medium truncate text-slate-900 dark:text-slate-200 select-all">{employee.email}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-400">Estado</span>
                            <span className={cn(
                                "text-sm font-medium",
                                employee.activo ? "text-emerald-600" : "text-red-500"
                            )}>{employee.activo ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800 mt-auto bg-slate-50/30">
                    <div className="p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Fecha Registro</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {employee.fecha_registro 
                                ? new Date(employee.fecha_registro).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) 
                                : 'N/A'}
                        </p>
                    </div>
                    <div className="p-4 text-center">
                         <p className="text-xs text-slate-500 mb-1">ID Sistema</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">#{employee.id}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    </AnimatePresence>
  );
}
