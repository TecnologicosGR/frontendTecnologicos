import React, { useEffect, useState } from 'react';
import { useTechnicalServices } from '../hooks/useTechnicalServices';
import { technicalService } from '../services/technical.service';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useProducts } from '../../products/hooks/useProducts';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { X, CheckCircle, Clock, AlertTriangle, PenTool, Upload, FileText, Link, ExternalLink, Calendar, Smartphone, Shield, Image as ImageIcon, Box, Trash2 } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';
import { cn } from '../../../lib/utils';
import PhotoUploadModal from './PhotoUploadModal';

export default function TicketDetailPage({ ticketId, onClose }) {
  const { currentTicket, fetchTicketById, updateTicketStatus, addAppliedService, updateTicket, getRepuestos, addRepuesto, deleteRepuesto, loading } = useTechnicalServices();
  const { catalog, fetchCatalog } = useServiceCatalog();
  const { products, fetchProducts } = useProducts();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('details'); // details, services, evidence
  const [appliedServices, setAppliedServices] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  // Diagnosis state
  const [diagnosis, setDiagnosis] = useState('');
  const [savingDiagnosis, setSavingDiagnosis] = useState(false);

  // Delivery / Payment state
  const [pendingDelivery, setPendingDelivery] = useState(false);

  // Add Service state
  const [inputMode, setInputMode] = useState('catalog'); // 'catalog', 'manual', 'inventory'
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [serviceObservation, setServiceObservation] = useState('');
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    if(ticketId) {
        fetchTicketById(ticketId);
        fetchCatalog(); 
        fetchProducts();
        fetchAppliedServices();
        fetchRepuestos();
    }
  }, [ticketId, fetchTicketById, fetchCatalog, fetchProducts]);

  useEffect(() => {
      if (currentTicket) {
          setDiagnosis(currentTicket.diagnostico || '');
      }
  }, [currentTicket]);

  const fetchAppliedServices = async () => {
      if (!ticketId) return;
      setLoadingServices(true);
      try {
          const result = await technicalService.getAppliedServices(ticketId);
          setAppliedServices(result);
      } catch (error) {
          console.error("Error fetching services", error);
      } finally {
          setLoadingServices(false);
      }
  };

  const fetchRepuestos = async () => {
      if (!ticketId) return;
      const result = await getRepuestos(ticketId);
      if (result.success) setRepuestos(result.data);
  };

  const handleStatusChange = async (newStatus, paymentMethod = null) => {
      // If setting to 'Entregado' but no payment method is provided yet, show the modal
      if (newStatus === 'Entregado' && !paymentMethod) {
          setPendingDelivery(true);
          return;
      }

      const result = await updateTicketStatus(ticketId, newStatus, null, paymentMethod);
      if (result.success) {
          toast({ title: "Estado Actualizado", variant: "success" });
          setPendingDelivery(false);
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  }

  const handleSaveDiagnosis = async () => {
      setSavingDiagnosis(true);
      const result = await updateTicket(ticketId, { diagnostico: diagnosis });
      setSavingDiagnosis(false);
      
      if (result.success) {
          toast({ title: "Diagnóstico Guardado", variant: "success" });
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  const handleAddService = async () => {
      // Inventory Mode (Repuesto)
      if (inputMode === 'inventory') {
          if (!selectedProductId || !servicePrice) return;
          setAddingService(true);
          const result = await addRepuesto(ticketId, {
              id_producto: parseInt(selectedProductId),
              cantidad: parseInt(serviceQuantity) || 1,
              precio_cobrado: parseFloat(servicePrice)
          });
          setAddingService(false);
          if (result.success) {
              toast({ title: "Repuesto Agregado", variant: "success" });
              setSelectedProductId('');
              setServicePrice('');
              setServiceQuantity(1);
              fetchRepuestos();
          } else {
              toast({ title: "Error", description: result.error, variant: "destructive" });
          }
          return;
      }

      // Catalog or Manual Mode (Mano de Obra)
      if (inputMode === 'manual') {
          if (!customServiceName || !servicePrice) return;
      } else {
          if (!selectedServiceId || !servicePrice) return;
      }
      
      setAddingService(true);
      
      const data = {
          id_servicio: ticketId,
          id_tipo_servicio: inputMode === 'manual' ? null : parseInt(selectedServiceId),
          nombre_servicio: inputMode === 'manual' ? customServiceName : null,
          precio_cobrado: parseFloat(servicePrice),
          observacion_tecnica: serviceObservation
      };

      const result = await addAppliedService(data);
      setAddingService(false);

      if (result.success) {
          toast({ title: "Servicio Agregado", variant: "success" });
          setSelectedServiceId('');
          setCustomServiceName('');
          setServicePrice('');
          setServiceObservation('');
          fetchAppliedServices();
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  const handleDeleteRepuesto = async (id) => {
      const result = await deleteRepuesto(id);
      if (result.success) {
          toast({ title: "Repuesto removido", variant: "success" });
          fetchRepuestos();
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  };

  if (loading || !currentTicket) return <div className="p-10 text-center">Cargando...</div>;

  const totalServices = appliedServices.reduce((sum, s) => sum + Number(s.precio_cobrado), 0) + 
                        repuestos.reduce((sum, r) => sum + (Number(r.precio_cobrado) * r.cantidad), 0);
  const evidencePhotos = currentTicket.urls_evidencia_fotos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] border border-slate-200 dark:border-slate-800">
           
           {/* Sidebar Info */}
           <div className="md:w-[320px] bg-slate-50 dark:bg-slate-950 p-6 border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 transition-all">
               <div className="mb-6">
                   <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket #{currentTicket.id}</span>
                        <span className="text-xs text-slate-400">{new Date(currentTicket.created_at || currentTicket.fecha_ingreso).toLocaleDateString()}</span>
                   </div>
                   
                   <div className="mb-4">
                       <span className={cn("px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-sm", 
                           currentTicket.estado_actual === 'Ingresado' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                           currentTicket.estado_actual === 'En reparación' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                           currentTicket.estado_actual === 'Terminado' ? 'bg-green-50 text-green-700 border-green-200' : 
                           'bg-slate-100 text-slate-700 border-slate-200'
                       )}>
                           <div className={cn("w-1.5 h-1.5 rounded-full",
                                currentTicket.estado_actual === 'Ingresado' ? 'bg-blue-500' : 
                                currentTicket.estado_actual === 'En reparación' ? 'bg-amber-500' :
                                currentTicket.estado_actual === 'Terminado' ? 'bg-green-500' : 
                                'bg-slate-500'
                           )} />
                           {currentTicket.estado_actual}
                       </span>
                   </div>

                   <div className="flex items-center gap-2 mb-1">
                       <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{currentTicket.marca_modelo}</h1>
                       {currentTicket.es_servicio_admin && (
                           <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                               Admin
                           </span>
                       )}
                   </div>
                   <p className="text-slate-500 text-sm font-medium">{currentTicket.tipo_dispositivo}</p>
                   {currentTicket.numero_serie && <p className="text-xs text-slate-400 mt-1 font-mono">S/N: {currentTicket.numero_serie}</p>}
               </div>

               <div className="space-y-6">
                   {/* Client Card */}
                   <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">Cliente</label>
                       <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                {currentTicket.nombre_cliente ? currentTicket.nombre_cliente[0] : '?'}
                           </div>
                           <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-slate-200">{currentTicket.nombre_cliente || 'Cliente sin nombre'}</p>
                                <p className="text-xs text-slate-500">{currentTicket.email || 'Sin email'}</p>
                                <p className="text-xs text-slate-500">{currentTicket.telefono || 'Sin teléfono'}</p>
                           </div>
                       </div>
                   </div>

                   {/* Key Dates */}
                   <div>
                       <label className="text-xs font-bold text-slate-400 block mb-3 uppercase">Fechas Importantes</label>
                       <div className="space-y-3">
                           <div className="flex items-center justify-between text-sm">
                               <span className="text-slate-500 flex items-center gap-2"><Calendar className="h-3.5 w-3.5"/> Ingreso</span>
                               <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(currentTicket.fecha_ingreso).toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center justify-between text-sm">
                               <span className="text-slate-500 flex items-center gap-2"><Clock className="h-3.5 w-3.5"/> Estimada</span>
                               <span className="font-medium text-slate-700 dark:text-slate-300">
                                   {currentTicket.fecha_estimada_salida ? new Date(currentTicket.fecha_estimada_salida).toLocaleDateString() : '-'}
                               </span>
                           </div>
                           {currentTicket.fecha_entrega_real && (
                               <div className="flex items-center justify-between text-sm">
                                   <span className="text-slate-500 flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500"/> Entrega</span>
                                   <span className="font-medium text-green-700 dark:text-green-400">{new Date(currentTicket.fecha_entrega_real).toLocaleDateString()}</span>
                               </div>
                           )}
                       </div>
                   </div>

                   {/* Action Buttons */}
                   <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                       <label className="text-xs font-bold text-slate-400 block mb-3 uppercase">Acciones Rápidas</label>
                       <div className="grid grid-cols-2 gap-2">
                            {['En Reparación', 'Terminado'].map(status => (
                                <Button 
                                     key={status} 
                                     variant="outline" 
                                     size="sm" 
                                     className={cn("text-xs justify-start", currentTicket.estado_actual === status && "bg-slate-100 border-slate-300 dark:bg-slate-800")}
                                     onClick={() => handleStatusChange(status)}
                                >
                                    {status}
                                </Button>
                            ))}
                            
                            {currentTicket.estado_actual !== 'Entregado' ? (
                                <Button 
                                     onClick={() => handleStatusChange('Entregado')}
                                     className="col-span-2 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-[0_0_15px_-3px_rgba(5,150,105,0.3)] hover:shadow-[0_0_20px_-3px_rgba(5,150,105,0.5)] transition-all"
                                >
                                    💳 Cobrar y Entregar
                                </Button>
                            ) : (
                                <div className="col-span-2 mt-2 text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800/30">
                                    <CheckCircle className="h-4 w-4" />
                                    Pagado en {currentTicket.metodo_pago || 'Efectivo'}
                                </div>
                            )}
                        </div>
                   </div>
                   
                   {/* Tracking Link */}
                   <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                       <div className="flex items-center justify-between mb-2">
                           <label className="text-xs font-bold text-slate-400 uppercase">Tracking Público</label>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
                                window.open(`/tracking/${currentTicket.token_rastreo || currentTicket.id}`, '_blank');
                            }}>
                                <ExternalLink className="h-3 w-3 text-slate-400" />
                            </Button>
                       </div>
                       <div className="flex gap-2">
                            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-[10px] truncate font-mono text-slate-600 dark:text-slate-400 select-all">
                                {window.location.origin}/tracking/{currentTicket.token_rastreo || currentTicket.id}
                            </div>
                            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/tracking/${currentTicket.token_rastreo || currentTicket.id}`);
                                toast({ title: "Enlace copiado", variant: "success" });
                            }}>
                                <Link className="h-3 w-3" />
                            </Button>
                       </div>
                   </div>
               </div>
           </div>

           {/* Main Content */}
           <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
               {/* Header tabs */}
               <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 pt-4 shrink-0">
                   <div className="flex gap-8">
                       <button onClick={() => setActiveTab('details')} className={cn("text-sm font-bold pb-4 border-b-2 transition-all flex items-center gap-2", activeTab === 'details' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                           <Smartphone className="h-4 w-4" /> Detalles
                       </button>
                       <button onClick={() => setActiveTab('services')} className={cn("text-sm font-bold pb-4 border-b-2 transition-all flex items-center gap-2", activeTab === 'services' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                           <PenTool className="h-4 w-4" /> Servicios
                       </button>
                       <button onClick={() => setActiveTab('evidence')} className={cn("text-sm font-bold pb-4 border-b-2 transition-all flex items-center gap-2", activeTab === 'evidence' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                           <ImageIcon className="h-4 w-4" /> Evidencia <span className="text-[10px] bg-slate-100 px-1.5 rounded-full">{evidencePhotos.length}</span>
                       </button>
                   </div>
                   <Button variant="ghost" size="icon" onClick={onClose} className="mb-2"><X className="h-5 w-5" /></Button>
               </div>

               {/* Tab Content */}
               <div className="p-8 flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
                   
                   {/* TAB: DETAILS */}
                   {activeTab === 'details' && (
                       <div className="space-y-8 max-w-3xl mx-auto">
                           {/* Info Grid */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Motivo Ingreso</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm leading-relaxed">
                                        {currentTicket.motivo_ingreso}
                                    </p>
                               </div>
                               <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Estado Físico (Entrada)</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm leading-relaxed">
                                        {currentTicket.estado_fisico_entrada || 'No registrado'}
                                    </p>
                               </div>
                               <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Cables & Accesorios</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                        {currentTicket.cables_accesorios || 'Ninguno'}
                                    </p>
                               </div>
                               <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Password del Sistema</label>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 inline-block">
                                            {currentTicket.contrasena_sistema || 'No tiene'}
                                        </div>
                                    </div>
                               </div>
                           </div>

                           <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

                           {/* Diagnosis Section */}
                           <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-indigo-600"/> Diagnóstico Técnico
                                    </h3>
                                    <span className="text-xs text-slate-400">Solo uso interno</span>
                                </div>
                                <textarea 
                                     value={diagnosis}
                                     onChange={(e) => setDiagnosis(e.target.value)}
                                     className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none text-sm leading-relaxed shadow-sm transition-all focus:border-indigo-500" 
                                     placeholder="Escriba el diagnóstico técnico detallado, hallazgos y procedimientos a seguir..."
                                ></textarea>
                                <div className="flex justify-end mt-4">
                                    <Button onClick={handleSaveDiagnosis} disabled={savingDiagnosis} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {savingDiagnosis ? 'Guardando...' : 'Guardar Diagnóstico'}
                                    </Button>
                                </div>
                           </div>
                       </div>
                   )}

                   {/* TAB: SERVICES & PARTS */}
                   {activeTab === 'services' && (
                       <div className="space-y-8 max-w-4xl mx-auto">
                           {/* Add Service/Part Card */}
                           <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                               <div className="flex items-center justify-between mb-4">
                                   <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                       <PenTool className="h-4 w-4"/> Agregar Costo a la Orden
                                   </h3>
                                   <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                        <button 
                                            onClick={() => setInputMode('catalog')}
                                            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", inputMode==='catalog' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700")}
                                        >
                                            Catálogo
                                        </button>
                                        <button 
                                            onClick={() => setInputMode('manual')}
                                            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", inputMode==='manual' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700")}
                                        >
                                            Manual
                                        </button>
                                        <button 
                                            onClick={() => setInputMode('inventory')}
                                            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1", inputMode==='inventory' ? "bg-indigo-600 shadow text-white" : "text-slate-500 hover:text-slate-700")}
                                        >
                                            <Box className="w-3 h-3"/> Repuesto
                                        </button>
                                   </div>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                   {inputMode === 'catalog' && (
                                       <div className="md:col-span-2">
                                           <select 
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                value={selectedServiceId}
                                                onChange={(e) => {
                                                    const id = e.target.value;
                                                    setSelectedServiceId(id);
                                                    const svc = catalog.find(c => c.id === parseInt(id));
                                                    if(svc) setServicePrice(svc.precio_sugerido);
                                                }}
                                           >
                                               <option value="">Seleccionar Reparación...</option>
                                               {catalog.filter(c => c.activo).map(c => (
                                                   <option key={c.id} value={c.id}>{c.nombre_servicio}</option>
                                               ))}
                                           </select>
                                       </div>
                                   )}
                                   {inputMode === 'manual' && (
                                       <div className="md:col-span-2">
                                           <input 
                                                type="text"
                                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                placeholder="Nombre del servicio o labor manual..."
                                                value={customServiceName}
                                                onChange={(e) => setCustomServiceName(e.target.value)}
                                           />
                                       </div>
                                   )}
                                   {inputMode === 'inventory' && (
                                       <>
                                        <div className="md:col-span-1">
                                            <select 
                                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    value={selectedProductId}
                                                    onChange={(e) => {
                                                        const id = e.target.value;
                                                        setSelectedProductId(id);
                                                        const prod = products.find(p => p.id === parseInt(id));
                                                        if(prod) setServicePrice(prod.precio_venta_normal);
                                                    }}
                                            >
                                                <option value="">Buscar en Inventario...</option>
                                                {products.filter(p => p.activo && p.existencias > 0).map(p => (
                                                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.existencias})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-1">
                                            <input 
                                                    type="number" 
                                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    placeholder="Cant."
                                                    min="1"
                                                    value={serviceQuantity}
                                                    onChange={(e) => setServiceQuantity(e.target.value)}
                                            />
                                        </div>
                                       </>
                                   )}
                                   
                                   <div>
                                       <input 
                                            type="number" 
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder={inputMode === 'inventory' ? "Precio Venta Ud. ($)" : "Precio ($)"}
                                            value={servicePrice}
                                            onChange={(e) => setServicePrice(e.target.value)}
                                       />
                                   </div>
                                   <div>
                                       <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" onClick={handleAddService} disabled={addingService || (inputMode==='catalog' && !selectedServiceId) || (inputMode==='manual' && !customServiceName) || (inputMode==='inventory' && !selectedProductId)}>
                                           {addingService ? '...' : 'Agregar'}
                                       </Button>
                                   </div>
                               </div>
                               {inputMode !== 'inventory' && (
                                   <div>
                                       <input 
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="Observación técnica (Opcional)..."
                                            value={serviceObservation}
                                            onChange={(e) => setServiceObservation(e.target.value)}
                                       />
                                   </div>
                               )}
                           </div>

                           {/* Services List */}
                           <div className="space-y-4">
                               <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center justify-between">
                                   <span>Detalle de Cobro</span>
                                   <span className="text-sm font-normal text-slate-500">{appliedServices.length + repuestos.length} items</span>
                               </h3>
                               
                               {(appliedServices.length === 0 && repuestos.length === 0) ? (
                                   <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50">
                                       <p>No se han registrado servicios ni repuestos.</p>
                                   </div>
                               ) : (
                                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                       <table className="w-full text-sm">
                                           <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                                               <tr>
                                                   <th className="text-left p-4 font-bold text-slate-600 dark:text-slate-400">Concepto</th>
                                                   <th className="text-left p-4 font-bold text-slate-600 dark:text-slate-400">Detalles</th>
                                                   <th className="text-right p-4 font-bold text-slate-600 dark:text-slate-400">Subtotal</th>
                                                   <th className="text-right p-4 font-bold text-slate-600 dark:text-slate-400 w-16"></th>
                                               </tr>
                                           </thead>
                                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                               
                                               {appliedServices.map((item) => (
                                                   <tr key={`svc-${item.id}`} className="hover:bg-slate-50/50 transition-colors">
                                                       <td className="p-4">
                                                            <div className="font-medium text-slate-900 dark:text-white">{item.nombre_servicio}</div>
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">Mano de Obra</span>
                                                       </td>
                                                       <td className="p-4 text-slate-500 italic">{item.observacion_tecnica || '-'}</td>
                                                       <td className="p-4 text-right font-mono font-medium text-slate-900 dark:text-white">${Number(item.precio_cobrado).toLocaleString()}</td>
                                                       <td className="p-4 pb-3 pr-4 text-right"></td>
                                                   </tr>
                                               ))}

                                               {repuestos.map((item) => (
                                                   <tr key={`rep-${item.id}`} className="hover:bg-slate-50/50 transition-colors bg-indigo-50/30">
                                                       <td className="p-4">
                                                            <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                                                <Box className="h-4 w-4 text-indigo-500"/>
                                                                {item.nombre}
                                                            </div>
                                                            <span className="text-[10px] uppercase font-bold text-indigo-400">Repuesto (Retirado de Inventario)</span>
                                                       </td>
                                                       <td className="p-4 text-slate-500 text-xs">
                                                            Cant: <strong>{item.cantidad}</strong> x ${Number(item.precio_cobrado).toLocaleString()}/ud <br/>
                                                            <span className="font-mono text-[10px]">REF: {item.codigo_referencia}</span>
                                                       </td>
                                                       <td className="p-4 text-right font-mono font-medium text-slate-900 dark:text-white">
                                                            ${(Number(item.precio_cobrado) * item.cantidad).toLocaleString()}
                                                       </td>
                                                       <td className="p-4 text-right">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRepuesto(item.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                       </td>
                                                   </tr>
                                               ))}

                                               <tr className="bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 w-full">
                                                   <td className="p-4 pt-6" colSpan="2">
                                                       <span className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-wider">Total a Pagar</span>
                                                   </td>
                                                   <td className="p-4 pt-6 text-right" colSpan="2">
                                                       <span className="font-black text-2xl text-indigo-600 pr-5">${totalServices.toLocaleString()}</span>
                                                   </td>
                                               </tr>
                                           </tbody>
                                       </table>
                                   </div>
                               )}
                           </div>
                       </div>
                   )}
                   
                   {/* TAB: EVIDENCE */}
                   {activeTab === 'evidence' && (
                        <div className="space-y-6 max-w-5xl mx-auto">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Evidencia Fotográfica</h3>
                                    <p className="text-sm text-slate-500">Fotos del estado del equipo y proceso.</p>
                                </div>
                                <Button onClick={() => setShowPhotoModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                    <Upload className="h-4 w-4 mr-2" /> Subir Fotos
                                </Button>
                            </div>

                            {evidencePhotos.length === 0 ? (
                                <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 flex flex-col items-center">
                                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <ImageIcon className="h-8 w-8" />
                                    </div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">No hay evidencia fotográfica.</p>
                                    <p className="text-sm mt-1">Sube fotos para documentar el estado del equipo.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {evidencePhotos.map((url, idx) => (
                                        <div key={idx} className="group relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer">
                                            <img src={url} alt={`Evidencia ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-4 opacity-0 group-hover:opacity-100">
                                                <Button size="sm" variant="secondary" className="w-full text-xs bg-white/90 backdrop-blur" onClick={() => window.open(url, '_blank')}>
                                                    Ver Original
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                   )}
               </div>
           </div>
       </div>
       
       {showPhotoModal && (
           <PhotoUploadModal 
               ticketId={ticketId}
               onClose={() => setShowPhotoModal(false)}
               onSuccess={() => {
                   fetchTicketById(ticketId); // Refresh ticket data to show new photos
               }}
           />
       )}

       {/* Payment modal when delivering */}
       {pendingDelivery && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Entregado y Pagado</h3>
             <p className="text-sm text-slate-500 mb-6">¿Con qué método te pagaron los <strong className="text-indigo-600">${totalServices.toLocaleString()}</strong> de esta orden?</p>
             <div className="grid grid-cols-2 gap-3 mb-6">
                 <Button variant="outline" className="h-12 font-bold active:scale-95" onClick={() => handleStatusChange('Entregado', 'Efectivo')}>Efectivo</Button>
                 <Button variant="outline" className="h-12 font-bold active:scale-95" onClick={() => handleStatusChange('Entregado', 'Transferencia')}>Transfer.</Button>
                 <Button variant="outline" className="col-span-2 h-12 font-bold active:scale-95 text-slate-500" onClick={() => handleStatusChange('Entregado', 'Otros Bancos / Mixto')}>Otro / Mixto / Múltiple</Button>
             </div>
             <div className="flex justify-end">
               <Button variant="ghost" onClick={() => setPendingDelivery(false)}>Cancelar</Button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
