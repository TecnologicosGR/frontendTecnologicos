import React, { useEffect, useState, useCallback } from 'react';
import { useSales } from '../hooks/useSales';
import { salesService } from '../services/sales.service';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
  Receipt, Search, RefreshCw, Eye, Trash2, X, Loader2,
  TrendingUp, DollarSign, CreditCard, Banknote, FileText,
  ChevronLeft, ChevronRight, Calendar, BarChart2, Filter
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(val) {
  return `$${parseFloat(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}
function toISO(d) { return d ? d.toISOString().slice(0, 10) : ''; }

// Date helpers
// toISO: gets the LOCAL calendar date as YYYY-MM-DD (avoids UTC-date mismatch)
function toLocalDate(d) {
  if (!d) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// For "hasta", we use the NEXT local day's date so that the full local day is covered
// even when the DB stores timestamps in UTC. A sale at 9 PM Colombia = 2 AM UTC next day
// will be included because next-local-day = "2026-02-21" → old backend: < "2026-02-22" ✓
function nextDay(d) {
  if (!d) return undefined;
  const nd = new Date(d);
  nd.setDate(nd.getDate() + 1);
  return nd;
}

// ── Date Presets ─────────────────────────────────────────────────────────────
function getPreset(key) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const last30 = new Date(today); last30.setDate(today.getDate() - 29);

  const map = {
    hoy:    { desde: today,      hasta: nextDay(today),      label: 'Hoy' },
    ayer:   { desde: yesterday,  hasta: nextDay(yesterday),  label: 'Ayer' },
    semana: { desde: weekStart,  hasta: nextDay(today),      label: 'Esta semana' },
    mes:    { desde: monthStart, hasta: nextDay(today),      label: 'Este mes' },
    last30: { desde: last30,     hasta: nextDay(today),      label: 'Últimos 30 días' },
    todo:   { desde: null,       hasta: null,                label: 'Todos' },
  };
  return map[key] || map.hoy;
}

// ── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ summary }) {
  const cards = [
    { label: 'Ventas',        value: summary ? String(summary.total_ventas ?? 0)          : null, icon: Receipt,   color: 'text-primary',      bg: 'bg-primary/10' },
    { label: 'Recaudado',     value: summary ? formatCurrency(summary.monto_total)         : null, icon: DollarSign, color: 'text-green-600',     bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Efectivo',      value: summary ? formatCurrency(summary.total_efectivo)      : null, icon: Banknote,   color: 'text-emerald-500',   bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Transferencia', value: summary ? formatCurrency(summary.total_transferencia) : null, icon: CreditCard, color: 'text-blue-500',      bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Ganancia bruta',value: summary ? formatCurrency(summary.ganancia_bruta)      : null, icon: TrendingUp, color: 'text-violet-600',    bg: 'bg-violet-50 dark:bg-violet-950/30' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`${c.bg} rounded-xl border border-white/60 dark:border-slate-700 p-4 flex items-center gap-3 transition-all`}>
          <div className="shrink-0">
            <c.icon className={`h-5 w-5 ${c.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.label}</p>
            {c.value === null
              ? <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-0.5" />
              : <p className={`font-black text-slate-900 dark:text-white text-sm leading-tight`}>{c.value}</p>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function MiniChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
      <BarChart2 className="h-8 w-8" />
      <p className="text-xs">Sin datos en el rango</p>
    </div>
  );

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="flex items-end gap-1 h-full w-full">
      {data.map((d, i) => {
        const pct = (d.total / maxTotal) * 100;
        const shortDay = new Date(d.dia + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {shortDay}: {formatCurrency(d.total)} ({d.ventas} vta{d.ventas > 1 ? 's' : ''})
            </div>
            <div
              className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {data.length <= 14 && (
              <span className="text-[9px] text-slate-400 truncate w-full text-center">{shortDay}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Payment Breakdown Donut (CSS) ─────────────────────────────────────────────
function PaymentBreakdown({ summary }) {
  if (!summary || summary.total_ventas === 0) return (
    <div className="flex items-center justify-center h-full text-slate-300 text-xs">Sin ventas</div>
  );
  const total = summary.monto_total || 1;
  const items = [
    { label: 'Efectivo',      val: summary.total_efectivo,      color: '#10b981' },
    { label: 'Transferencia', val: summary.total_transferencia, color: '#3b82f6' },
    { label: 'Otro',          val: summary.total_otros,         color: '#8b5cf6' },
  ].filter(i => i.val > 0);

  return (
    <div className="flex flex-col gap-2 justify-center h-full">
      {items.map(item => {
        const pct = Math.round((item.val / total) * 100);
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span className="font-bold">{pct}% · {formatCurrency(item.val)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sale Detail Modal ─────────────────────────────────────────────────────────
function SaleDetailModal({ saleId, onClose }) {
  const { fetchSaleDetail, currentSale, loading, cancelSale, updateSale } = useSales();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (saleId) fetchSaleDetail(saleId); }, [saleId]);
  useEffect(() => { if (currentSale) setEditNotes(currentSale.observaciones || ''); }, [currentSale]);

  const handleCancel = async () => {
    if (!confirm(`¿Cancelar Venta #${saleId}? Se restaurará el stock.`)) return;
    setCancelling(true);
    const result = await cancelSale(saleId);
    setCancelling(false);
    if (result.success) {
      toast({ title: `🗑️ Venta #${saleId} cancelada y stock restaurado` });
      onClose(true);
    } else {
      toast({ title: '❌ Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    const result = await updateSale(saleId, { observaciones: editNotes });
    setSaving(false);
    toast({ title: result.success ? '✅ Guardado' : '❌ Error', description: result.error, variant: result.success ? undefined : 'destructive' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Venta #{saleId}</h3>
          </div>
          <button onClick={() => onClose()} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !currentSale ? null : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs">Cliente</p><p className="font-semibold">{currentSale.nombre_cliente || 'Anónimo'}</p></div>
              <div><p className="text-slate-400 text-xs">Vendedor</p><p className="font-semibold">{currentSale.nombre_empleado || '—'}</p></div>
              <div><p className="text-slate-400 text-xs">Fecha</p><p className="font-semibold">{formatDate(currentSale.fecha_venta)}</p></div>
              <div><p className="text-slate-400 text-xs">Método de Pago</p><Badge variant="outline">{currentSale.metodo_pago}</Badge></div>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Producto</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Cant</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Precio</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {(currentSale.items || []).map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{item.nombre_producto}</p>
                        {item.fecha_limite_garantia && <p className="text-xs text-slate-400">Garantía hasta: {item.fecha_limite_garantia}</p>}
                      </td>
                      <td className="px-3 py-2.5 text-right">{item.cantidad}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(item.precio_unitario_aplicado)}</td>
                      <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-bold">Total</td>
                    <td className="px-4 py-3 text-right font-black text-primary">{formatCurrency(currentSale.monto_total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Observaciones</label>
              <textarea className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/40" rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
              <Button variant="outline" size="sm" onClick={handleSaveNotes} disabled={saving}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Guardar observaciones
              </Button>
            </div>
            {currentSale.url_factura_pdf && (
              <a href={currentSale.url_factura_pdf} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary text-sm hover:underline">
                <FileText className="h-4 w-4" /> Ver factura PDF
              </a>
            )}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelling} className="gap-2">
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Cancelar venta y restaurar stock
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const PRESETS = ['hoy', 'ayer', 'semana', 'mes', 'last30', 'todo'];

export default function SalesHistoryPage() {
  const { sales, pagination, loading, fetchSales } = useSales();
  console.log('[SalesHistoryPage] render → sales:', sales, '| loading:', loading, '| pagination:', pagination);
  const [search, setSearch] = useState('');
  const [metodo, setMetodo] = useState('');
  const [preset, setPreset]   = useState('hoy');
  const [desdeRaw, setDesdeRaw] = useState(toISO(new Date()));
  const [hastaRaw, setHastaRaw] = useState(toISO(new Date()));
  const [useCustom, setUseCustom] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);

  // Report state
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Derived dates
  const activeDates = useCustom
    ? { desde: desdeRaw || undefined, hasta: hastaRaw || undefined }
    : (() => { const p = getPreset(preset); return { desde: toISO(p.desde) || undefined, hasta: toISO(p.hasta) || undefined }; })();

  const loadSummary = useCallback(async (desde, hasta) => {
    setSummaryLoading(true);
    try {
      const data = await salesService.getRangeSummary(desde, hasta);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const load = useCallback((p = 0) => {
    fetchSales({
      search: search || undefined,
      metodo_pago: metodo || undefined,
      fecha_desde: activeDates.desde,
      fecha_hasta: activeDates.hasta,
      limit: PAGE_SIZE,
      offset: p * PAGE_SIZE,
    });
    loadSummary(activeDates.desde, activeDates.hasta);
  }, [search, metodo, activeDates.desde, activeDates.hasta, fetchSales, loadSummary]);

  useEffect(() => { load(0); setPage(0); }, [load]);

  const applyPreset = (key) => {
    setPreset(key);
    setUseCustom(false);
  };

  const totalPages = Math.ceil(pagination.total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Historial de Ventas</h2>
            <p className="text-sm text-muted-foreground">{pagination.total} venta(s) en el rango seleccionado</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(page)} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </Button>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summaryLoading ? null : summary} />

      {/* ── Report Panel ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Ventas por día</span>
            {summaryLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 ml-auto" />}
          </div>
          <div className="h-32">
            <MiniChart data={summary?.por_dia} />
          </div>
        </div>
        {/* Payment breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Por método de pago</span>
          </div>
          <div className="h-32">
            <PaymentBreakdown summary={summary} />
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <Filter className="h-4 w-4" /> Filtros
        </div>

        {/* Date presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(key => {
            const lbl = getPreset(key).label;
            const active = !useCustom && preset === key;
            return (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'}`}
              >
                {lbl}
              </button>
            );
          })}
          {/* Custom range toggle */}
          <button
            onClick={() => setUseCustom(v => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${useCustom
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'}`}
          >
            <Calendar className="h-3 w-3" /> Rango personalizado
          </button>
        </div>

        {/* Custom date inputs */}
        {useCustom && (
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Desde</label>
              <input type="date" value={desdeRaw} onChange={e => setDesdeRaw(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Hasta</label>
              <input type="date" value={hastaRaw} onChange={e => setHastaRaw(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
          </div>
        )}

        {/* Search + method */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-10" placeholder="Buscar cliente o ID venta…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
            value={metodo} onChange={e => setMetodo(e.target.value)}
          >
            <option value="">Todos los métodos</option>
            {['Efectivo', 'Transferencia', 'Otro'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No hay ventas en este periodo</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Vendedor</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Pago</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {sales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setSelectedId(sale.id)}>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">#{sale.id}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(sale.fecha_venta)}</td>
                  <td className="px-4 py-3 font-medium">{sale.nombre_cliente || <span className="text-slate-400 italic">Anónimo</span>}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{sale.nombre_empleado || '—'}</td>
                  <td className="px-3 py-3 text-center"><Badge variant="secondary">{sale.total_items ?? '—'}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline">{sale.metodo_pago}</Badge></td>
                  <td className="px-4 py-3 text-right font-black text-primary">{formatCurrency(sale.monto_total)}</td>
                  <td className="px-4 py-3 text-slate-400"><Eye className="h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">Página {page + 1} de {totalPages} · {pagination.total} ventas</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { const np = page - 1; setPage(np); fetchSales({ search: search || undefined, metodo_pago: metodo || undefined, fecha_desde: activeDates.desde, fecha_hasta: activeDates.hasta, limit: PAGE_SIZE, offset: np * PAGE_SIZE }); }} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { const np = page + 1; setPage(np); fetchSales({ search: search || undefined, metodo_pago: metodo || undefined, fecha_desde: activeDates.desde, fecha_hasta: activeDates.hasta, limit: PAGE_SIZE, offset: np * PAGE_SIZE }); }} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <SaleDetailModal saleId={selectedId} onClose={(refresh) => { setSelectedId(null); if (refresh) load(page); }} />
      )}
    </div>
  );
}
