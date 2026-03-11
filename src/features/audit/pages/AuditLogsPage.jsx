import React, { useState, useEffect } from 'react';
import { useAudit } from '../hooks/useAudit';
import { 
  Shield, 
  Search, 
  RefreshCcw, 
  Filter, 
  Clock, 
  Database,
  ArrowRight,
  User,
  Activity,
  Calendar
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper visual parser for JSON differences
const JsonDiffViewer = ({ oldData, newData }) => {
    if (!oldData && !newData) return <div className="text-muted-foreground italic text-sm p-4">Sin datos de registro.</div>;

    const oldObj = typeof oldData === 'string' ? JSON.parse(oldData || '{}') : (oldData || {});
    const newObj = typeof newData === 'string' ? JSON.parse(newData || '{}') : (newData || {});

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Antes */}
            <div className="flex flex-col rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="bg-red-50 dark:bg-red-900/20 px-3 py-2 border-b border-red-100 dark:border-red-900/50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">Datos Anteriores</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 text-xs font-mono overflow-auto max-h-[400px]">
                    {Object.keys(oldObj).length === 0 ? (
                        <span className="text-slate-400 italic">No había datos anteriores (Creación)</span>
                    ) : (
                        <pre className="text-slate-700 dark:text-slate-300">
                            {JSON.stringify(oldObj, null, 2)}
                        </pre>
                    )}
                </div>
            </div>

            {/* Después */}
            <div className="flex flex-col rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 border-b border-green-100 dark:border-green-900/50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">Datos Nuevos</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 text-xs font-mono overflow-auto max-h-[400px]">
                     {Object.keys(newObj).length === 0 ? (
                        <span className="text-slate-400 italic">No hay datos nuevos (Eliminación)</span>
                    ) : (
                        <pre className="text-slate-700 dark:text-slate-300">
                            {JSON.stringify(newObj, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function AuditLogsPage() {
  const { logs, loading, fetchLogs } = useAudit();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [limit, setLimit] = useState(100);
  
  // Modal state
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs({ table: selectedTable, limit });
  }, [fetchLogs, selectedTable, limit]);

  const handleRefresh = () => {
    fetchLogs({ table: selectedTable, limit });
  };

  // Extract unique tables for the filter dropdown from the frontend logs
  // (In a real scenario, you might want an endpoint that returns all tables, but this is simple)
  const uniqueTables = [...new Set(logs.map(log => log.tabla_afectada))].filter(Boolean);

  const filteredLogs = logs.filter(log => {
      const searchLower = searchTerm.toLowerCase();
      return (
          log.nombre_usuario?.toLowerCase().includes(searchLower) ||
          log.tabla_afectada?.toLowerCase().includes(searchLower) ||
          log.accion?.toLowerCase().includes(searchLower) ||
          String(log.id_registro).includes(searchLower)
      );
  });

  const getActionColor = (action) => {
      switch(action?.toUpperCase()) {
          case 'INSERT': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
          case 'UPDATE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
          case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
          default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      }
  };

  // derived metrics from loaded logs
  const eventsTodayCount = logs.filter(log => isToday(new Date(log.fecha_evento))).length;
  const uniqueUsersCount = new Set(logs.map(log => log.id_usuario)).size;
  const deletesCount = logs.filter(log => log.accion?.toUpperCase() === 'DELETE').length;

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Shield className="h-8 w-8 text-indigo-600" />
                Auditoría del Sistema
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                Dashboard de monitoreo y registro detallado de eventos de seguridad.
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="shadow-sm bg-white dark:bg-slate-900" disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
          </Button>
       </div>

       {/* KPIs Dashboard */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-semibold">Total Eventos Visualizados</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-auto">{logs.length}</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-semibold">Eventos de Hoy</span>
                </div>
                <div className="text-3xl font-black text-indigo-900 dark:text-indigo-300 mt-auto">{eventsTodayCount}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-semibold">Usuarios Activos en este Lote</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-auto">{uniqueUsersCount}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-semibold">Eliminaciones de Registros</span>
                </div>
                <div className="text-3xl font-black text-red-700 dark:text-red-400 mt-auto">{deletesCount}</div>
            </div>
       </div>

       {/* Toolbar */}
       <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por usuario, tabla, ID de registro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
            </div>
            
            <div className="flex gap-2">
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm font-medium h-full"
                    >
                        <option value="">Todas las Tablas</option>
                        <option value="productos">productos</option>
                        <option value="ventas">ventas</option>
                        <option value="servicios">servicios</option>
                        <option value="usuarios">usuarios</option>
                        <option value="empleados">empleados</option>
                        <option value="clientes">clientes</option>
                        <option value="caja_cierres">caja_cierres</option>
                        <option value="caja_movimientos">caja_movimientos</option>
                        <option value="inventario_movimientos">inventario_movimientos</option>
                    </select>
                </div>
                
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                >
                    <option value={50}>50 resgistros</option>
                    <option value={100}>100 resgistros</option>
                    <option value={500}>500 resgistros</option>
                </select>
            </div>
       </div>

       {/* Table */}
       <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 uppercase border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                            <th className="px-6 py-4 font-semibold">Usuario</th>
                            <th className="px-6 py-4 font-semibold">Acción</th>
                            <th className="px-6 py-4 font-semibold">Tabla Afectada</th>
                            <th className="px-6 py-4 font-semibold">Registro Afectado</th>
                            <th className="px-6 py-4 text-right font-semibold">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {loading && logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                    Cargando registros de auditoría...
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                    No se encontraron registros de auditoría que coincidan con la búsqueda.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900 dark:text-slate-200">
                                                {format(new Date(log.fecha_evento), 'dd MMM yyyy', { locale: es })}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(log.fecha_evento), 'hh:mm:ss a')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-sm bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                                                {log.nombre_usuario ? log.nombre_usuario.substring(0,2).toUpperCase() : 'SYS'}
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {log.nombre_usuario || 'Sistema'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getActionColor(log.accion)}`}>
                                            <Activity className="h-3 w-3 mr-1" />
                                            {log.accion}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-md w-fit text-xs font-mono">
                                            <Database className="h-3 w-3" />
                                            {log.tabla_afectada}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            {log.nombre_registro ? (
                                                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]" title={log.nombre_registro}>
                                                    {log.nombre_registro}
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-slate-500 italic">
                                                    (Eliminado / Desconocido)
                                                </span>
                                            )}
                                            <span className="text-xs font-mono text-slate-500 opacity-70 mt-0.5">
                                                ID: #{log.id_registro}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setSelectedLog(log)}
                                            className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                        >
                                            Ver Cambios
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
       </div>

       {/* Detailed Diff Modal */}
       <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
           <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
               <DialogHeader className="border-b pb-4 shrink-0">
                   <div className="flex items-start justify-between">
                       <div>
                           <DialogTitle className="text-xl flex items-center gap-2">
                               <Shield className="h-5 w-5 text-indigo-600" />
                               Detalle de Auditoría
                           </DialogTitle>
                           <p className="text-sm text-muted-foreground mt-1 font-medium">
                               {selectedLog?.nombre_registro ? (
                                   <>Registro: <span className="text-slate-900 dark:text-slate-100">{selectedLog.nombre_registro}</span> (ID: #{selectedLog?.id_registro})</>
                               ) : (
                                   <>Inspeccionando evento sobre ID #{selectedLog?.id_registro}</>
                               )}
                           </p>
                       </div>
                       {selectedLog && (
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border shadow-sm ${getActionColor(selectedLog.accion)}`}>
                                {selectedLog.accion}
                           </span>
                       )}
                   </div>
                   
                   {/* Mini header stats */}
                   {selectedLog && (
                       <div className="flex flex-wrap items-center gap-4 mt-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                               <Database className="h-4 w-4 text-slate-400" />
                               <span className="font-semibold text-slate-900 dark:text-white">Tabla:</span> 
                               <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{selectedLog.tabla_afectada}</code>
                           </div>
                           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                               <span className="font-semibold text-slate-900 dark:text-white">ID:</span> 
                               <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{selectedLog.id_registro}</code>
                           </div>
                           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                               <User className="h-4 w-4 text-slate-400" />
                               <span className="font-semibold text-slate-900 dark:text-white">Usuario:</span> 
                               {selectedLog.nombre_usuario || 'Sistema'}
                           </div>
                           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                               <Calendar className="h-4 w-4 text-slate-400" />
                               <span>{format(new Date(selectedLog.fecha_evento), 'dd MMM yyyy, hh:mm:ss a', { locale: es })}</span>
                           </div>
                       </div>
                   )}
               </DialogHeader>

               <div className="flex-1 overflow-y-auto mt-4 px-1 pb-4">
                    {selectedLog && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-white">Comparativa de Datos (JSON)</h3>
                            <JsonDiffViewer 
                                oldData={selectedLog.datos_anteriores} 
                                newData={selectedLog.datos_nuevos} 
                            />
                        </div>
                    )}
               </div>
           </DialogContent>
       </Dialog>
    </div>
  );
}
