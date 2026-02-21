import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../../lib/axios';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Clock, Search, CheckCircle2, Truck, PackageCheck, Loader2,
  Phone, MapPin, RefreshCw, AlertCircle, Store, DollarSign
} from 'lucide-react';

function formatCOP(val) {
  return `$${parseFloat(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

const ENTREGA_CONFIG = {
  en_punto:          { label: 'En punto',    Icon: Store,        color: 'bg-slate-100 text-slate-600' },
  domicilio:         { label: 'Domicilio',   Icon: Truck,        color: 'bg-amber-100 text-amber-700' },
  recoger_en_punto:  { label: 'A recoger',   Icon: PackageCheck, color: 'bg-blue-100 text-blue-700'  },
};

function EntregaBadge({ tipo }) {
  const cfg = ENTREGA_CONFIG[tipo] || ENTREGA_CONFIG.en_punto;
  const { label, Icon, color } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function SaleCard({ sale, onMarkPaid }) {
  const [marking, setMarking] = useState(false);

  const handleMark = async () => {
    setMarking(true);
    await onMarkPaid(sale.id, true);
    setMarking(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/50 p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-3 flex-wrap">

        {/* Left: sale info */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-lg text-primary">#{sale.id}</span>
            <EntregaBadge tipo={sale.tipo_entrega} />
            <span className="text-xs text-slate-400">{formatDate(sale.fecha_venta)}</span>
          </div>

          {sale.nombre_cliente && sale.nombre_cliente.trim() !== '' && (
            <p className="font-semibold text-sm">{sale.nombre_cliente}</p>
          )}
          {sale.telefono_cliente && sale.telefono_cliente.trim() !== '' && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Phone className="h-3 w-3" /> {sale.telefono_cliente}
            </p>
          )}
          {sale.direccion_entrega && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{sale.direccion_entrega}</span>
            </p>
          )}
          {sale.observaciones && (
            <p className="text-xs text-slate-400 italic">"{sale.observaciones}"</p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{sale.total_items} producto(s)</span>
            <span>·</span>
            <span>{sale.metodo_pago}</span>
          </div>
        </div>

        {/* Right: amount + action */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className="font-black text-xl text-primary">{formatCOP(sale.monto_total)}</span>
          <Button size="sm" onClick={handleMark} disabled={marking} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            {marking
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCircle2 className="h-3.5 w-3.5" />}
            Marcar pagado
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PendingSalesPage() {
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const params = q ? { search: q, limit: 100 } : { limit: 100 };
      const res = await axios.get('sales/pending', { params });
      setSales(res.data.ventas || []);
      setTotal(res.data.total || 0);
    } catch {
      toast({ title: '❌ Error cargando pendientes', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search, load]);

  const handleMarkPaid = async (id, pagado) => {
    try {
      await axios.patch(`sales/${id}/pago`, null, { params: { pagado } });
      toast({ title: `✅ Venta #${id} marcada como pagada` });
      load(search);
    } catch {
      toast({ title: '❌ Error actualizando', variant: 'destructive' });
    }
  };

  // Group by tipo_entrega for visual organization
  const domicilio = sales.filter(s => s.tipo_entrega === 'domicilio');
  const recoger   = sales.filter(s => s.tipo_entrega === 'recoger_en_punto');
  const otros     = sales.filter(s => !['domicilio','recoger_en_punto'].includes(s.tipo_entrega));

  const totalPendiente = sales.reduce((sum, s) => sum + parseFloat(s.monto_total || 0), 0);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-amber-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ventas Pendientes de Pago</h2>
            <p className="text-sm text-muted-foreground">
              Domicilios y pedidos para recoger que aún no han sido cobrados
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(search)} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-amber-600">{total}</p>
          <p className="text-xs text-amber-500 mt-0.5">Pendientes</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-primary">{formatCOP(totalPendiente)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Por cobrar</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-blue-500">{domicilio.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Domicilios</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input className="pl-10" placeholder="Buscar por cliente, dirección o # venta…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : sales.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-400 opacity-60" />
          <p className="font-semibold text-slate-500">¡Todo al día!</p>
          <p className="text-sm">No hay ventas pendientes de pago.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Domicilios */}
          {domicilio.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-500" />
                <p className="font-semibold text-sm">Domicilios ({domicilio.length})</p>
              </div>
              {domicilio.map(s => <SaleCard key={s.id} sale={s} onMarkPaid={handleMarkPaid} />)}
            </div>
          )}
          {/* A recoger */}
          {recoger.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-blue-500" />
                <p className="font-semibold text-sm">A recoger en punto ({recoger.length})</p>
              </div>
              {recoger.map(s => <SaleCard key={s.id} sale={s} onMarkPaid={handleMarkPaid} />)}
            </div>
          )}
          {/* Otros */}
          {otros.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-slate-400" />
                <p className="font-semibold text-sm">Otros ({otros.length})</p>
              </div>
              {otros.map(s => <SaleCard key={s.id} sale={s} onMarkPaid={handleMarkPaid} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
