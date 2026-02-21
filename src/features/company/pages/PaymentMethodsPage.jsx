import React, { useState, useEffect, useCallback } from 'react';
import { companyService } from '../services/company.service';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Landmark, Plus, Trash2, Loader2, Save, RefreshCw, CreditCard } from 'lucide-react';

const BANK_TYPES = ['Ahorros', 'Corriente', 'Nequi', 'Daviplata', 'Otro'];

const EMPTY_ACCOUNT = { banco: '', tipo: 'Ahorros', num_cuenta: '', titular: '' };

function AccountCard({ account, index, onChange, onRemove }) {
  const h = (f) => (e) => onChange({ ...account, [f]: e.target.value });
  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-slate-500">Cuenta #{index + 1}</span>
        </div>
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Banco / Entidad</label>
          <Input value={account.banco} onChange={h('banco')} placeholder="Bancolombia" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Tipo de cuenta</label>
          <select value={account.tipo} onChange={h('tipo')}
            className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40">
            {BANK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Número de cuenta</label>
          <Input value={account.num_cuenta} onChange={h('num_cuenta')} placeholder="123 456 789012" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Titular</label>
          <Input value={account.titular} onChange={h('titular')} placeholder="Nombre del titular" className="h-8 text-sm" />
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [infoExtra, setInfoExtra] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await companyService.getConfig();
      setCuentas(Array.isArray(d.cuentas_bancarias) ? d.cuentas_bancarias : []);
      setInfoExtra(d.info_bancaria || '');
    } catch {
      toast({ title: '❌ Error cargando cuentas', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await companyService.updateConfig({ cuentas_bancarias: cuentas, info_bancaria: infoExtra });
      toast({ title: '✅ Cuentas guardadas' });
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
          <Landmark className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Cuentas y Métodos de Pago</h2>
            <p className="text-sm text-muted-foreground">Configure las cuentas bancarias para recibir pagos</p>
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

      {/* Summary chips */}
      {cuentas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cuentas.map((c, i) => (
            <Badge key={i} variant="secondary" className="gap-1.5 py-1 px-3">
              <CreditCard className="h-3 w-3" />
              {c.banco || 'Sin banco'} · {c.tipo}
            </Badge>
          ))}
        </div>
      )}

      {/* Accounts list */}
      <div className="space-y-3">
        {cuentas.length === 0 && (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
            <Landmark className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay cuentas configuradas.</p>
            <p className="text-xs">Agrega una para que aparezca en las facturas.</p>
          </div>
        )}
        {cuentas.map((c, i) => (
          <AccountCard key={i} account={c} index={i}
            onChange={val => setCuentas(p => p.map((x, idx) => idx === i ? val : x))}
            onRemove={() => setCuentas(p => p.filter((_, idx) => idx !== i))} />
        ))}
        <Button variant="outline" onClick={() => setCuentas(p => [...p, { ...EMPTY_ACCOUNT }])} className="w-full gap-2 border-dashed h-11">
          <Plus className="h-4 w-4" /> Agregar cuenta / método de pago
        </Button>
      </div>

      {/* Free-text info for invoices */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
        <label className="text-sm font-semibold">Texto adicional para facturas</label>
        <p className="text-xs text-slate-400">Este texto aparecerá al pie de cada factura generada.</p>
        <textarea
          className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 min-h-[80px]"
          placeholder="Ej: Pagos a nombre de TECNOLÓGICOS S.A.S. · NIT 900.123.456-7 · Bancolombia Ahorros 123-456789"
          value={infoExtra}
          onChange={e => setInfoExtra(e.target.value)}
        />
      </div>
    </div>
  );
}
