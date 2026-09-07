import React, { useEffect, useState, useCallback } from 'react';
import { quotationsService } from '../services/quotations.service';
import QuotationFormModal from '../components/QuotationFormModal';
import QuotationDetailModal from '../components/QuotationDetailModal';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  FileSpreadsheet, Plus, Search, RefreshCw, Eye, Download,
  ShoppingBag, Trash2, Calendar, Filter, CheckCircle2, Clock,
  FileText, TrendingUp, AlertCircle
} from 'lucide-react';

function formatCOP(val) {
  return `$${parseFloat(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('es-CO', { dateStyle: 'medium' });
}

const STATUS_CONFIG = {
  BORRADOR:   { label: 'Borrador',  color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  ENVIADA:    { label: 'Enviada',   color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  APROBADA:   { label: 'Aprobada',  color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  RECHAZADA:  { label: 'Rechazada', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  CONVERTIDA: { label: 'Convertida a Venta', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
};

export default function QuotationsPage() {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuotId, setSelectedQuotId] = useState(null);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quotationsService.getAll({
        search: search || undefined,
        estado: statusFilter || undefined,
        limit: 100
      });
      setQuotations(data.cotizaciones || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      toast({ title: '❌ Error al cargar cotizaciones', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleDelete = async (id, num) => {
    if (!confirm(`¿Eliminar la cotización ${num}?`)) return;
    try {
      await quotationsService.delete(id);
      toast({ title: '🗑️ Cotización eliminada' });
      fetchQuotations();
    } catch (err) {
      toast({ title: '❌ Error al eliminar', variant: 'destructive' });
    }
  };

  const handleConvertToSale = async (id, num) => {
    if (!confirm(`¿Convertir la Cotización ${num} en una Venta Real en el POS?`)) return;
    try {
      const res = await quotationsService.convertToSale(id);
      toast({ title: '🎉 Convertida exitosamente', description: res.message });
      fetchQuotations();
    } catch (err) {
      toast({
        title: '❌ Error al convertir',
        description: err.response?.data?.detail || 'Verifica el stock disponible',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadPdf = async (id, num) => {
    try {
      toast({ title: '📄 Generando PDF...', description: 'La descarga comenzará en breve.' });
      await quotationsService.downloadPdf(id, `cotizacion_${num}.pdf`);
    } catch (err) {
      toast({ title: '❌ Error al descargar PDF', variant: 'destructive' });
    }
  };

  // Calculate Metrics
  const totalMonto = quotations.reduce((acc, q) => acc + parseFloat(q.monto_total || 0), 0);
  const totalConvertidas = quotations.filter((q) => q.estado === 'CONVERTIDA').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="h-7 w-7 text-primary" /> Módulo de Cotizaciones
          </h1>
          <p className="text-sm text-slate-500">Cotiza productos, descarga facturas PDF de propuestas y conviértelas a venta en 1-clic.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 font-bold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Nueva Cotización
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Cotizaciones</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Valor Total Cotizado</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCOP(totalMonto)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Convertidas a Venta</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalConvertidas}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Buscar por código COT-0001, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-10 rounded-xl"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Status Filter & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 font-semibold focus:outline-none"
          >
            <option value="">Todos los Estados</option>
            <option value="BORRADOR">Borradores</option>
            <option value="ENVIADA">Enviadas</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="RECHAZADA">Rechazadas</option>
            <option value="CONVERTIDA">Convertidas a Venta</option>
          </select>

          <Button variant="outline" onClick={fetchQuotations} className="h-10 px-3 rounded-xl">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quotations Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4 text-left">N° Cotización</th>
                <th className="p-4 text-left">Cliente</th>
                <th className="p-4 text-left">Vendedor</th>
                <th className="p-4 text-center">Fecha Emisión</th>
                <th className="p-4 text-center">Vigencia</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Monto Total</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Cargando cotizaciones...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No se encontraron cotizaciones registradas.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => {
                  const st = STATUS_CONFIG[q.estado] || STATUS_CONFIG.ENVIADA;
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="p-4 font-black text-primary text-sm">
                        {q.numero_cotizacion}
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {q.nombre_cliente || 'Cliente Mostrador'}
                        {q.telefono_cliente && <span className="block text-[10px] text-slate-400">Tel: {q.telefono_cliente}</span>}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {q.nombre_empleado || 'Vendedor'}
                      </td>
                      <td className="p-4 text-center text-slate-500 font-medium">
                        {formatDate(q.fecha_cotizacion)}
                      </td>
                      <td className="p-4 text-center text-amber-600 dark:text-amber-400 font-semibold">
                        {formatDate(q.fecha_vencimiento)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white text-sm">
                        {formatCOP(q.monto_total)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Detalle */}
                          <button
                            title="Ver Detalle"
                            onClick={() => setSelectedQuotId(q.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* PDF */}
                          <button
                            title="Descargar PDF Cotización"
                            onClick={() => handleDownloadPdf(q.id, q.numero_cotizacion)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>

                          {/* Convertir a Venta */}
                          {q.estado !== 'CONVERTIDA' && (
                            <button
                              title="Convertir a Venta Directa en POS"
                              onClick={() => handleConvertToSale(q.id, q.numero_cotizacion)}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-950 transition-colors"
                            >
                              <ShoppingBag className="h-4 w-4" />
                            </button>
                          )}

                          {/* Eliminar */}
                          <button
                            title="Eliminar Cotización"
                            onClick={() => handleDelete(q.id, q.numero_cotizacion)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <QuotationFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchQuotations}
      />

      {selectedQuotId && (
        <QuotationDetailModal
          quotationId={selectedQuotId}
          onClose={() => setSelectedQuotId(null)}
          onSuccess={fetchQuotations}
        />
      )}

    </div>
  );
}
