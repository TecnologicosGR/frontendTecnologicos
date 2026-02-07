import React, { useEffect, useState } from 'react';
import { useTechnicalServices } from '../hooks/useTechnicalServices';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge'; // Assuming badge exists or use div
import { X, CheckCircle, Clock, AlertTriangle, PenTool, Upload, FileText } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';
import { cn } from '../../../lib/utils';
import { useParams, useNavigate } from 'react-router-dom';

export default function TicketDetailPage({ ticketId, onClose }) {
  // If used as a page, use useParams. If modal, use props.
  // This implementation assumes Modal usage for now to stay nimble.
  const { currentTicket, fetchTicketById, updateTicketStatus, loading } = useTechnicalServices();
  const { catalog, fetchCatalog } = useServiceCatalog();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('details'); // details, services, evidence
  
  useEffect(() => {
    if(ticketId) {
        fetchTicketById(ticketId);
        fetchCatalog(); 
    }
  }, [ticketId, fetchTicketById, fetchCatalog]);

  const handleStatusChange = async (newStatus) => {
      const result = await updateTicketStatus(ticketId, { status: newStatus });
      if (result.success) {
          toast({ title: "Estado Actualizado", variant: "success" });
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  }

  if (loading || !currentTicket) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] border border-slate-200 dark:border-slate-800">
           
           {/* Sidebar Info */}
           <div className="md:w-1/3 bg-slate-50 dark:bg-slate-950 p-6 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
               <div className="mb-6">
                   <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ticket #{currentTicket.id}</h2>
                   <div className="flex items-center gap-2 mb-4">
                       <span className={cn("px-3 py-1 rounded-full text-sm font-bold border", 
                           currentTicket.estado_actual === 'Ingresado' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                           currentTicket.estado_actual === 'Terminado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100'
                       )}>
                           {currentTicket.estado_actual}
                       </span>
                   </div>
                   <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{currentTicket.marca_modelo}</h1>
                   <p className="text-slate-500 text-sm">{currentTicket.tipo_dispositivo}</p>
               </div>

               <div className="space-y-4">
                   <div>
                       <label className="text-xs font-bold text-slate-400 block mb-1">Cliente</label>
                       <p className="font-medium text-slate-700 dark:text-slate-300">{currentTicket.cliente_nombre}</p>
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-400 block mb-1">Fecha Ingreso</label>
                       <p className="font-medium text-slate-700 dark:text-slate-300">{new Date(currentTicket.created_at).toLocaleString()}</p>
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-400 block mb-1">Problema Reportado</label>
                       <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                           {currentTicket.motivo_ingreso}
                       </p>
                   </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                   <label className="text-xs font-bold text-slate-400 block mb-3">Cambiar Estado</label>
                   <div className="grid grid-cols-1 gap-2">
                       {['En Reparación', 'En espera de Repuesto', 'Terminado', 'Entregado'].map(status => (
                           <Button 
                                key={status} 
                                variant="outline" 
                                size="sm" 
                                className={cn("justify-start", currentTicket.estado_actual === status && "bg-slate-200 dark:bg-slate-800")}
                                onClick={() => handleStatusChange(status)}
                           >
                               {status}
                           </Button>
                       ))}
                   </div>
               </div>
           </div>

           {/* Main Content */}
           <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
               {/* Header tabs */}
               <div className="flex items-center justify-between border-b px-6 py-4">
                   <div className="flex gap-6">
                       <button onClick={() => setActiveTab('details')} className={cn("text-sm font-medium pb-4 border-b-2 transition-colors", activeTab === 'details' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}>
                           Detalles Técnicos
                       </button>
                       <button onClick={() => setActiveTab('services')} className={cn("text-sm font-medium pb-4 border-b-2 transition-colors", activeTab === 'services' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}>
                           Servicios & Repuestos
                       </button>
                       <button onClick={() => setActiveTab('evidence')} className={cn("text-sm font-medium pb-4 border-b-2 transition-colors", activeTab === 'evidence' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}>
                           Evidencia
                       </button>
                   </div>
                   <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
               </div>

               {/* Tab Content */}
               <div className="p-6 flex-1 overflow-y-auto">
                   {activeTab === 'details' && (
                       <div className="space-y-6">
                           <div>
                               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-slate-400"/> Diagnóstico Técnico</h3>
                               <textarea className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Escriba el diagnóstico técnico detallado..."></textarea>
                               <div className="flex justify-end mt-2">
                                   <Button size="sm">Guardar Diagnóstico</Button>
                               </div>
                           </div>
                       </div>
                   )}

                   {/* Add more tabs content here ... */}
                   {activeTab === 'services' && (
                       <div className="text-center py-10 text-slate-400">
                           <p>Funcionalidad de agregar servicios del catálogo en construcción.</p>
                       </div>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
}
