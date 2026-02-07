import { DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator } from '../../../components/ui/dropdown-menu';
import { 
  X, Edit, MoreHorizontal, Mail, Phone, MapPin, 
  Receipt, MessageSquare, FolderOpen, Search, Filter, 
  Download, ArrowRight, FileText, History, Paperclip,
  AlarmClock, CheckCircle, AlertCircle, Trash2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientProfileModal({ isOpen, onClose, client, onEdit, onDelete }) {
  if (!isOpen || !client) return null;

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            >
                {/* Close Button Mobile */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-black/50 rounded-full md:hidden z-10">
                    <X className="h-5 w-5" />
                </button>

                {/* Left Column: Profile Card */}
                <div className="w-full md:w-[320px] bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 flex flex-col overflow-y-auto">
                    {/* Profile Header */}
                    <div className="pt-14 pb-8 px-6 flex flex-col items-center text-center relative">
                        {/* Avatar / Initials */}
                        <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4 ring-4 ring-white dark:ring-slate-900 shadow-sm">
                            {client.nombres?.[0]}{client.apellidos?.[0]}
                        </div>
                        
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {client.nombres} {client.apellidos}
                        </h1>
                        <p className="text-slate-500 text-sm mb-2">{client.documento_identidad}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
                            Cliente VIP
                        </span>

                        {/* Action Buttons */}
                        <div className="w-full space-y-3">
                            <button 
                                onClick={() => onEdit(client)}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                            >
                                <Edit className="h-4 w-4" />
                                Editar Perfil
                            </button>
                            
                            <DropdownMenu 
                                trigger={
                                    <button className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <MoreHorizontal className="h-4 w-4" />
                                        Más Acciones
                                    </button>
                                }
                            >
                                <DropdownLabel>Administrar Cliente</DropdownLabel>
                                <DropdownItem onClick={() => onEdit(client)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar Información
                                </DropdownItem>
                                <DropdownSeparator />
                                <DropdownItem onClick={() => onDelete && onDelete(client)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cliente
                                </DropdownItem>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-6 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Información de Contacto</h3>
                        
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-slate-400">Email</span>
                                <span className="text-sm font-medium truncate text-slate-900 dark:text-slate-200 select-all">{client.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-slate-400">Teléfono</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200 select-all">{client.telefono}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-slate-400">Dirección</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{client.direccion}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800 mt-auto">
                        <div className="p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default">
                            <p className="text-xs text-slate-500 mb-1">Total Gastado</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">$12,400</p>
                        </div>
                        <div className="p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default">
                            <p className="text-xs text-slate-500 mb-1">Miembro Desde</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {client.fecha_registro 
                                    ? new Date(client.fecha_registro).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) 
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: History & Activity */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full hidden md:flex transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                    
                    <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto w-full">
                        {/* Tabs */}
                        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-1 flex gap-1 overflow-x-auto shrink-0 mb-6">
                            <button className="flex-1 min-w-[120px] py-2.5 px-4 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all">
                                <Receipt className="h-4 w-4" />
                                Historial
                            </button>
                            <button className="flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 font-medium text-sm flex items-center justify-center gap-2 transition-all">
                                <MessageSquare className="h-4 w-4" />
                                Notas
                            </button>
                            <button className="flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 font-medium text-sm flex items-center justify-center gap-2 transition-all">
                                <FolderOpen className="h-4 w-4" />
                                Archivos
                            </button>
                        </div>

                        {/* Purchase History Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col mb-6 shrink-0">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historial de Compras</h2>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                        <input className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary w-full sm:w-64 text-slate-900 dark:text-slate-200" placeholder="Filtrar ordenes..." type="text"/>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <Filter className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Orden ID</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Items</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Monto</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Estado</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">Oct 24, 2023</td>
                                            <td className="py-4 px-6 text-sm font-medium text-primary cursor-pointer hover:underline whitespace-nowrap">#ORD-7721</td>
                                            <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-medium">Laptop Gamer XYZ</td>
                                            <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-bold text-right tabular-nums whitespace-nowrap">$1,250.00</td>
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    Pagado
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    <Download className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Mock Data Row 2 */}
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">Sep 12, 2023</td>
                                            <td className="py-4 px-6 text-sm font-medium text-primary cursor-pointer hover:underline whitespace-nowrap">#ORD-7604</td>
                                            <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-medium">Servicio Mantenimiento</td>
                                            <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-bold text-right tabular-nums whitespace-nowrap">$150.00</td>
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    Pagado
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    <Download className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
                                <button className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors flex items-center justify-center gap-1 mx-auto">
                                    Ver todas las transacciones <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Interaction Notes & Timeline */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                            {/* Add Note Area */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Nueva Nota
                                </h2>
                                <div className="flex-1 flex flex-col gap-3">
                                    <textarea className="w-full flex-1 min-h-[120px] rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary placeholder:text-slate-400 text-sm resize-none p-4" placeholder="Registrar una llamada, reunión o nota interna..."></textarea>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors" title="Attach File">
                                                <Paperclip className="h-5 w-5" />
                                            </button>
                                            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors" title="Set Reminder">
                                                <AlarmClock className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <button className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm shadow-md shadow-blue-500/20">
                                            Guardar Nota
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Recent Activity Timeline */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-full flex flex-col">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <History className="h-5 w-5 text-primary" />
                                    Actividad Reciente
                                </h2>
                                <div className="flex-1 overflow-y-auto pr-2 max-h-[300px]">
                                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6 pb-2">
                                        {/* Timeline Item 1 */}
                                        <div className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 size-4 bg-white dark:bg-slate-900 border-2 border-primary rounded-full"></div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Llamada Registrada</p>
                                                    <span className="text-xs text-slate-400">Oct 20, 2:30 PM</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    Cliente interesado en actualizar su plan.
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">Por Miguel T.</p>
                                            </div>
                                        </div>
                                        {/* Timeline Item 2 */}
                                        <div className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 size-4 bg-white dark:bg-slate-900 border-2 border-purple-500 rounded-full"></div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Email Enviado</p>
                                                    <span className="text-xs text-slate-400">Oct 15, 9:15 AM</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    Factura #ORD-7721 enviada.
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">Sistema Automático</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </AnimatePresence>
  );
}
