import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../../lib/axios';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  TrendingDown, TrendingUp, Package, Search, RefreshCw,
  Loader2, Filter, ArrowDownLeft, ArrowUpRight, ShoppingCart, Pencil
} from 'lucide-react';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

const TIPO_CONFIG = {
  entrada: {
    label: 'Entrada',
    Icon: ArrowUpRight,
    badge: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    row: 'border-l-4 border-green-400',
  },
  salida: {
    label: 'Salida',
    Icon: ArrowDownLeft,
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    row: 'border-l-4 border-red-400',
  },
};

function MovementRow({ mov }) {
  const cfg = TIPO_CONFIG[mov.tipo_movimiento] || TIPO_CONFIG.salida;
  const { Icon, badge, row } = cfg;
  const isNegative = mov.delta < 0;

  // Infer motivo display
  let motivoDisplay = mov.motivo || null;
  if (!motivoDisplay && mov.id_venta) motivoDisplay = `Venta #${mov.id_venta}`;
  if (!motivoDisplay) motivoDisplay = mov.tipo_movimiento === 'entrada' ? 'Ajuste de entrada' : 'Ajuste de salida';

  return (
    <div className={`flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl ${row} hover:shadow-sm transition-shadow`}>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${badge}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{mov.nombre_producto}</p>
        <p className="text-xs text-slate-400">{mov.codigo_referencia} · {motivoDisplay}</p>
      </div>
      <div className="text-center shrink-0 hidden sm:block">
        <p className="text-xs text-slate-400">Antes → Después</p>
        <p className="text-sm font-medium">{mov.cantidad_antes} → {mov.cantidad_despues}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-black text-lg ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
          {isNegative ? '' : '+'}{mov.delta}
        </p>
        <p className="text-[10px] text-slate-400">{formatDate(mov.fecha)}</p>
      </div>
    </div>
  );
}

export default function InventoryMovementsPage() {
  const { toast } = useToast();
  const [movs, setMovs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState(''); // '' | 'entrada' | 'salida'
  const [productFilter, setProductFilter] = useState('');

  const load = useCallback(async (productId = '') => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (tipoFilter)  params.tipo = tipoFilter;
      if (productId)   params.product_id = productId;
      const res = await axios.get('inventory/movements', { params });
      setMovs(res.data.movimientos || []);
      setTotal(res.data.total || 0);
    } catch {
      toast({ title: '❌ Error cargando historial', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [tipoFilter, toast]);

  useEffect(() => { load(); }, [load]);

  // Client-side search filter by product name
  const filtered = movs.filter(m => {
    if (!search) return true;
    return (
      m.nombre_producto?.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo_referencia?.toLowerCase().includes(search.toLowerCase()) ||
      m.motivo?.toLowerCase().includes(search.toLowerCase()) ||
      String(m.id_venta)?.includes(search)
    );
  });

  const entradas = filtered.filter(m => m.delta > 0).length;
  const salidas  = filtered.filter(m => m.delta < 0).length;
  const netUnits = filtered.reduce((s, m) => s + m.delta, 0);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Historial de Inventario</h2>
            <p className="text-sm text-muted-foreground">Registro de todas las entradas y salidas de stock</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <p className="text-2xl font-black text-green-500">{entradas}</p>
          <p className="text-xs text-slate-400 mt-0.5">Entradas</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <p className="text-2xl font-black text-red-500">{salidas}</p>
          <p className="text-xs text-slate-400 mt-0.5">Salidas</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <p className={`text-2xl font-black ${netUnits >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {netUnits >= 0 ? '+' : ''}{netUnits}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Neto (unidades)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input className="pl-10" placeholder="Buscar por producto, código o motivo…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {[
            { key: '', label: 'Todos' },
            { key: 'entrada', label: '↑ Entradas' },
            { key: 'salida',  label: '↓ Salidas' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTipoFilter(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                tipoFilter === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-500">Sin movimientos</p>
          <p className="text-sm">Los cambios de stock se registrarán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => <MovementRow key={m.id} mov={m} />)}
        </div>
      )}

      {/* Footer info */}
      {filtered.length > 0 && (
        <p className="text-xs text-center text-slate-400 pb-4">
          Mostrando {filtered.length} de {total} movimientos
        </p>
      )}
    </div>
  );
}
