import React, { useState, useEffect, useCallback } from 'react';
import { companyService } from '../services/company.service';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Truck, Plus, Trash2, Loader2, Save, RefreshCw, MapPin, DollarSign } from 'lucide-react';

function formatCOP(val) {
  return `$${parseFloat(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

function ZoneCard({ zone, index, onChange, onRemove }) {
  return (
    <div className="group relative flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary/40 transition-colors">
      {/* Zone color indicator */}
      <div className="h-10 w-1.5 rounded-full bg-primary/60 shrink-0" />
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Nombre de zona</label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input value={zone.nombre} onChange={e => onChange({ ...zone, nombre: e.target.value })}
              placeholder="Norte / Centro / Sur…" className="h-8 text-sm pl-8" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Precio domicilio (COP)</label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input type="number" min={0} value={zone.precio_base}
              onChange={e => onChange({ ...zone, precio_base: parseFloat(e.target.value) || 0 })}
              className="h-8 text-sm pl-8" placeholder="8000" />
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-primary text-lg">{formatCOP(zone.precio_base)}</p>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-500 transition-colors mt-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function DeliveryConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [precioBase, setPrecioBase] = useState(0);
  const [zonas, setZonas] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await companyService.getConfig();
      setPrecioBase(parseFloat(d.precio_domicilio_base) || 0);
      setZonas(Array.isArray(d.zonas_domicilio) ? d.zonas_domicilio : []);
    } catch {
      toast({ title: '❌ Error cargando configuración', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await companyService.updateConfig({ precio_domicilio_base: precioBase, zonas_domicilio: zonas });
      toast({ title: '✅ Configuración de domicilios guardada' });
    } catch (err) {
      toast({ title: '❌ Error', description: err?.detail || String(err), variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center h-48 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Configuración de Domicilios</h2>
            <p className="text-sm text-muted-foreground">Precio base y zonas de cobertura para entregas a domicilio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Recargar
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Base price card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-1">
            <p className="font-semibold">Precio base de domicilio</p>
            <p className="text-sm text-slate-400">
              Se cobra cuando no hay zona específica seleccionada en el POS.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-44">
              <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">$</span>
              <Input type="number" min={0} className="pl-6 text-lg font-bold h-11"
                value={precioBase} onChange={e => setPrecioBase(parseFloat(e.target.value) || 0)} />
            </div>
            <span className="text-2xl font-black text-primary whitespace-nowrap">{formatCOP(precioBase)}</span>
          </div>
        </div>
      </div>

      {/* Zones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Zonas de domicilio</p>
            <p className="text-sm text-slate-400">Define zonas con precios específicos que aparecerán en el POS.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setZonas(p => [...p, { nombre: '', precio_base: 0 }])} className="gap-2 border-dashed">
            <Plus className="h-4 w-4" /> Agregar zona
          </Button>
        </div>

        {zonas.length === 0 && (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aún no hay zonas definidas.</p>
            <p className="text-xs">Sin zonas, el POS solo mostrará el precio base.</p>
          </div>
        )}

        {zonas.map((z, i) => (
          <ZoneCard key={i} zone={z} index={i}
            onChange={val => setZonas(p => p.map((x, idx) => idx === i ? val : x))}
            onRemove={() => setZonas(p => p.filter((_, idx) => idx !== i))} />
        ))}
      </div>

      {/* Quick summary */}
      {zonas.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
            <Truck className="h-4 w-4" /> Resumen de cobertura
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Base</p>
              <p className="font-bold text-sm">{formatCOP(precioBase)}</p>
            </div>
            {zonas.filter(z => z.nombre).map((z, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-400 truncate">{z.nombre}</p>
                <p className="font-bold text-sm">{formatCOP(z.precio_base)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
