import React, { useState, useEffect, useCallback } from 'react';
import { companyService } from '../services/company.service';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Building2, Phone, Mail, MapPin, Hash, Loader2, Save, RefreshCw
} from 'lucide-react';

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />}
        {children}
      </div>
    </div>
  );
}

export default function CompanyInfoPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre_empresa: '', nit_rut: '', direccion: '',
    telefonos: '', email_contacto: '',
  });

  const h = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await companyService.getConfig();
      setForm({
        nombre_empresa:  d.nombre_empresa  || '',
        nit_rut:         d.nit_rut         || '',
        direccion:       d.direccion       || '',
        telefonos:       d.telefonos       || '',
        email_contacto:  d.email_contacto  || '',
      });
    } catch {
      toast({ title: '❌ Error cargando configuración', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await companyService.updateConfig(form);
      toast({ title: '✅ Información guardada' });
    } catch (err) {
      toast({ title: '❌ Error', description: err?.detail || String(err), variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center h-48 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Información de la Empresa</h2>
            <p className="text-sm text-muted-foreground">Datos que aparecen en facturas y reportes</p>
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <Field label="Nombre de la empresa" icon={Building2}>
          <Input className="pl-10" value={form.nombre_empresa} onChange={h('nombre_empresa')} placeholder="Tecnológicos S.A.S." />
        </Field>
        <Field label="NIT / RUT" icon={Hash}>
          <Input className="pl-10" value={form.nit_rut} onChange={h('nit_rut')} placeholder="900.123.456-7" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Teléfono(s)" icon={Phone}>
            <Input className="pl-10" value={form.telefonos} onChange={h('telefonos')} placeholder="300 123 4567" />
          </Field>
          <Field label="Correo de contacto" icon={Mail}>
            <Input className="pl-10" type="email" value={form.email_contacto} onChange={h('email_contacto')} placeholder="info@empresa.com" />
          </Field>
        </div>
        <Field label="Dirección" icon={MapPin}>
          <Input className="pl-10" value={form.direccion} onChange={h('direccion')} placeholder="Calle 123 #45-67, Medellín" />
        </Field>
      </div>
    </div>
  );
}
