import { useState, useEffect, useCallback } from 'react';
import { useFinance } from '../hooks/useFinance';
import {
  DollarSign, Clock, TrendingUp, Users, Wrench,
  AlertCircle, RotateCcw, ChevronRight, X,
  Banknote, CreditCard, Package, FileText, Sun, Moon, CalendarDays
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n || 0));

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—';

const TURNS = [
  { value: 'DIURNO',   label: 'Diurno',   hours: '08:00 – 13:00', Icon: Sun,  color: 'text-amber-500',  ring: 'ring-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { value: 'NOCTURNO', label: 'Nocturno', hours: '14:00 – 19:00', Icon: Moon, color: 'text-indigo-500', ring: 'ring-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { value: 'COMPLETO', label: 'Completo', hours: '08:00 – 19:00', Icon: CalendarDays, color: 'text-slate-600', ring: 'ring-slate-400', bg: 'bg-slate-50 dark:bg-slate-900' },
];

const TURN_BADGE = {
  DIURNO:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  NOCTURNO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  COMPLETO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, Icon, iconClass }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2.5 rounded-lg ${iconClass} bg-current/10`}>
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Close Detail Modal ────────────────────────────────────────────────────────
function CloseDetailModal({ close, onClose }) {
  if (!close) return null;
  const top = close.top_productos || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-lg">
              Detalle del Cierre #{close.id}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {fmtDate(close.fecha_cierre)} · <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${TURN_BADGE[close.turno]}`}>{close.turno}</span>
              &nbsp;· {fmtTime(close.hora_inicio)} – {fmtTime(close.hora_fin)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* KPIs */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l: 'Recaudado', v: fmt(close.total_ventas), cls: 'text-green-600' },
            { l: 'Ganancia Bruta', v: fmt(close.total_ganancias), cls: 'text-emerald-600' },
            { l: 'Pendiente', v: fmt(close.total_ventas_pendientes), cls: 'text-orange-500' },
            { l: '# Ventas', v: close.total_ventas_conteo, cls: 'text-blue-600' },
            { l: 'Efectivo', v: fmt(close.total_efectivo), cls: 'text-slate-700 dark:text-slate-200' },
            { l: 'Transferencia', v: fmt(close.total_transferencia), cls: 'text-slate-700 dark:text-slate-200' },
            { l: 'Otros', v: fmt(close.total_otros), cls: 'text-slate-700 dark:text-slate-200' },
            { l: 'Clientes', v: close.total_clientes_atendidos, cls: 'text-purple-600' },
          ].map(({ l, v, cls }) => (
            <div key={l} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-slate-400 font-medium">{l}</p>
              <p className={`font-black text-base mt-0.5 ${cls}`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Top Products */}
        {top.length > 0 && (
          <div className="px-5 pb-5">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Package className="h-4 w-4" /> Top Productos Vendidos
            </h3>
            <div className="space-y-1.5">
              {top.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 font-bold w-5 text-center">#{i + 1}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.nombre}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-slate-500 text-xs">{p.unidades_vendidas} un.</span>
                    <span className="font-bold text-green-600">{fmt(p.monto_total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios cerrados */}
        {close.total_servicios_cerrados > 0 && (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg px-3 py-2">
              <Wrench className="h-4 w-4" />
              <span>{close.total_servicios_cerrados} servicios técnicos entregados durante este turno</span>
            </div>
          </div>
        )}

        {/* Notas */}
        {close.notas && (
          <div className="px-5 pb-5">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
              <p className="font-bold mb-0.5">Notas del operador:</p>
              <p>{close.notas}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 text-xs text-slate-400 text-right">
          Generado por: <strong>{close.nombre_empleado || 'Empleado'}</strong> · {fmtDate(close.fecha_generacion)} {fmtTime(close.fecha_generacion)}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function CierresPage() {
  const { preview, cierres, selected, loading, fetchPreview, fetchCierres, generateClose, openDetail, setSelected } = useFinance();

  const today = new Date().toISOString().split('T')[0];

  // Form state
  const [turno,       setTurno]      = useState('DIURNO');
  const [fechaCierre, setFechaCierre]= useState(today);
  const [notas,       setNotas]      = useState('');
  const [generating,  setGenerating] = useState(false);

  // Filter state
  const [filtFechaI, setFiltFechaI] = useState('');
  const [filtFechaF, setFiltFechaF] = useState('');
  const [filtTurno,  setFiltTurno]  = useState('');

  // Load preview when turno changes
  useEffect(() => { fetchPreview(turno); }, [turno, fetchPreview]);

  // Load cierres on mount
  useEffect(() => { fetchCierres(); }, [fetchCierres]);

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateClose({ fecha_cierre: fechaCierre, turno, notas });
    if (result.success) {
      setNotas('');
      fetchCierres({ fecha_inicio: filtFechaI || undefined, fecha_fin: filtFechaF || undefined, turno: filtTurno || undefined });
      fetchPreview(turno);
    }
    setGenerating(false);
  };

  const handleFilter = () => {
    fetchCierres({
      fecha_inicio: filtFechaI || undefined,
      fecha_fin:    filtFechaF || undefined,
      turno:        filtTurno  || undefined,
    });
  };

  const activeTurn = TURNS.find(t => t.value === turno);

  return (
    <main className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cierre de Caja</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Registra y consulta los cierres por turno.</p>
        </div>
        <button
          onClick={() => { fetchPreview(turno); fetchCierres(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {/* ── Turno selector ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TURNS.map(t => (
          <button
            key={t.value}
            onClick={() => setTurno(t.value)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              turno === t.value
                ? `border-current ${t.color} ${t.bg} shadow-md`
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300'
            }`}
          >
            <t.Icon className={`h-6 w-6 shrink-0 ${turno === t.value ? t.color : 'text-slate-400'}`} />
            <div>
              <p className={`font-bold text-sm ${turno === t.value ? t.color : 'text-slate-700 dark:text-slate-300'}`}>{t.label}</p>
              <p className="text-xs text-slate-400">{t.hours}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Live KPIs (preview) ─────────────────────────────────────────────── */}
      {preview && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">
            Vista previa — Turno {turno} · {preview.hora_inicio?.slice(11, 16)} – {preview.hora_fin?.slice(11, 16)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Recaudado"     value={fmt(preview.monto_cobrado)}     sub={`${preview.ventas_cobradas} ventas`}    Icon={DollarSign}   iconClass="text-green-600" />
            <KpiCard label="Pendiente"     value={fmt(preview.monto_pendiente)}   sub={`${preview.ventas_pendientes} ventas`}  Icon={AlertCircle}  iconClass="text-orange-500" />
            <KpiCard label="Efectivo"      value={fmt(preview.total_efectivo)}    Icon={Banknote}     iconClass="text-blue-600" />
            <KpiCard label="Transferencia" value={fmt(preview.total_transferencia)} Icon={CreditCard} iconClass="text-indigo-600" />
          </div>
        </div>
      )}

      {/* ── Generate close form ─────────────────────────────────────────────── */}
      <div className={`rounded-xl border-2 p-5 ${activeTurn?.bg} ${turno === 'DIURNO' ? 'border-amber-200 dark:border-amber-800' : turno === 'NOCTURNO' ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'}`}>
        <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <activeTurn.Icon className={`h-5 w-5 ${activeTurn.color}`} />
          Generar Cierre — Turno {turno}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fecha del Cierre</label>
            <input
              type="date"
              value={fechaCierre}
              max={today}
              onChange={e => setFechaCierre(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notas del Operador (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Sin novedades, entrega de turno a Juan..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || loading}
          className={`mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
            turno === 'DIURNO' ? 'bg-amber-500 hover:bg-amber-600' :
            turno === 'NOCTURNO' ? 'bg-indigo-600 hover:bg-indigo-700' :
            'bg-slate-700 hover:bg-slate-800'
          }`}
        >
          {generating ? <RotateCcw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {generating ? 'Generando...' : `Cerrar Turno ${turno}`}
        </button>
      </div>

      {/* ── History ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Historial de Cierres</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={filtFechaI} onChange={e => setFiltFechaI(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary" />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={filtFechaF} onChange={e => setFiltFechaF(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary" />
            <select value={filtTurno} onChange={e => setFiltTurno(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Todos los turnos</option>
              <option value="DIURNO">Diurno</option>
              <option value="NOCTURNO">Nocturno</option>
              <option value="COMPLETO">Completo</option>
            </select>
            <button onClick={handleFilter}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
              Filtrar
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 animate-pulse">Cargando cierres...</div>
          ) : cierres.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
              <FileText className="h-8 w-8 opacity-40" />
              <p className="text-sm">No hay cierres registrados aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    {['Fecha', 'Turno', 'Recaudado', 'Ganancia', 'Efectivo', 'Transf.', '# Ventas', 'Clientes', 'Generado por', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cierres.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{fmtDate(c.fecha_cierre)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${TURN_BADGE[c.turno] || TURN_BADGE.COMPLETO}`}>
                          {c.turno === 'DIURNO' ? <Sun className="h-3 w-3" /> : c.turno === 'NOCTURNO' ? <Moon className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
                          {c.turno}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600 whitespace-nowrap">{fmt(c.total_ventas)}</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold whitespace-nowrap">{fmt(c.total_ganancias)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmt(c.total_efectivo)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmt(c.total_transferencia)}</td>
                      <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{c.total_ventas_conteo}</td>
                      <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{c.total_clientes_atendidos}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{c.nombre_empleado || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(c.id)}
                          className="flex items-center gap-1 text-primary hover:underline text-xs font-semibold whitespace-nowrap"
                        >
                          Detalle <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ────────────────────────────────────────────────────── */}
      {selected && <CloseDetailModal close={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
