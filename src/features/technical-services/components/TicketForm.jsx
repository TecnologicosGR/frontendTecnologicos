import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../components/ui/toast';
import { useClients } from '../../clients/hooks/useClients';
import { useTechnicalServices } from '../hooks/useTechnicalServices';
import { Search, Save, X, UserPlus } from 'lucide-react';

import PhotoUploadModal from './PhotoUploadModal';
import { Clipboard, CheckCircle, Upload, Printer } from 'lucide-react';

export default function TicketForm({ onClose, onSuccess, isAdminService = false }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createTicket, loading: loadingTicket } = useTechnicalServices();
  const { clients, searchClients } = useClients();
  const { toast } = useToast();
  
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientResults, setClientResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Success State
  const [createdTicket, setCreatedTicket] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Client search logic
  useEffect(() => {
      const timer = setTimeout(() => {
          if (clientSearch.length > 2) {
             setIsSearching(true);
             searchClients(clientSearch).then(results => {
                 setClientResults(results || []);
                 setIsSearching(false);
             });
          } else {
             setClientResults([]);
             setIsSearching(false);
          }
      }, 300);
      return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  const selectClient = (client) => {
      setSelectedClient(client);
      setClientSearch(`${client.nombres} ${client.apellidos}`);
      setClientResults([]);
  };

  const onSubmit = async (data) => {
      if (!selectedClient) {
          toast({ title: "Error", description: "Debe seleccionar un cliente.", variant: "destructive" });
          return;
      }

      const ticketData = {
          id_cliente: selectedClient.id,
          id_empleado: null, // Sending null for unassigned/auto-assign. 0 often causes FK errors.
          tipo_dispositivo: data.tipo_dispositivo,
          marca_modelo: data.marca_modelo,
          numero_serie: data.numero_serie || "S/N",
          contrasena_sistema: data.contrasena_sistema || "No tiene",
          cables_accesorios: data.cables_accesorios || "Ninguno",
          estado_fisico_entrada: data.estado_fisico_entrada,
          motivo_ingreso: data.motivo_ingreso,
          diagnostico: data.diagnostico || "",
          es_servicio_admin: isAdminService,
          urls_evidencia_fotos: [],
          fecha_estimada_salida: data.fecha_estimada_salida || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      console.log("Submitting Ticket Data:", ticketData);

      const result = await createTicket(ticketData);
      if (result.success) {
          setCreatedTicket(result.data);
          toast({ title: "Ticket Creado", description: `Orden #${result.data.id} generada exitosamente.`, variant: "success" });
          onSuccess?.(); // Refresh background list
      } else {
          // Fix for "Objects are not valid as a React child"
          let errorMsg = result.error;
          if (typeof errorMsg === 'object') {
              errorMsg = JSON.stringify(errorMsg);
          }
          toast({ title: "Error", description: errorMsg || "Error al crear ticket", variant: "destructive" });
      }
  };

  const copyTrackingLink = () => {
      if (createdTicket?.url_rastreo) {
          navigator.clipboard.writeText(createdTicket.url_rastreo);
          toast({ title: "Enlace copiado", variant: "success" });
      }
  };

  if (createdTicket) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 text-center">
               <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle className="h-8 w-8" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Orden #{createdTicket.id} Creada</h2>
               <p className="text-slate-500 mb-6">El ticket ha sido registrado exitosamente.</p>

               {/* Tracking Link */}
               {createdTicket.url_rastreo && (
                   <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-6 flex items-center gap-2 text-left border border-slate-200 dark:border-slate-700">
                       <div className="flex-1 truncate text-xs font-mono text-slate-600 dark:text-slate-400">
                           {createdTicket.url_rastreo}
                       </div>
                       <Button variant="ghost" size="icon" onClick={copyTrackingLink} className="h-8 w-8 shrink-0">
                           <Clipboard className="h-4 w-4" />
                       </Button>
                   </div>
               )}

               <div className="grid gap-3">
                   <Button onClick={() => setShowPhotoModal(true)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                       <Upload className="h-4 w-4 mr-2" />
                       Subir Fotos del Equipo
                   </Button>
                   <Button variant="outline" className="w-full" onClick={onClose}>
                       Finalizar y Cerrar
                   </Button>
               </div>
           </div>

           {showPhotoModal && (
               <PhotoUploadModal 
                   ticketId={createdTicket.id} 
                   onClose={() => setShowPhotoModal(false)}
                   onSuccess={() => {}}
               />
           )}
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
           
           <div className="flex items-center justify-between border-b p-6 bg-white dark:bg-slate-900 shrink-0">
               <div>
                   <h2 className="font-bold text-xl text-slate-900 dark:text-white">Nueva Orden de Servicio</h2>
                   <p className="text-sm text-slate-500 mt-1">Recepción de equipo para reparación.</p>
               </div>
               <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5"/></Button>
           </div>
           
           <div className='p-6 overflow-y-auto no-scrollbar'>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                   
                   {/* Client Selection */}
                   <div className="space-y-2 relative">
                        <label className="text-sm font-medium">Cliente</label>
                        {!selectedClient ? (
                            <div className="relative">
                                {/* Search Icon - Clickable */}
                                <div 
                                    className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => {
                                        if (clientSearch.length > 2) {
                                            setIsSearching(true);
                                            searchClients(clientSearch).then(results => {
                                                setClientResults(results || []);
                                                setIsSearching(false);
                                            });
                                        }
                                    }}
                                >
                                    <Search className={`h-5 w-5 ${isSearching ? 'animate-pulse text-indigo-500' : ''}`} />
                                </div>
                                
                                <Input 
                                    placeholder="Buscar cliente por nombre o documento..." 
                                    className="pl-10"
                                    value={clientSearch}
                                    onChange={e => {
                                        setClientSearch(e.target.value);
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (clientSearch.length > 2) {
                                                setIsSearching(true);
                                                searchClients(clientSearch).then(results => {
                                                    setClientResults(results || []);
                                                    setIsSearching(false);
                                                });
                                            }
                                        }
                                    }}
                                />
                                
                                {/* Loading Indicator */}
                                {isSearching && (
                                    <div className="absolute right-3 top-3">
                                        <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {/* Auto-complete dropdown */}
                                {clientResults.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                        {clientResults.map(client => (
                                            <div 
                                                key={client.id} 
                                                className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setClientSearch('');
                                                    setClientResults([]);
                                                }}
                                            >
                                                <p className="font-bold text-sm text-slate-900 dark:text-slate-200">
                                                    {client.nombres || 'Sin Nombre'} {client.apellidos || ''}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    <span>{client.documento_identidad || 'ID Desconocido'}</span>
                                                    <span>•</span>
                                                    <span>{client.telefono || 'Sin teléfono'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* No results message */}
                                {!isSearching && clientSearch.length > 2 && clientResults.length === 0 && (
                                    <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 p-3 text-center text-sm text-slate-500">
                                        No se encontraron clientes.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold">
                                        {selectedClient.nombres ? selectedClient.nombres[0] : '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-indigo-900 dark:text-indigo-100">
                                            {selectedClient.nombres} {selectedClient.apellidos}
                                        </p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                            {selectedClient.documento_identidad || 'Sin Documento'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)} className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-800">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Tipo de Dispositivo</label>
                           <Input {...register('tipo_dispositivo', { required: true })} placeholder="Ej. Laptop, Celular..." />
                           {errors.tipo_dispositivo && <span className="text-xs text-red-500">Requerido</span>}
                       </div>
                       <div className="space-y-2">
                           <label className="text-sm font-medium">Marca y Modelo</label>
                           <Input {...register('marca_modelo', { required: true })} placeholder="Ej. HP Pavilion 15" />
                           {errors.marca_modelo && <span className="text-xs text-red-500">Requerido</span>}
                       </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium">Número de Serie (Opcional)</label>
                       <Input {...register('numero_serie')} placeholder="S/N..." />
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium">Descripción del Problema / Falla Reportada</label>
                       <textarea 
                           className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                           {...register('motivo_ingreso', { required: true })}
                           placeholder="Describa el problema reportado por el cliente..."
                       />
                       {errors.motivo_ingreso && <span className="text-xs text-red-500">Requerido</span>}
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium">Diagnóstico Preliminar (Opcional)</label>
                       <textarea 
                           className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                           {...register('diagnostico')}
                           placeholder="Diagnóstico inicial si aplica..."
                       />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Estado Físico del Equipo</label>
                             <Input {...register('estado_fisico_entrada', { required: true })} placeholder="Ej. Pantalla rayada..." />
                             {errors.estado_fisico_entrada && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Fecha Estimada de Entrega</label>
                             <Input type="date" {...register('fecha_estimada_salida')} defaultValue={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                        </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium">Accesorios Incluidos</label>
                       <Input {...register('cables_accesorios')} placeholder="Ej. Cargador, Funda..." />
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium">Contraseña / Patrón</label>
                       <Input {...register('contrasena_sistema')} placeholder="Si aplica..." />
                   </div>
                   
                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                       <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                       <Button type="submit" disabled={loadingTicket} className="bg-indigo-600 hover:bg-indigo-700">
                           {loadingTicket ? 'Guardando...' : 'Crear Orden'}
                       </Button>
                   </div>
               </form>
           </div>
       </div>
    </div>
  );
}
