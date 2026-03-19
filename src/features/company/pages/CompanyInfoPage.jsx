import React, { useState, useEffect, useCallback, useRef } from 'react';
import { companyService } from '../services/company.service';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Building2, Phone, Mail, MapPin, Hash, Loader2, Save,
  RefreshCw, Image, PenTool, CreditCard, Banknote, Upload, X
} from 'lucide-react';

// ── Sección con título ────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Campo de formulario ───────────────────────────────────────────────────────
function Field({ label, icon: Icon, children, col }) {
  return (
    <div className={`space-y-1.5 ${col || ''}`}>
      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />}
        {children}
      </div>
    </div>
  );
}

// ── Componente de subida de imagen ────────────────────────────────────────────
function ImageUpload({ label, field, currentUrl, onUploaded }) {
  const { toast } = useToast();
  const [previewing, setPreviewing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: '❌ Solo se permiten imágenes', variant: 'destructive' }); return;
    }
    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewing(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const updated = await companyService.uploadImage(file, field);
      onUploaded(updated);
      toast({ title: `✅ ${label} actualizado` });
    } catch (err) {
      toast({ title: '❌ Error subiendo imagen', description: err?.detail || String(err), variant: 'destructive' });
      setPreviewing(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const thumb = previewing || currentUrl;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <div
        className="group relative flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {/* Preview */}
        {thumb ? (
          <img
            src={thumb}
            alt={label}
            className="h-16 max-w-[120px] object-contain rounded-lg border border-slate-100 dark:border-slate-800 bg-white"
          />
        ) : (
          <div className="h-16 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Image className="h-6 w-6 text-slate-300" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" /> Subiendo…
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {thumb ? 'Cambiar imagen' : 'Subir imagen'}
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, SVG · Clic para seleccionar</p>
            </>
          )}
        </div>

        <Upload className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CompanyInfoPage() {
  const { toast } = useToast();
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [config,  setConfig]    = useState({}); // full config from backend
  const [form,    setForm]      = useState({
    nombre_empresa:    '',
    nit_rut:           '',
    direccion:         '',
    telefonos:         '',
    email_contacto:    '',
    info_bancaria:     '',
    precio_domicilio_base: '',
  });

  const h = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await companyService.getConfig();
      setConfig(d);
      setForm({
        nombre_empresa:          d.nombre_empresa          || '',
        nit_rut:                 d.nit_rut                 || '',
        direccion:               d.direccion               || '',
        telefonos:               d.telefonos               || '',
        email_contacto:          d.email_contacto          || '',
        info_bancaria:           d.info_bancaria           || '',
        precio_domicilio_base:   d.precio_domicilio_base   != null ? String(d.precio_domicilio_base) : '',
      });
    } catch {
      toast({ title: '❌ Error cargando configuración', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        precio_domicilio_base: form.precio_domicilio_base !== '' ? parseFloat(form.precio_domicilio_base) : 0,
      };
      const updated = await companyService.updateConfig(payload);
      setConfig(updated);
      toast({ title: '✅ Información guardada' });
    } catch (err) {
      toast({ title: '❌ Error', description: err?.detail || String(err), variant: 'destructive' });
    } finally { setSaving(false); }
  };

  // Called when image upload succeeds — update the local config so preview refreshes
  const handleImageUploaded = (updated) => setConfig(updated);

  if (loading) return (
    <div className="flex justify-center h-64 items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Información de la Empresa</h2>
            <p className="text-sm text-muted-foreground">Datos que aparecen en facturas, tickets y reportes</p>
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

      {/* ── Datos generales ── */}
      <Section title="Datos generales" icon={Building2}>
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
          <Input className="pl-10" value={form.direccion} onChange={h('direccion')} placeholder="Calle 123 #45-67, Ciudad" />
        </Field>
      </Section>

      {/* ── Imágenes de la empresa ── */}
      <Section title="Imágenes de la empresa" icon={Image}>
        <ImageUpload
          label="Logo de la empresa"
          field="url_logo"
          currentUrl={config.url_logo}
          onUploaded={handleImageUploaded}
        />
        <ImageUpload
          label="Firma del representante legal"
          field="url_firma_representante"
          currentUrl={config.url_firma_representante}
          onUploaded={handleImageUploaded}
        />
        <p className="text-xs text-slate-400 mt-1">
          El logo y la firma aparecen en las facturas y tickets PDF generados por el sistema.
        </p>
      </Section>

      {/* ── Información bancaria ── */}
      <Section title="Información bancaria" icon={CreditCard}>
        <Field label="Datos bancarios (texto libre para facturas)" icon={CreditCard}>
          <textarea
            rows={4}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
            value={form.info_bancaria}
            onChange={h('info_bancaria')}
            placeholder={"Banco XYZ\nN° Cuenta: 1234567890\nTitular: Juan Pérez"}
          />
        </Field>
        <p className="text-xs text-slate-400">
          Este texto aparece en las facturas de venta al lado del método de pago.
        </p>
      </Section>

      {/* ── Domicilios ── */}
      <Section title="Configuración de domicilios" icon={Banknote}>
        <Field label="Precio base de domicilio ($)" icon={Banknote}>
          <Input
            className="pl-10"
            type="number"
            min="0"
            step="500"
            value={form.precio_domicilio_base}
            onChange={h('precio_domicilio_base')}
            placeholder="5000"
          />
        </Field>
        <p className="text-xs text-slate-400">
          Este valor se aplica por defecto al crear ventas con entrega a domicilio.
          Las zonas específicas se configuran en <strong>Configuración → Domicilios</strong>.
        </p>
      </Section>

    </div>
  );
}
