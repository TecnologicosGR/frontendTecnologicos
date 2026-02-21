import React, { useState, useEffect, useCallback } from 'react';
import { companyService } from '../../features/sales/services/company.service';
import { useToast } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Building2, CreditCard, Truck, Plus, Trash2, Loader2,
  Save, MapPin, Phone, Mail, Hash, Globe, Landmark
} from 'lucide-react';

// ── Helper ────────────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

// ── Bank Account Row ──────────────────────────────────────────────────────────
function BankAccountRow({ account, onChange, onRemove }) {
  const h = (f) => (e) => onChange({ ...account, [f]: e.target.value });
  return (
    <div className="grid grid-cols-4 gap-2 items-end p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
      <Field label="Banco">
        <Input value={account.banco || ''} onChange={h('banco')} placeholder="Bancolombia" className="h-8 text-sm" />
      </Field>
      <Field label="Tipo">
        <select value={account.tipo || 'Ahorros'} onChange={h('tipo')}
          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40">
          {['Ahorros', 'Corriente', 'Nequi', 'Daviplata', 'Otro'].map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="N° Cuenta">
        <Input value={account.num_cuenta || ''} onChange={h('num_cuenta')} placeholder="1234 5678 9012" className="h-8 text-sm" />
      </Field>
      <div className="flex gap-2 items-end">
        <Field label="Titular">
          <Input value={account.titular || ''} onChange={h('titular')} placeholder="Nombre" className="h-8 text-sm" />
        </Field>
        <button onClick={onRemove} className="mb-0.5 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Delivery Zone Row ─────────────────────────────────────────────────────────
function ZoneRow({ zone, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-end p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
      <div className="flex-1">
        <Field label="Nombre de zona">
          <Input value={zone.nombre || ''} onChange={e => onChange({ ...zone, nombre: e.target.value })}
            placeholder="Zona Norte, Centro, etc." className="h-8 text-sm" />
        </Field>
      </div>
      <div className="w-36">
        <Field label="Precio (COP)">
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
            <Input type="number" min={0} className="h-8 text-sm pl-5"
              value={zone.precio_base || 0}
              onChange={e => onChange({ ...zone, precio_base: parseFloat(e.target.value) || 0 })} />
          </div>
        </Field>
      </div>
      <button onClick={onRemove} className="mb-0.5 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CompanySettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [info, setInfo] = useState({
    nombre_empresa: '', nit_rut: '', direccion: '',
    telefonos: '', email_contacto: '', info_bancaria: '',
  });
  const [cuentas, setCuentas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [precioBase, setPrecioBase] = useState(0);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await companyService.getConfig();
      setInfo({
        nombre_empresa:  data.nombre_empresa  || '',
        nit_rut:         data.nit_rut         || '',
        direccion:       data.direccion       || '',
        telefonos:       data.telefonos       || '',
        email_contacto:  data.email_contacto  || '',
        info_bancaria:   data.info_bancaria   || '',
      });
      setCuentas(Array.isArray(data.cuentas_bancarias) ? data.cuentas_bancarias : []);
      setZonas(Array.isArray(data.zonas_domicilio) ? data.zonas_domicilio : []);
      setPrecioBase(parseFloat(data.precio_domicilio_base) || 0);
    } catch {
      toast({ title: '❌ Error cargando configuración', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await companyService.updateConfig({
        ...info,
        cuentas_bancarias:     cuentas,
        zonas_domicilio:       zonas,
        precio_domicilio_base: precioBase,
      });
      toast({ title: '✅ Configuración guardada correctamente' });
    } catch (err) {
      toast({ title: '❌ Error guardando', description: err?.detail || String(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addCuenta = () => setCuentas(p => [...p, { banco: '', tipo: 'Ahorros', num_cuenta: '', titular: '' }]);
  const updateCuenta = (i, val) => setCuentas(p => p.map((c, idx) => idx === i ? val : c));
  const removeCuenta = (i) => setCuentas(p => p.filter((_, idx) => idx !== i));

  const addZona = () => setZonas(p => [...p, { nombre: '', precio_base: 0 }]);
  const updateZona = (i, val) => setZonas(p => p.map((z, idx) => idx === i ? val : z));
  const removeZona = (i) => setZonas(p => p.filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Configuración de la Empresa</h2>
            <p className="text-sm text-muted-foreground">Información que aparece en facturas y configura el sistema</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[130px]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando…' : 'Guardar todo'}
        </Button>
      </div>

      {/* ── Basic Info ──────────────────────────────────────────────────── */}
      <Section icon={Building2} title="Información General">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Nombre de la empresa">
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input className="pl-10" value={info.nombre_empresa}
                  onChange={e => setInfo(p => ({ ...p, nombre_empresa: e.target.value }))}
                  placeholder="Tecnológicos S.A.S." />
              </div>
            </Field>
          </div>
          <Field label="NIT / RUT">
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-10" value={info.nit_rut}
                onChange={e => setInfo(p => ({ ...p, nit_rut: e.target.value }))}
                placeholder="900.123.456-7" />
            </div>
          </Field>
          <Field label="Teléfono(s)">
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-10" value={info.telefonos}
                onChange={e => setInfo(p => ({ ...p, telefonos: e.target.value }))}
                placeholder="300 123 4567 / 604 123 4567" />
            </div>
          </Field>
          <Field label="Correo de contacto">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-10" type="email" value={info.email_contacto}
                onChange={e => setInfo(p => ({ ...p, email_contacto: e.target.value }))}
                placeholder="info@empresa.com" />
            </div>
          </Field>
          <Field label="Dirección">
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-10" value={info.direccion}
                onChange={e => setInfo(p => ({ ...p, direccion: e.target.value }))}
                placeholder="Calle 123 #45-67, Medellín" />
            </div>
          </Field>
        </div>
      </Section>

      {/* ── Bank Accounts ───────────────────────────────────────────────── */}
      <Section icon={Landmark} title="Cuentas Bancarias / Métodos de Pago">
        <div className="space-y-3">
          {cuentas.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay cuentas configuradas aún.</p>
          )}
          {cuentas.map((c, i) => (
            <BankAccountRow key={i} account={c}
              onChange={val => updateCuenta(i, val)}
              onRemove={() => removeCuenta(i)} />
          ))}
          <Button variant="outline" size="sm" onClick={addCuenta} className="gap-2 w-full border-dashed">
            <Plus className="h-4 w-4" /> Agregar cuenta / método de pago
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <Field label="Información bancaria adicional (texto libre para facturas)">
            <textarea
              className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
              rows={3}
              placeholder="Ej: Pagos a nombre de TECNOLÓGICOS S.A.S. · NIT 900.123.456-7"
              value={info.info_bancaria}
              onChange={e => setInfo(p => ({ ...p, info_bancaria: e.target.value }))}
            />
          </Field>
        </div>
      </Section>

      {/* ── Delivery Config ─────────────────────────────────────────────── */}
      <Section icon={Truck} title="Configuración de Domicilios">
        <div className="space-y-4">
          <Field label="Precio base de domicilio (COP)">
            <div className="relative w-48">
              <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
              <Input type="number" min={0} className="pl-7"
                value={precioBase}
                onChange={e => setPrecioBase(parseFloat(e.target.value) || 0)}
                placeholder="5000" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Precio que se cobra cuando no hay zona específica seleccionada.
            </p>
          </Field>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Zonas de domicilio</p>
              <Button variant="outline" size="sm" onClick={addZona} className="gap-1.5 border-dashed">
                <Plus className="h-3.5 w-3.5" /> Agregar zona
              </Button>
            </div>
            {zonas.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-3">
                Sin zonas. Solo se usará el precio base.
              </p>
            )}
            {zonas.map((z, i) => (
              <ZoneRow key={i} zone={z}
                onChange={val => updateZona(i, val)}
                onRemove={() => removeZona(i)} />
            ))}
          </div>
        </div>
      </Section>

      {/* Bottom save */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 px-8">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>
    </div>
  );
}
