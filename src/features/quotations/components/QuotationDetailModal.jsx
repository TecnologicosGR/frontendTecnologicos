import React, { useState, useEffect } from 'react';
import { quotationsService } from '../services/quotations.service';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  FileSpreadsheet, X, Download, ShoppingBag, Loader2,
  Calendar, User, CheckCircle2, AlertCircle, RefreshCw, FileText
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
  CONVERTIDA: { label: 'Convertida en Venta', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
};

export default function QuotationDetailModal({ quotationId, onClose, onSuccess }) {
  const { toast } = useToast();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (quotationId) {
      fetchDetail();
    }
  }, [quotationId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await quotationsService.getById(quotationId);
      setQuotation(data);
    } catch (err) {
      toast({ title: '❌ Error al cargar cotización', variant: 'destructive' });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await quotationsService.updateStatus(quotationId, newStatus);
      toast({ title: `✅ Estado actualizado a ${newStatus}` });
      fetchDetail();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({ title: '❌ Error actualizando estado', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConvertToSale = async () => {
    if (!confirm(`¿Convertir la Cotización ${quotation.numero_cotizacion} en una venta real? Se descontará el inventario del sistema.`)) return;
    
    setConverting(true);
    try {
      const res = await quotationsService.convertToSale(quotationId);
      toast({ title: '🎉 Venta registrada exitosamente', description: res.message });
      fetchDetail();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: '❌ Error al convertir en venta',
        description: err.response?.data?.detail || 'Verifica el stock de los productos',
        variant: 'destructive'
      });
    } finally {
      setConverting(false);
    }
  };

  if (!quotationId) return null;

  const st = quotation ? (STATUS_CONFIG[quotation.estado] || STATUS_CONFIG.ENVIADA) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg">Cotización #{quotation?.numero_cotizacion}</h3>
                {st && <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span>}
              </div>
              <p className="text-xs text-slate-500">Fecha: {formatDate(quotation?.fecha_cotizacion)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 flex items-center justify-center text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !quotation ? null : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold block">Cliente</span>
                <span className="font-bold text-sm text-slate-800 dark:text-white">{quotation.nombre_cliente || 'Cliente Mostrador'}</span>
                {quotation.telefono_cliente && <span className="block text-slate-400">Tel: {quotation.telefono_cliente}</span>}
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Atendido por</span>
                <span className="font-bold text-sm text-slate-800 dark:text-white">{quotation.nombre_empleado || 'Vendedor'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Válida Hasta</span>
                <span className="font-bold text-sm text-amber-600 dark:text-amber-400">{formatDate(quotation.fecha_vencimiento)}</span>
              </div>
            </div>

            {/* Products Table */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Productos Cotizados</h4>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3 text-left">Producto / Descripción</th>
                      <th className="p-3 text-center">Cant</th>
                      <th className="p-3 text-right">Precio Unit.</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(quotation.items || []).map((item, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium">{item.nombre_producto}</td>
                        <td className="p-3 text-center font-bold">{item.cantidad}</td>
                        <td className="p-3 text-right">{formatCOP(item.precio_unitario)}</td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCOP(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-200">
                    <tr>
                      <td colSpan={3} className="p-3 text-right">Subtotal:</td>
                      <td className="p-3 text-right">{formatCOP(quotation.monto_subtotal)}</td>
                    </tr>
                    {quotation.monto_descuento > 0 && (
                      <tr>
                        <td colSpan={3} className="p-2 text-right text-red-500">Descuento:</td>
                        <td className="p-2 text-right text-red-500">- {formatCOP(quotation.monto_descuento)}</td>
                      </tr>
                    )}
                    <tr className="text-sm">
                      <td colSpan={3} className="p-3 text-right font-black">TOTAL COTIZADO:</td>
                      <td className="p-3 text-right font-black text-primary">{formatCOP(quotation.monto_total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {quotation.observaciones && (
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-500 block mb-1">Observaciones / Condiciones:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">"{quotation.observaciones}"</p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              
              {/* Status Changer */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Cambiar Estado:</span>
                <select
                  disabled={updatingStatus || quotation.estado === 'CONVERTIDA'}
                  value={quotation.estado}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="h-8 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 font-semibold"
                >
                  <option value="BORRADOR">Borrador</option>
                  <option value="ENVIADA">Enviada</option>
                  <option value="APROBADA">Aprobada</option>
                  <option value="RECHAZADA">Rechazada</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={async () => {
                    try {
                      await quotationsService.downloadPdf(quotation.id, `cotizacion_${quotation.numero_cotizacion}.pdf`);
                    } catch (e) {
                      toast({ title: '❌ Error al descargar PDF', variant: 'destructive' });
                    }
                  }}
                >
                  <Download className="h-3.5 w-3.5" /> Descargar PDF Cotización
                </Button>

                {quotation.estado !== 'CONVERTIDA' && (
                  <Button
                    size="sm"
                    onClick={handleConvertToSale}
                    disabled={converting}
                    className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {converting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                    Convertir a Venta Directa
                  </Button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
