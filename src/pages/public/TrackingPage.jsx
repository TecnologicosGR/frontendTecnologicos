import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTechnicalServices } from '../../features/technical-services/hooks/useTechnicalServices';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Wrench, User, Calendar, Smartphone, CheckCircle, Clock, AlertCircle, DollarSign, Package, RefreshCw, Camera, X, ZoomIn } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ModeToggle } from '../../components/ui/mode-toggle';

const STATUS_MAP = {
  'recibido':      { label: 'Recibido',              color: 'text-blue-500',   bg: 'bg-blue-500' },
  'en reparación': { label: 'En Reparación',         color: 'text-amber-500',  bg: 'bg-amber-500' },
  'terminado':     { label: 'Listo para retirar',    color: 'text-green-500',  bg: 'bg-green-500' },
  'entregado':     { label: 'Entregado',             color: 'text-slate-400',  bg: 'bg-slate-400' },
};

function getStatusInfo(status) {
  return STATUS_MAP[(status || '').toLowerCase()] || { label: status, color: 'text-primary', bg: 'bg-primary' };
}

export default function TrackingPage() {
  const { token } = useParams();
  const { currentTicket, fetchTicketByToken, loading, error } = useTechnicalServices();
  const [lightboxImg, setLightboxImg] = useState(null);

  const loadData = () => {
    if (token) fetchTicketByToken(token);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading && !currentTicket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-slate-500 text-sm">Cargando estado de tu reparación…</p>
        </div>
      </div>
    );
  }

  if (error || !currentTicket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Orden no encontrada</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {error || 'No pudimos encontrar la orden de servicio con el código de rastreo proporcionado.'}
          </p>
          <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-400 break-all">
            {token}
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { status: 'recibido',      label: 'Recibido',          icon: Calendar },
    { status: 'en reparación', label: 'En Reparación',     icon: Wrench },
    { status: 'terminado',     label: 'Listo para retirar',icon: CheckCircle },
    { status: 'entregado',     label: 'Entregado',         icon: User },
  ];

  const normalizedStatus = (currentTicket.estado_actual || '').toLowerCase();
  const currentStepIndex = steps.findIndex(s => s.status === normalizedStatus);
  const effectiveIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const progressPct = steps.length > 1 ? (effectiveIndex / (steps.length - 1)) * 100 : 0;

  const appliedServices = currentTicket.appliedServices || [];
  const totalCost = appliedServices.reduce((sum, s) => sum + parseFloat(s.precio_cobrado || 0), 0);
  const logs = currentTicket.logs || [];
  const statusInfo = getStatusInfo(currentTicket.estado_actual);

  return (
    <>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Estado de Reparación</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tecnológicos GR</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />}
            <ModeToggle />
          </div>
        </div>

        {/* Main Status Card */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className={`h-2 w-full ${statusInfo.bg}`} />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <Badge variant="outline" className="mb-2 font-mono">Orden #{currentTicket.id}</Badge>
                <CardTitle className={`text-4xl font-black capitalize ${statusInfo.color}`}>
                  {statusInfo.label}
                </CardTitle>
              </div>
              {normalizedStatus === 'terminado' && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
                  <CheckCircle className="h-5 w-5" />
                  ¡Puedes pasar a retirarlo!
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Stepper */}
            <div className="mt-8 mb-10 relative px-2">
              <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 z-0" />
              <div
                className="absolute top-5 left-0 h-1 bg-primary z-0 transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
              <div className="relative z-10 flex justify-between">
                {steps.map((step, index) => {
                  const isCompleted = index <= effectiveIndex;
                  const isCurrent = index === effectiveIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center gap-2">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500',
                        isCompleted
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300'
                      )}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        'text-xs font-semibold max-w-[75px] text-center leading-tight',
                        isCurrent ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                      )}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Device + Client Info */}
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Dispositivo</label>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">{currentTicket.marca_modelo}</p>
                    <p className="text-slate-500 text-sm">{currentTicket.tipo_dispositivo} · {currentTicket.numero_serie || 'S/N'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cliente</label>
                    <p className="font-semibold text-slate-900 dark:text-white">{currentTicket.nombre_cliente || '—'}</p>
                  </div>
                </div>
                {currentTicket.fecha_estimada_salida && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Entrega estimada</label>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(currentTicket.fecha_estimada_salida).toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Problem & Diagnosis */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Problema Reportado</label>
                    <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">"{currentTicket.motivo_ingreso}"</p>
                  </div>
                </div>
                {currentTicket.diagnostico && (
                  <>
                    <Separator className="bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-start gap-3">
                      <Wrench className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Diagnóstico Técnico</label>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5">{currentTicket.diagnostico}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applied Services + Cost */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Servicios Aplicados
              </CardTitle>
              {appliedServices.length > 0 && (
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
                  <DollarSign className="h-4 w-4" />
                  Total: ${totalCost.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {appliedServices.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Aún no se han registrado servicios aplicados.</p>
                <p className="text-xs mt-1 opacity-70">Los servicios aparecerán aquí a medida que avance la reparación.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {appliedServices.map((svc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{svc.nombre_servicio}</p>
                        {svc.observacion_tecnica && (
                          <p className="text-xs text-slate-400 mt-0.5">{svc.observacion_tecnica}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      ${parseFloat(svc.precio_cobrado || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 pt-4">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-xl font-black text-primary">
                    ${totalCost.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidence Photos */}
        {(currentTicket.urls_evidencia_fotos || []).length > 0 && (
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Fotos de Evidencia
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Estado del equipo al momento de ingresar al taller</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentTicket.urls_evidencia_fotos.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxImg(url)}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all"
                  >
                    <img
                      src={url}
                      alt={`Evidencia ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event History */}
        {logs.length > 0 && (
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Historial de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 space-y-5 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                {[...logs].reverse().map((log, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-primary/60 border-2 border-white dark:border-slate-900" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {log.mensaje_cliente || log.estado_nuevo}
                      </p>
                      <span className="text-xs text-slate-400 font-mono shrink-0">
                        {new Date(log.fecha_evento).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 font-mono pb-6">
          Token de rastreo: {token?.slice(0, 8)}… · Se actualiza automáticamente cada 30s
        </div>

      </div>
    </div>

    {/* Lightbox */}
    {lightboxImg && (
      <div
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setLightboxImg(null)}
      >
        <button
          onClick={() => setLightboxImg(null)}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <img
          src={lightboxImg}
          alt="Evidencia ampliada"
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </>
  );
}
