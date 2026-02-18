import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTechnicalServices } from '../../features/technical-services/hooks/useTechnicalServices';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Wrench, User, Calendar, Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ModeToggle } from '../../components/ui/mode-toggle';

export default function TrackingPage() {
  const { token } = useParams();
  const { currentTicket, fetchTicketByToken, loading, error } = useTechnicalServices();

  useEffect(() => {
    console.log("TrackingPage mounted via URL. Token:", token);
    if (token) {
      fetchTicketByToken(token).then(res => console.log("Fetch result:", res));
    }
  }, [token, fetchTicketByToken]);

  // Loading state (either API loading or initial fetch pending)
  if (loading || (token && !currentTicket && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !currentTicket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ticket no encontrado</h1>
        <p className="text-slate-500 dark:text-slate-400">
            {error || "No pudimos encontrar la orden de servicio con el código de rastreo proporcionado."}
        </p>
        <div className="mt-4 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-500">
            Token: {token}
        </div>
      </div>
    );
  }

  const steps = [
    { status: 'Ingresado', label: 'Ingresado', icon: Calendar },
    { status: 'En Reparación', label: 'Diagnóstico / Reparación', icon: Wrench },
    { status: 'Terminado', label: 'Listo para retirar', icon: CheckCircle },
    { status: 'Entregado', label: 'Entregado', icon: User },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === currentTicket.estado_actual);
  const progress = Math.max(0, currentStepIndex);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Estado de Reparación</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Tecnológicos GR</p>
                </div>
            </div>
            <ModeToggle />
        </div>

        {/* Status Card */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className={`h-2 w-full ${
                currentTicket.estado_actual === 'Terminado' ? 'bg-green-500' : 
                currentTicket.estado_actual === 'Entregado' ? 'bg-slate-500' : 'bg-primary'
            }`} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2">Orden #{currentTicket.id}</Badge>
                        <CardTitle className="text-3xl font-black">{currentTicket.estado_actual}</CardTitle>
                    </div>
                    {currentTicket.estado_actual === 'Terminado' && (
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 font-bold">
                            <CheckCircle className="h-5 w-5" />
                            ¡Listo para retirar!
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-8 mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000" style={{ width: `${(progress / (steps.length - 1)) * 100}%` }}></div>
                    
                    <div className="relative z-10 flex justify-between">
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <div key={step.status} className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                                        isCompleted ? "bg-primary border-primary text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300"
                                    )}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold max-w-[80px] text-center",
                                        isCurrent ? "text-primary" : "text-slate-500 dark:text-slate-400"
                                    )}>{step.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Smartphone className="h-5 w-5 text-slate-400 mt-1" />
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Dispositivo</label>
                                <p className="font-semibold text-lg">{currentTicket.marca_modelo}</p>
                                <p className="text-slate-500 text-sm">{currentTicket.tipo_dispositivo} - {currentTicket.serie || 'S/N'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-slate-400 mt-1" />
                             <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
                                <p className="font-medium">{currentTicket.cliente_nombre}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                         <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-1" />
                             <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Problema Reportado</label>
                                <p className="text-slate-700 dark:text-slate-300 italic">"{currentTicket.motivo_ingreso}"</p>
                            </div>
                        </div>
                        {currentTicket.diagnostico && (
                             <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Wrench className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Diagnóstico Técnico</label>
                                    <p className="text-slate-700 dark:text-slate-300">{currentTicket.diagnostico}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t font-mono text-center text-xs text-slate-400">
                    ID de Seguimiento: {currentTicket.id} • Actualizado: {new Date(currentTicket.updated_at || currentTicket.created_at).toLocaleString()}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
