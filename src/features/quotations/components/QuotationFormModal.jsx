import React, { useState, useEffect } from 'react';
import axios from '../../../lib/axios';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  FileSpreadsheet, X, Search, Plus, Trash2, User,
  Calendar, DollarSign, Loader2, AlertCircle, CheckCircle2, Tag
} from 'lucide-react';

function formatCOP(val) {
  return `$${parseFloat(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

export default function QuotationFormModal({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Clients & Products Search State
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Quote Form State
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [expirationDays, setExpirationDays] = useState(15);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const res = await axios.get('clients', { params: { limit: 100 } });
      setClients(res.data.clientes || res.data || []);
    } catch (e) {
      console.error('Error fetching clients', e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('products', { params: { limit: 100 } });
      setProducts(res.data.productos || res.data || []);
    } catch (e) {
      console.error('Error fetching products', e);
    }
  };

  const handleAddProduct = (prod) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id_producto === prod.id);
      if (exists) {
        return prev.map((i) =>
          i.id_producto === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id_producto: prod.id,
          nombre_producto: prod.nombre,
          cantidad: 1,
          precio_unitario: parseFloat(prod.precio_venta_normal || 0)
        }
      ];
    });
    setProductSearch('');
  };

  const handleAddCustomItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id_producto: null,
        nombre_producto: 'Servicio / Producto Personalizado',
        cantidad: 1,
        precio_unitario: 0
      }
    ]);
  };

  const handleUpdateItem = (index, field, val) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, i) => sum + (parseFloat(i.precio_unitario) || 0) * (parseInt(i.cantidad) || 1),
    0
  );
  const total = Math.max(0, subtotal - (parseFloat(discount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: '⚠️ Selecciona al menos un producto', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + parseInt(expirationDays));

      const payload = {
        id_cliente: selectedClient ? selectedClient.id : null,
        fecha_vencimiento: expDate.toISOString().slice(0, 10),
        monto_descuento: parseFloat(discount) || 0,
        observaciones: notes,
        items: items.map((i) => ({
          id_producto: i.id_producto,
          nombre_producto: i.nombre_producto,
          cantidad: parseInt(i.cantidad) || 1,
          precio_unitario: parseFloat(i.precio_unitario) || 0
        }))
      };

      const res = await axios.post('quotations', payload);
      toast({ title: '✅ Cotización creada exitosamente', description: `N° ${res.data.numero_cotizacion}` });
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: '❌ Error al crear cotización',
        description: err.response?.data?.detail || 'Verifica los campos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredClients = clients.filter(
    (c) =>
      c.nombres?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.apellidos?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.documento_identidad?.includes(clientSearch)
  );

  const filteredProducts = products.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.codigo_referencia?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Nueva Cotización</h3>
              <p className="text-xs text-slate-500">Cotiza productos/servicios y genera una factura formal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Cliente & Validez */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Cliente
              </label>
              {selectedClient ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <div>
                    <p className="font-semibold text-sm">{selectedClient.nombres} {selectedClient.apellidos}</p>
                    <p className="text-xs text-slate-500">Doc: {selectedClient.documento_identidad || 'Sin Documento'}</p>
                  </div>
                  <Button size="xs" variant="ghost" type="button" onClick={() => setSelectedClient(null)}>Cambiar</Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Buscar cliente por nombre o cédula..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  {clientSearch && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {filteredClients.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400 text-center">No se encontraron clientes</p>
                      ) : (
                        filteredClients.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => { setSelectedClient(c); setClientSearch(''); }}
                            className="p-2.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                          >
                            <p className="font-bold text-slate-800 dark:text-white">{c.nombres} {c.apellidos}</p>
                            <p className="text-slate-400">{c.documento_identidad || 'Sin doc'}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Validez */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Vigencia de la Oferta
              </label>
              <select
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value={7}>Válida por 7 Días</option>
                <option value={15}>Válida por 15 Días (Recomendado)</option>
                <option value={30}>Válida por 30 Días</option>
                <option value={60}>Válida por 60 Días</option>
              </select>
            </div>
          </div>

          {/* 2. Buscador e Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Productos / Servicios a Cotizar
              </label>
              <Button size="xs" variant="outline" type="button" onClick={handleAddCustomItem} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Agregar Ítem Personalizado
              </Button>
            </div>

            {/* Buscador de productos */}
            <div className="relative">
              <Input
                placeholder="Buscar producto por nombre o código para añadir..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              {productSearch && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-xs text-slate-400 text-center">No hay productos coincidentes</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        className="p-2.5 text-xs hover:bg-primary/10 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{p.nombre}</p>
                          <p className="text-slate-400">Stock: {p.existencias} · Cód: {p.codigo_referencia || 'S/N'}</p>
                        </div>
                        <span className="font-black text-primary text-sm">{formatCOP(p.precio_venta_normal)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Tabla de ítems seleccionados */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3 text-left">Descripción del Producto / Servicio</th>
                    <th className="p-3 text-center w-24">Cant.</th>
                    <th className="p-3 text-right w-32">Precio Unit.</th>
                    <th className="p-3 text-right w-32">Subtotal</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No has añadido productos a la cotización todavía. Usa el buscador superior.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const subt = (parseFloat(item.precio_unitario) || 0) * (parseInt(item.cantidad) || 1);
                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          <td className="p-2">
                            <Input
                              value={item.nombre_producto}
                              onChange={(e) => handleUpdateItem(idx, 'nombre_producto', e.target.value)}
                              className="h-8 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.cantidad}
                              onChange={(e) => handleUpdateItem(idx, 'cantidad', e.target.value)}
                              className="h-8 text-xs text-center font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min={0}
                              value={item.precio_unitario}
                              onChange={(e) => handleUpdateItem(idx, 'precio_unitario', e.target.value)}
                              className="h-8 text-xs text-right font-bold"
                            />
                          </td>
                          <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                            {formatCOP(subt)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Totales & Descuento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Observaciones / Condiciones Especiales
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Los precios incluyen IVA. Garantía de 1 año. Forma de pago: 50% anticipo."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-500">Subtotal:</span>
                <span className="font-bold">{formatCOP(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-500">Descuento Global ($):</span>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="h-7 w-28 text-right font-bold text-xs"
                />
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="font-black text-slate-900 dark:text-white">TOTAL COTIZADO:</span>
                <span className="font-black text-primary text-base">{formatCOP(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-primary text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Guardar y Generar Cotización
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
