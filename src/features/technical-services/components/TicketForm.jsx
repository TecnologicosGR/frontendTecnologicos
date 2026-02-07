import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../components/ui/toast';
import { useClients } from '../../clients/hooks/useClients';
import { useTechnicalServices } from '../hooks/useTechnicalServices';
import { Search, Save, X, UserPlus } from 'lucide-react';

export default function TicketForm({ onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createTicket, loading: loadingTicket } = useTechnicalServices();
  const { clients, searchClients } = useClients();
  const { toast } = useToast();
  
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientResults, setClientResults] = useState([]);

  // Client search logic
  useEffect(() => {
      const timer = setTimeout(() => {
          if (clientSearch.length > 2) {
             searchClients(clientSearch).then(results => setClientResults(results || []));
          } else {
             setClientResults([]);
          }
      }, 300);
      return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  const selectClient = (client) => {
      setSelectedClient(client);
      setClientSearch(`${client.nombre} ${client.apellido}`);
      setClientResults([]);
  };

  const onSubmit = async (data) => {
      if (!selectedClient) {
          toast({ title: "Error", description: "Debe seleccionar un cliente.", variant: "destructive" });
          return;
      }

      // Add default status "Ingresado" if backend doesn't handle it
      const ticketData = {
          ...data,
          cliente_id: selectedClient.id,
          estado_actual: "Ingresado" 
      };

      const result = await createTicket(ticketData);
      if (result.success) {
          toast({ title: "Ticket Creado", description: `Orden #${result.data.id} generada exitosamente.`, variant: "success" });
          onSuccess?.();
          onClose?.();
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

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
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input 
                                placeholder="Buscar cliente por nombre o DNI..." 
                                className="pl-10"
                                value={clientSearch}
                                onChange={e => {
                                    setClientSearch(e.target.value);
                                    if(selectedClient) setSelectedClient(null); // Reset selection on edit
                                }}
                            />
                        </div>
                        {selectedClient && (
                            <div className="text-xs text-green-600 font-bold px-2">
                                ✓ Cliente seleccionado: {selectedClient.nombre} {selectedClient.apellido}
                            </div>
                        )}
                        {/* Auto-complete dropdown */}
                        {clientResults.length > 0 && !selectedClient && (
                            <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {clientResults.map(client => (
                                    <div 
                                        key={client.id} 
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
                                        onClick={() => selectClient(client)}
                                    >
                                        <p className="font-bold">{client.nombre} {client.apellido}</p>
                                        <p className="text-xs text-slate-500">{client.email} • {client.telefono}</p>
                                    </div>
                                ))}
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
                       <label className="text-sm font-medium">Accesorios Incluidos</label>
                       <Input {...register('accesorios')} placeholder="Ej. Cargador, Funda..." />
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-medium">Contraseña / Patrón</label>
                       <Input {...register('contrasena_dispositivo')} placeholder="Si aplica..." />
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
