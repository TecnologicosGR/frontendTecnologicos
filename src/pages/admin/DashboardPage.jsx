import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../lib/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  DollarSign, Users, ShoppingBag, Wrench, Package, Clock,
  CheckCircle2, AlertTriangle, RefreshCw, TrendingUp, Loader2,
  Truck, Store, PackageCheck, ArrowRight, Activity, BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmt(val) {
  return `$${parseFloat(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

const SERVICIO_COLORS = {
  recibido:    { label: 'Recibido',    bg: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  diagnostico: { label: 'Diagnóstico', bg: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  en_reparacion:{ label: 'En reparación', bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  esperando_repuesto:{ label: 'Esperando repuesto', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  listo:       { label: 'Listo',       bg: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  entregado:   { label: 'Entregado',   bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelado:   { label: 'Cancelado',   bg: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
};

const ENTREGA_CONFIG = {
  en_punto:         { Icon: Store,        label: 'En punto' },
  domicilio:        { Icon: Truck,        label: 'Domicilio' },
  recoger_en_punto: { Icon: PackageCheck, label: 'A recoger' },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${bg} rounded-2xl border p-5 flex items-center gap-4 text-left hover:shadow-md transition-all group w-full`}
    >
      <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${color} bg-white/60 dark:bg-black/20`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>}
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="font-bold text-base">{title}</h3>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
          {action} <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Custom Bar Tooltip ───────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold mb-1">{label}</p>
      <p className="text-green-600">Cobrado: {fmt(payload[0]?.value)}</p>
      <p className="text-primary">Ventas: {payload[1]?.value ?? 0}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('dashboard/overview');
      setData(res.data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Dashboard load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // auto-refresh every 5 min
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-72 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-slate-400 text-sm">Cargando mando de control…</p>
    </div>
  );

  const d = data || {};

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Mando de Control</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {lastRefresh
              ? `Actualizado ${lastRefresh.toLocaleTimeString('es-CO', { timeStyle: 'short' })}`
              : 'Cargando…'}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Cobrado hoy" value={fmt(d.cobrado_hoy)} sub={`${d.ventas_hoy ?? 0} venta(s) hoy`}
          icon={DollarSign} color="text-green-600" bg="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50"
          onClick={() => navigate('/admin/sales')}
        />
        <KpiCard
          label="Por cobrar" value={fmt(d.pendiente_hoy)}
          sub={d.pendientes_hoy ? `${d.pendientes_hoy} venta(s) pendiente` : 'Todo cobrado ✅'}
          icon={Clock}
          color={d.pendiente_hoy > 0 ? 'text-amber-500' : 'text-slate-400'}
          bg={d.pendiente_hoy > 0
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}
          onClick={() => navigate('/admin/sales/pending')}
        />
        <KpiCard
          label="Ventas este mes" value={fmt(d.cobrado_mes)} sub={`${d.ventas_mes ?? 0} ventas totales`}
          icon={TrendingUp} color="text-primary" bg="bg-primary/5 border-primary/20"
          onClick={() => navigate('/admin/sales')}
        />
        <KpiCard
          label="Servicios abiertos" value={String(d.servicios_abiertos ?? 0)} sub="Pendientes de entrega"
          icon={Wrench} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50"
          onClick={() => navigate('/admin/technical-services')}
        />
        <KpiCard
          label="Total clientes" value={String(d.total_clientes ?? 0)} sub={`+${d.clientes_nuevos ?? 0} este mes`}
          icon={Users} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50"
          onClick={() => navigate('/admin/customers')}
        />
        <KpiCard
          label="Productos activos" value={String(d.total_productos ?? 0)} sub={`${(d.stock_bajo || []).length} con stock bajo`}
          icon={Package}
          color={(d.stock_bajo || []).length > 0 ? 'text-red-500' : 'text-slate-500'}
          bg={(d.stock_bajo || []).length > 0
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}
          onClick={() => navigate('/admin/products')}
        />
        <KpiCard
          label="Ventas hoy" value={String(d.ventas_hoy ?? 0)} sub="Transacciones del día"
          icon={ShoppingBag} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
          onClick={() => navigate('/admin/sales')}
        />
        <KpiCard
          label="Actividad" value={String((d.servicios_por_estado || {})['en_reparacion'] ?? 0)} sub="En reparación ahora"
          icon={Activity} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50"
          onClick={() => navigate('/admin/technical-services/kanban')}
        />
      </div>

      {/* ── Row 2: Chart + Pipeline ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue trend chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <SectionHeader
            title="Tendencia de ventas (6 meses)"
            sub="Solo ingresos cobrados"
            action="Ver historial"
            onAction={() => navigate('/admin/sales')}
          />
          {(d.tendencia_mensual || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-slate-300 gap-2">
              <BarChart2 className="h-10 w-10" />
              <p className="text-xs">Sin datos en el período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.tendencia_mensual} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" vertical={false} />
                <XAxis dataKey="mes" fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8"
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,100,100,0.05)' }} />
                <Bar dataKey="cobrado" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Cobrado" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <SectionHeader
            title="Pipeline de servicios"
            sub="Estado actual"
            action="Ver kanban"
            onAction={() => navigate('/admin/technical-services/kanban')}
          />
          <div className="space-y-2">
            {Object.entries(d.servicios_por_estado || {}).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin servicios registrados</p>
            ) : (
              Object.entries(d.servicios_por_estado || {})
                .sort((a, b) => b[1] - a[1])
                .map(([estado, total]) => {
                  const cfg = SERVICIO_COLORS[estado] || { label: estado, bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                  return (
                    <div key={estado} className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="font-black text-slate-700 dark:text-slate-200">{total}</span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Pending payments + Low stock ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Pending payments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <SectionHeader
            title="Ventas pendientes de cobro"
            sub="Las más antiguas primero"
            action="Ver todas"
            onAction={() => navigate('/admin/sales/pending')}
          />
          {!(d.ventas_pendientes || []).length ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-2">
              <CheckCircle2 className="h-10 w-10 text-green-400 opacity-60" />
              <p className="text-sm text-slate-400 font-semibold">¡Todo al día! Sin pendientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(d.ventas_pendientes || []).map(v => {
                const ec = ENTREGA_CONFIG[v.tipo_entrega] || ENTREGA_CONFIG.en_punto;
                return (
                  <div key={v.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <ec.Icon className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{v.nombre_cliente?.trim() || 'Anónimo'}</p>
                        <p className="text-xs text-slate-400 truncate">{v.direccion_entrega || ec.label} · #{v.id}</p>
                      </div>
                    </div>
                    <span className="font-black text-amber-600 shrink-0 text-sm">{fmt(v.monto_total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <SectionHeader
            title="Alertas de inventario"
            sub="Stock bajo o agotado"
            action="Ver productos"
            onAction={() => navigate('/admin/products')}
          />
          {!(d.stock_bajo || []).length ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-2">
              <Package className="h-10 w-10 text-green-400 opacity-60" />
              <p className="text-sm text-slate-400 font-semibold">Inventario en buen estado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(d.stock_bajo || []).map(p => {
                const isOut = p.existencias <= 0;
                return (
                  <div key={p.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                      isOut
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                        : 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30'
                    }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className={`h-4 w-4 shrink-0 ${isOut ? 'text-red-500' : 'text-orange-500'}`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{p.nombre}</p>
                        <p className="text-xs text-slate-400">{p.codigo_referencia} · {p.categoria || 'Sin cat.'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-black text-sm ${isOut ? 'text-red-600' : 'text-orange-600'}`}>
                        {p.existencias} uds
                      </span>
                      {p.stock_minimo > 0 && (
                        <p className="text-xs text-slate-400">mín. {p.stock_minimo}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Top products + Recent sales + Recent services ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <SectionHeader title="Top 5 productos" sub="Más vendidos (histórico)" />
          <div className="space-y-3">
            {!(d.top_productos || []).length ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin datos de ventas</p>
            ) : (
              (d.top_productos || []).map((p, i) => {
                const maxU = d.top_productos[0]?.unidades || 1;
                const pct = Math.round((p.unidades / maxU) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium truncate max-w-[70%]">
                        <span className="text-primary font-bold mr-1">#{i+1}</span>{p.nombre}
                      </span>
                      <span className="text-slate-400 shrink-0">{p.unidades} uds</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <SectionHeader
            title="Últimas ventas"
            sub="Más recientes"
            action="Ver historial"
            onAction={() => navigate('/admin/sales')}
          />
          <div className="space-y-2">
            {!(d.ultimas_ventas || []).length ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin ventas registradas</p>
            ) : (
              (d.ultimas_ventas || []).map(v => (
                <div key={v.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{v.nombre_cliente?.trim() || 'Anónimo'}</p>
                    <p className="text-xs text-slate-400">{fmtDate(v.fecha_venta)} · #{v.id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm text-primary">{fmt(v.monto_total)}</p>
                    {v.pagado === false ? (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">Pendiente</span>
                    ) : (
                      <span className="text-[10px] font-medium text-green-700 bg-green-100 dark:bg-green-950 px-1.5 py-0.5 rounded-full">Pagado</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent services */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <SectionHeader
            title="Servicios recientes"
            sub="Último ingreso"
            action="Ver todos"
            onAction={() => navigate('/admin/technical-services')}
          />
          <div className="space-y-2">
            {!(d.servicios_recientes || []).length ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin servicios registrados</p>
            ) : (
              (d.servicios_recientes || []).map(s => {
                const cfg = SERVICIO_COLORS[s.estado_actual] || SERVICIO_COLORS.recibido;
                return (
                  <div key={s.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.nombre_cliente?.trim() || 'Anónimo'}</p>
                      <p className="text-xs text-slate-400 truncate">{s.numero_serie || `Servicio #${s.id}`}</p>
                      <p className="text-xs text-slate-400">{fmtDate(s.fecha_ingreso)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 mt-0.5 ${cfg.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
