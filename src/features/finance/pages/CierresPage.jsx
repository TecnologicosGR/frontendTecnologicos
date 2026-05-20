import { useState, useEffect, useCallback } from 'react';
import { useFinance } from '../hooks/useFinance';
import {
  DollarSign, RotateCcw, ChevronRight, X,
  Banknote, CreditCard, Package, FileText, CalendarDays,
  Printer, Coins, CheckCircle2, ShieldAlert, AlertCircle, Wrench
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n || 0));

const fmtDate = (d) => {
  if (!d) return '—';
  const dateObj = new Date(d);
  // Add timezone offset to prevent shifting
  const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (d) => {
  if (!d) return '—';
  // Parse iso format or general timestamp
  try {
    return new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '—';
  }
};

const DENOMINATIONS = [
  { value: 100000, label: '$100.000', type: 'billete' },
  { value: 50000, label: '$50.000', type: 'billete' },
  { value: 20000, label: '$20.000', type: 'billete' },
  { value: 10000, label: '$10.000', type: 'billete' },
  { value: 5000, label: '$5.000', type: 'billete' },
  { value: 2000, label: '$2.000', type: 'billete' },
  { value: 1000, label: '$1.000', type: 'billete' },
  { value: 500, label: '$500', type: 'moneda' },
  { value: 200, label: '$200', type: 'moneda' },
  { value: 100, label: '$100', type: 'moneda' },
  { value: 50, label: '$50', type: 'moneda' },
];

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, Icon, iconClass }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
      <div className={`p-2.5 rounded-lg ${iconClass} bg-current/10 shrink-0`}>
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Close Detail Modal ────────────────────────────────────────────────────────
function CloseDetailModal({ close, onClose, onPrint }) {
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
              {fmtDate(close.fecha_cierre)} · <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`}>Día Completo</span>
              &nbsp;· {fmtTime(close.hora_inicio)} – {fmtTime(close.hora_fin)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(close)}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              <Printer className="h-4 w-4" /> Imprimir Ticket
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l: 'Recaudado (Ventas + Srvs)', v: fmt(close.total_ventas), cls: 'text-green-600' },
            { l: 'Ganancia Bruta', v: fmt(close.total_ganancias), cls: 'text-emerald-600' },
            { l: 'Pendiente', v: fmt(close.total_ventas_pendientes), cls: 'text-orange-500' },
            { l: '# Ventas', v: close.total_ventas_conteo, cls: 'text-blue-600' },
            { l: 'Efectivo', v: fmt(close.total_efectivo), cls: 'text-slate-700 dark:text-slate-200' },
            { l: 'Transferencia', v: fmt(close.total_transferencia), cls: 'text-slate-700 dark:text-slate-200' },
            { l: 'Otros', v: fmt(close.total_otros), cls: 'text-slate-700 dark:text-slate-200' },
            { l: 'Clientes', v: close.total_clientes_atendidos, cls: 'text-purple-600' },
          ].map(({ l, v, cls }) => (
            <div key={l} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800/50">
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
                <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm border border-slate-100 dark:border-slate-800/50">
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
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg px-3 py-2 border border-indigo-100 dark:border-indigo-900/30">
              <Wrench className="h-4 w-4 shrink-0" />
              <span>{close.total_servicios_cerrados} servicios cobrados y entregados</span>
            </div>
            {close.ingreso_servicios > 0 && (
              <div className="flex items-center justify-between text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2 font-bold border border-emerald-100 dark:border-emerald-900/30">
                <span>Ingreso por Servicios</span>
                <span>{fmt(close.ingreso_servicios)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notas */}
        {close.notas && (
          <div className="px-5 pb-5">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
              <p className="font-bold mb-0.5">Notas del operador:</p>
              <p className="whitespace-pre-line">{close.notas}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 text-xs text-slate-400 text-right border-t border-slate-100 dark:border-slate-800 pt-3">
          Generado por: <strong>{close.nombre_empleado || 'Administrador / Empleado'}</strong> · {fmtDate(close.fecha_generacion)} {fmtTime(close.fecha_generacion)}
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
  const [fechaCierre, setFechaCierre] = useState(today);
  const [notas, setNotas] = useState('');
  const [generating, setGenerating] = useState(false);

  // Filter state
  const [filtFechaI, setFiltFechaI] = useState('');
  const [filtFechaF, setFiltFechaF] = useState('');

  // Cash count (Arqueo) state
  const [arqueo, setArqueo] = useState({
    100000: '', 50000: '', 20000: '', 10000: '', 5000: '', 2000: '', 1000: '',
    500: '', 200: '', 100: '', 50: ''
  });
  const [transferenciasReportadas, setTransferenciasReportadas] = useState('');
  const [otrosReportados, setOtrosReportados] = useState('');

  // Print state
  const [printData, setPrintData] = useState(null);

  // Load preview whenever selected date changes
  useEffect(() => {
    fetchPreview(fechaCierre, "COMPLETO");
  }, [fechaCierre, fetchPreview]);

  // Load cierres on mount
  useEffect(() => {
    fetchCierres();
  }, [fetchCierres]);

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateClose({ fecha_cierre: fechaCierre, turno: "COMPLETO", notas });
    if (result.success) {
      setNotas('');
      fetchCierres({ fecha_inicio: filtFechaI || undefined, fecha_fin: filtFechaF || undefined });
      fetchPreview(fechaCierre, "COMPLETO");
      // Open detail modal of the newly created closure
      if (result.data && result.data.id) {
        openDetail(result.data.id);
      }
    }
    setGenerating(false);
  };

  const handleFilter = () => {
    fetchCierres({
      fecha_inicio: filtFechaI || undefined,
      fecha_fin:    filtFechaF || undefined,
    });
  };

  const handlePrint = (close) => {
    setPrintData(close);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Arqueo Math
  const physicalCash = Object.entries(arqueo).reduce(
    (acc, [val, qty]) => acc + (Number(val) * Number(qty || 0)),
    0
  );
  const expectedCash = preview ? Number(preview.total_efectivo || 0) : 0;
  const expectedTransfers = preview ? Number(preview.total_transferencia || 0) : 0;
  const expectedOtros = preview ? Number(preview.total_otros || 0) : 0;

  const reportedTransfers = Number(transferenciasReportadas || 0);
  const reportedOtros = Number(otrosReportados || 0);

  const diffCash = physicalCash - expectedCash;
  const diffTransfers = reportedTransfers - expectedTransfers;
  const diffOtros = reportedOtros - expectedOtros;

  const totalExpected = expectedCash + expectedTransfers + expectedOtros;
  const totalReported = physicalCash + reportedTransfers + reportedOtros;
  const totalDiscrepancy = totalReported - totalExpected;

  const handleCopyArqueoToNotes = () => {
    const detailString = Object.entries(arqueo)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([val, qty]) => ` · $${Number(val).toLocaleString('es-CO')} x ${qty}`)
      .join('\n');

    const totalText = `[Conciliación de Cierre]
------------------------------------
EFECTIVO:
  Esperado: ${fmt(expectedCash)}
  Físico: ${fmt(physicalCash)}
  Diferencia: ${fmt(diffCash)} (${diffCash === 0 ? 'Cuadrado' : diffCash > 0 ? 'Sobrante' : 'Faltante'})
  Desglose Billetes/Monedas:
${detailString || '  (No se ingresó efectivo físico)'}

TRANSFERENCIAS:
  Esperado: ${fmt(expectedTransfers)}
  Reportado: ${fmt(reportedTransfers)}
  Diferencia: ${fmt(diffTransfers)} (${diffTransfers === 0 ? 'Cuadrado' : diffTransfers > 0 ? 'Sobrante' : 'Faltante'})

OTROS PAGOS:
  Esperado: ${fmt(expectedOtros)}
  Reportado: ${fmt(reportedOtros)}
  Diferencia: ${fmt(diffOtros)} (${diffOtros === 0 ? 'Cuadrado' : diffOtros > 0 ? 'Sobrante' : 'Faltante'})

------------------------------------
BALANCE GENERAL:
  Total Esperado: ${fmt(totalExpected)}
  Total Reportado: ${fmt(totalReported)}
  Descuadre General: ${fmt(totalDiscrepancy)} (${totalDiscrepancy === 0 ? 'Cuadrado' : totalDiscrepancy > 0 ? 'Sobrante' : 'Faltante'})`;
    
    setNotas(prev => prev ? `${prev}\n\n${totalText}` : totalText);
  };

  const handleClearArqueo = () => {
    setArqueo({
      100000: '', 50000: '', 20000: '', 10000: '', 5000: '', 2000: '', 1000: '',
      500: '', 200: '', 100: '', 50: ''
    });
    setTransferenciasReportadas('');
    setOtrosReportados('');
  };

  return (
    <>
      {/* ── Main View (Hidden when printing) ────────────────────────────────── */}
      <main className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 print:hidden">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cierre de Caja</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Registra, concilia y visualiza el historial de los cierres diarios.</p>
          </div>
          <button
            onClick={() => { fetchPreview(fechaCierre, "COMPLETO"); fetchCierres(); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shadow-sm bg-white dark:bg-slate-900"
          >
            <RotateCcw className="h-4 w-4" /> Sincronizar Datos
          </button>
        </div>

        {/* ── Live KPIs & Details (Preview of Selected Date) ───────────────────── */}
        {preview && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Ventas del día: {fmtDate(fechaCierre)}
              </h2>
              <span className="text-xs text-slate-400">
                Límites: {preview.hora_inicio ? fmtTime(preview.hora_inicio) : '08:00'} – {preview.hora_fin ? fmtTime(preview.hora_fin) : '19:00'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <KpiCard label="Recaudado (Ventas + Srvs)" value={fmt(preview.monto_cobrado)} sub={`${preview.ventas_cobradas} ventas registradas`} Icon={DollarSign} iconClass="text-green-600" />
              <KpiCard label="Servicios Entregados" value={fmt(preview.ingresos_servicios)} sub="Ingresos por mano de obra/repuestos" Icon={Wrench} iconClass="text-indigo-600" />
              <KpiCard label="Efectivo en Caja (Calculado)" value={fmt(preview.total_efectivo)} Icon={Banknote} iconClass="text-emerald-600" />
              <KpiCard label="Transferencias" value={fmt(preview.total_transferencia)} Icon={CreditCard} iconClass="text-blue-600" />
              <KpiCard label="Ventas Pendientes (Por Cobrar)" value={fmt(preview.monto_pendiente)} sub={`${preview.ventas_pendientes} tickets abiertos`} Icon={AlertCircle} iconClass="text-orange-500" />
            </div>
          </div>
        )}

        {/* ── Closing Action and Reconciliation Tools ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Close Form and Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              
              {/* Header inside form */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <CalendarDays className="h-5 w-5 text-slate-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Generar Cierre</h3>
              </div>

              {/* Status Alert Banner */}
              {preview && (
                preview.cierre_existente ? (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold">Cierre ya generado previamente</p>
                      <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                        Este día fue cerrado por <strong>{preview.cierre_existente.nombre_empleado}</strong> el {fmtDate(preview.cierre_existente.fecha_generacion)} ({fmtTime(preview.cierre_existente.fecha_generacion)}). Si vuelves a generarlo, se sobrescribirá con los cálculos actuales de ventas y servicios.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl text-green-800 dark:text-green-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold">Caja abierta</p>
                      <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                        Aún no se ha consolidado el cierre definitivo para esta fecha. Puedes revisar los montos y presionar "Cerrar Caja Diaria" para guardar el balance.
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fecha a Cerrar</label>
                  <input
                    type="date"
                    value={fechaCierre}
                    max={today}
                    onChange={e => setFechaCierre(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notas del Operador (Opcional)</label>
                  <textarea
                    placeholder="Ej: Efectivo cuadrado, observaciones del turno o discrepancias..."
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={generating || loading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                    preview?.cierre_existente 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
                  }`}
                >
                  {generating ? <RotateCcw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  {generating ? 'Cerrando...' : preview?.cierre_existente ? 'Recalcular y Cerrar Caja' : 'Cerrar Caja Diaria'}
                </button>

                {preview?.cierre_existente && (
                  <button
                    onClick={() => openDetail(preview.cierre_existente.id)}
                    className="flex items-center gap-1 text-primary hover:underline text-xs font-bold"
                  >
                    Ver Cierre Existente <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Top Products inside the Preview */}
            {preview && preview.top_productos?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> Productos Vendidos Hoy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {preview.top_productos.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-lg text-sm">
                      <span className="font-semibold text-slate-500 w-5">#{idx + 1}</span>
                      <span className="truncate flex-1 text-slate-800 dark:text-slate-200 mr-2">{p.nombre}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-bold shrink-0">{p.unidades} un.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Cash & Bank Reconciliation Tool */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-slate-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Arqueo y Conciliación</h3>
              </div>
              <button
                onClick={handleClearArqueo}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
              >
                Limpiar todo
              </button>
            </div>

            {/* Section 1: Physical Cash breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">1. Efectivo Físico (Billetes/Monedas)</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 max-h-[220px] overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800 p-2 rounded-lg bg-slate-50/30">
                {DENOMINATIONS.map(({ value, label }) => (
                  <div key={value} className="flex items-center justify-between gap-1 py-0.5 px-1.5 rounded bg-white dark:bg-slate-950/20 text-[11px] border border-slate-50 dark:border-slate-800/30">
                    <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={arqueo[value]}
                      onChange={e => {
                        const val = e.target.value;
                        setArqueo(prev => ({ ...prev, [value]: val === '' ? '' : Math.max(0, parseInt(val) || 0) }));
                      }}
                      className="w-12 px-1 py-0.5 text-right font-bold border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Banks & Transfers */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">2. Bancos y Otros Pagos</h4>
              <div className="space-y-2">
                <div>
                  <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Transferencias Reportadas:</span>
                    <span className="text-[10px] text-blue-500">Sistema: {fmt(expectedTransfers)}</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Total en Nequi, Bancolombia, etc."
                    value={transferenciasReportadas}
                    onChange={e => setTransferenciasReportadas(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Otros Pagos Reportados:</span>
                    <span className="text-[10px] text-purple-500">Sistema: {fmt(expectedOtros)}</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Otros medios (Datáfono, etc.)"
                    value={otrosReportados}
                    onChange={e => setOtrosReportados(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Detailed Reconciliation Grid */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3 text-xs">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">3. Conciliación de Cuentas</h4>
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl">
                {/* Cash row */}
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                  <span className="font-semibold text-slate-500">Efectivo:</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">Físico: {fmt(physicalCash)}</p>
                    <p className={`text-[10px] ${diffCash === 0 ? 'text-green-600' : diffCash > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      Dif: {diffCash > 0 ? '+' : ''}{fmt(diffCash)}
                    </p>
                  </div>
                </div>
                {/* Transfer row */}
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                  <span className="font-semibold text-slate-500">Transf:</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">Rep: {fmt(reportedTransfers)}</p>
                    <p className={`text-[10px] ${diffTransfers === 0 ? 'text-green-600' : diffTransfers > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      Dif: {diffTransfers > 0 ? '+' : ''}{fmt(diffTransfers)}
                    </p>
                  </div>
                </div>
                {/* Other payment row */}
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                  <span className="font-semibold text-slate-500">Otros:</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">Rep: {fmt(reportedOtros)}</p>
                    <p className={`text-[10px] ${diffOtros === 0 ? 'text-green-600' : diffOtros > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      Dif: {diffOtros > 0 ? '+' : ''}{fmt(diffOtros)}
                    </p>
                  </div>
                </div>
                {/* Total row */}
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">TOTAL:</span>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-950 dark:text-white">Rep: {fmt(totalReported)}</p>
                    <p className={`text-[10px] font-extrabold ${totalDiscrepancy === 0 ? 'text-green-600' : totalDiscrepancy > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      Dif: {totalDiscrepancy > 0 ? '+' : ''}{fmt(totalDiscrepancy)}
                    </p>
                  </div>
                </div>
              </div>

              {/* General Balance Status Card */}
              <div className={`p-2.5 rounded-lg flex items-center justify-between font-bold ${
                totalDiscrepancy === 0 
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30'
              }`}>
                <span>Estado General:</span>
                <span>{totalDiscrepancy === 0 ? 'Caja Cuadrada ✅' : totalDiscrepancy > 0 ? 'Sobrante ⚠️' : 'Descuadre ❌'}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyArqueoToNotes}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Copiar Conciliación a Notas
              </button>
            </div>
          </div>
        </div>

        {/* ── Closures History Table ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Historial de Cierres</h2>
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="date" 
                value={filtFechaI} 
                onChange={e => setFiltFechaI(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary" 
              />
              <span className="text-slate-400 text-xs">→</span>
              <input 
                type="date" 
                value={filtFechaF} 
                onChange={e => setFiltFechaF(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary" 
              />
              <button 
                onClick={handleFilter}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold shadow-sm transition-opacity"
              >
                Filtrar
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-44 text-slate-400 animate-pulse">Cargando cierres...</div>
            ) : cierres.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-44 gap-2 text-slate-400">
                <FileText className="h-8 w-8 opacity-30" />
                <p className="text-sm font-semibold">No se encontraron cierres históricos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      {['Fecha Cierre', 'Recaudado (Total)', 'Ganancia Bruta', 'Efectivo', 'Transferencia', 'Otros', '# Ventas', '# Srvs.', 'Cerrado Por', ''].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {cierres.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{fmtDate(c.fecha_cierre)}</td>
                        <td className="px-4 py-3.5 font-black text-green-600 whitespace-nowrap">{fmt(c.total_ventas)}</td>
                        <td className="px-4 py-3.5 text-emerald-600 font-semibold whitespace-nowrap">{fmt(c.total_ganancias)}</td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{fmt(c.total_efectivo)}</td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{fmt(c.total_transferencia)}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmt(c.total_otros)}</td>
                        <td className="px-4 py-3.5 text-center text-slate-800 dark:text-slate-200 font-bold">{c.total_ventas_conteo}</td>
                        <td className="px-4 py-3.5 text-center text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/10">{c.total_servicios_cerrados}</td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">{c.nombre_empleado || 'Administrador'}</td>
                        <td className="px-4 py-3.5 text-right pr-4">
                          <button
                            onClick={() => openDetail(c.id)}
                            className="flex items-center gap-1 text-primary hover:underline text-xs font-black whitespace-nowrap"
                          >
                            Ver Detalle <ChevronRight className="h-3.5 w-3.5" />
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
        {selected && (
          <CloseDetailModal 
            close={selected} 
            onClose={() => setSelected(null)} 
            onPrint={handlePrint}
          />
        )}
      </main>

      {/* ── Ticket Printer View (Visible only when printing) ─────────────────── */}
      {printData && (
        <div className="hidden print:block font-mono text-[10px] p-2 max-w-[80mm] mx-auto text-black bg-white leading-normal">
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <h2 className="font-bold text-sm">TECNO-LOGICOS GR</h2>
            <p className="text-[9px]">NIT: 1065638970-6 | Tel: 300 343 6635</p>
            <p className="text-[9px]">Calle 18 #12-05 Gaitan, Valledupar</p>
            <div className="my-1 border-t border-dashed border-black" />
            <h3 className="font-bold text-xs">CIERRE DE CAJA DIARIO</h3>
            <p className="font-bold">ID Registro: #{printData.id}</p>
          </div>

          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between">
              <span>Fecha del Cierre:</span>
              <span className="font-bold">{fmtDate(printData.fecha_cierre)}</span>
            </div>
            <div className="flex justify-between">
              <span>Hora Apertura/Cierre:</span>
              <span>{fmtTime(printData.hora_inicio)} - {fmtTime(printData.hora_fin)}</span>
            </div>
            <div className="flex justify-between">
              <span>Operador Responsable:</span>
              <span className="font-bold truncate max-w-[120px]">{printData.nombre_empleado || 'Administrador'}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha Emisión:</span>
              <span>{fmtDate(printData.fecha_generacion)} {fmtTime(printData.fecha_generacion)}</span>
            </div>
          </div>

          <div className="my-2 border-t border-dashed border-black" />

          <div className="space-y-1.5 text-[9px]">
            <div className="flex justify-between font-bold text-xs">
              <span>TOTAL RECAUDADO:</span>
              <span>{fmt(printData.total_ventas)}</span>
            </div>
            <div className="flex justify-between text-[8px] pl-2">
              <span>· Ventas:</span>
              <span>{fmt(Number(printData.total_ventas) - Number(printData.ingreso_servicios || 0))}</span>
            </div>
            <div className="flex justify-between text-[8px] pl-2">
              <span>· Servicios Técnicos:</span>
              <span>{fmt(printData.ingreso_servicios || 0)}</span>
            </div>
            
            <div className="flex justify-between font-bold">
              <span>UTILIDAD BRUTA (Ventas):</span>
              <span>{fmt(printData.total_ganancias)}</span>
            </div>

            <div className="my-1 border-t border-dashed border-black" />

            <div className="flex justify-between">
              <span>Recaudado en Efectivo:</span>
              <span className="font-bold">{fmt(printData.total_efectivo)}</span>
            </div>
            <div className="flex justify-between">
              <span>Recaudado Transferencia:</span>
              <span className="font-bold">{fmt(printData.total_transferencia)}</span>
            </div>
            {Number(printData.total_otros) > 0 && (
              <div className="flex justify-between">
                <span>Otros Métodos Pago:</span>
                <span>{fmt(printData.total_otros)}</span>
              </div>
            )}
          </div>

          <div className="my-2 border-t border-dashed border-black" />

          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between">
              <span>Cantidad de Ventas:</span>
              <span className="font-bold">{printData.total_ventas_conteo}</span>
            </div>
            <div className="flex justify-between">
              <span>Servicios Completados:</span>
              <span className="font-bold">{printData.total_servicios_cerrados}</span>
            </div>
            <div className="flex justify-between">
              <span>Clientes Atendidos:</span>
              <span className="font-bold">{printData.total_clientes_atendidos}</span>
            </div>
            {Number(printData.total_ventas_pendientes) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Ventas por Cobrar (Pendientes):</span>
                <span>{fmt(printData.total_ventas_pendientes)}</span>
              </div>
            )}
          </div>

          {printData.top_productos?.length > 0 && (
            <>
              <div className="my-2 border-t border-dashed border-black" />
              <div className="text-[9px]">
                <p className="font-bold text-center mb-1">PRODUCTOS VENDIDOS</p>
                {printData.top_productos.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-[8px] py-0.5">
                    <span className="truncate max-w-[130px]">{p.nombre}</span>
                    <span>{p.unidades_vendidas} ud. - {fmt(p.monto_total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {printData.notas && (
            <>
              <div className="my-2 border-t border-dashed border-black" />
              <div className="text-[8px]">
                <p className="font-bold">OBSERVACIONES:</p>
                <p className="italic whitespace-pre-line border border-black p-1">{printData.notas}</p>
              </div>
            </>
          )}

          <div className="my-3 border-t border-dashed border-black" />

          <div className="text-center text-[8px] space-y-1 mt-4">
            <p className="font-bold">____________________________________</p>
            <p>FIRMA DEL RESPONSABLE</p>
            <p className="mt-4">Software de Gestión Tecno-Lógicos GR</p>
          </div>
        </div>
      )}
    </>
  );
}
