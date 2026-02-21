import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productsService } from '../../products/services/products.service';
import { salesService } from '../services/sales.service';
import { companyService } from '../../company/services/company.service';
import { useSales } from '../hooks/useSales';
import { useToast } from '../../../components/ui/toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle,
  Loader2, Receipt, User, UserPlus, CreditCard, Banknote, X,
  Phone, Mail, MapPin, Store, Truck, PackageCheck
} from 'lucide-react';

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Otro'];

const ENTREGA_OPTIONS = [
  { key: 'en_punto',         label: 'En punto',    desc: 'El cliente paga y lleva',          Icon: Store },
  { key: 'domicilio',        label: 'Domicilio',   desc: 'Llevamos al cliente',              Icon: Truck },
  { key: 'recoger_en_punto', label: 'A recoger',   desc: 'Queda aquí, cliente pasa después', Icon: PackageCheck },
];

function formatCurrency(val) {
  return `$${parseFloat(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

// ── Quick-Create Client Form ──────────────────────────────────────────────────
function QuickClientForm({ documento, onCreated, onCancel }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    documento_identidad: documento || '',
    nombres: '', apellidos: '', telefono: '', email: '', direccion: ''
  });
  const handle = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombres || !form.apellidos) {
      toast({ title: '⚠️ Nombres y apellidos son obligatorios', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      const client = await salesService.quickCreateClient({
        documento_identidad: form.documento_identidad || null,
        nombres: form.nombres, apellidos: form.apellidos,
        telefono: form.telefono || null, email: form.email || null, direccion: form.direccion || null,
      });
      toast({ title: `✅ Cliente "${client.nombres} ${client.apellidos}" creado` });
      onCreated(client);
    } catch (err) {
      toast({ title: '❌ Error', description: err.detail || 'No se pudo crear el cliente', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-primary/30 bg-primary/5 rounded-xl p-4 space-y-3 mt-3">
      <p className="text-sm font-semibold text-primary flex items-center gap-1.5"><UserPlus className="h-4 w-4" />Nuevo cliente de mostrador</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1"><label className="text-xs font-medium text-slate-600">Documento</label>
          <Input value={form.documento_identidad} onChange={handle('documento_identidad')} placeholder="CC / NIT…" className="h-8 text-sm" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-600">Teléfono</label>
          <Input value={form.telefono} onChange={handle('telefono')} placeholder="300 123 4567" className="h-8 text-sm" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-600">Nombres <span className="text-red-500">*</span></label>
          <Input required value={form.nombres} onChange={handle('nombres')} placeholder="Nombre(s)" className="h-8 text-sm" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-600">Apellidos <span className="text-red-500">*</span></label>
          <Input required value={form.apellidos} onChange={handle('apellidos')} placeholder="Apellido(s)" className="h-8 text-sm" /></div>
        <div className="col-span-2 space-y-1"><label className="text-xs font-medium text-slate-600">Email</label>
          <Input type="email" value={form.email} onChange={handle('email')} placeholder="correo@ejemplo.com" className="h-8 text-sm" /></div>
        <div className="col-span-2 space-y-1"><label className="text-xs font-medium text-slate-600">Dirección</label>
          <Input value={form.direccion} onChange={handle('direccion')} placeholder="Calle 123 #45-67" className="h-8 text-sm" /></div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="flex-1" disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null} Crear cliente
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

// ── Client Search Panel ───────────────────────────────────────────────────────
function ClientPanel({ selectedClient, onSelectClient }) {
  const { toast } = useToast();
  const [doc, setDoc] = useState('');
  const [status, setStatus] = useState('idle'); // idle | searching | found | notfound
  const [showCreate, setShowCreate] = useState(false);
  const debounceRef = useRef(null);

  const lookup = useCallback(async (d) => {
    if (!d || d.length < 3) { setStatus('idle'); return; }
    setStatus('searching');
    try {
      const client = await salesService.searchClientByDocumento(d);
      if (client) { onSelectClient(client); setStatus('found'); }
      else { onSelectClient(null); setStatus('notfound'); }
    } catch { setStatus('idle'); }
  }, [onSelectClient]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => lookup(doc), 500);
  }, [doc, lookup]);

  const clear = () => { setDoc(''); onSelectClient(null); setStatus('idle'); setShowCreate(false); };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <p className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" />Cliente</p>
      {selectedClient ? (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
          <div className="flex-1">
            <p className="font-semibold text-sm">{selectedClient.nombres} {selectedClient.apellidos}</p>
            <p className="text-xs text-slate-400">{selectedClient.documento_identidad || 'Sin documento'}</p>
          </div>
          <button onClick={clear} className="text-slate-300 hover:text-red-500"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9 pr-8" placeholder="Buscar por documento…" value={doc} onChange={e => setDoc(e.target.value)} />
            {status === 'searching' && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />}
            {doc && <button onClick={clear} className="absolute right-2.5 top-2.5 text-slate-300 hover:text-slate-600"><X className="h-4 w-4" /></button>}
          </div>
          {status === 'notfound' && !showCreate && (
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>No encontrado — venta anónima o crea cliente</span>
              <button onClick={() => setShowCreate(true)} className="text-primary font-medium hover:underline flex items-center gap-1">
                <UserPlus className="h-3.5 w-3.5" /> Nuevo
              </button>
            </div>
          )}
          {showCreate && <QuickClientForm documento={doc} onCreated={(c) => { onSelectClient(c); setShowCreate(false); setDoc(c.documento_identidad || ''); }} onCancel={() => setShowCreate(false)} />}
        </>
      )}
    </div>
  );
}

// ── Delivery Panel ────────────────────────────────────────────────────────────
function DeliveryPanel({ tipoEntrega, onChangeTipo, direccion, onChangeDireccion, companyConfig }) {
  const zones = companyConfig?.zonas_domicilio || [];
  // parseFloat: precio_domicilio_base arrives as a string from PostgreSQL NUMERIC
  const basePrice = parseFloat(companyConfig?.precio_domicilio_base) || 0;
  const [selectedZone, setSelectedZone] = useState(null);

  const deliveryCost = selectedZone
    ? parseFloat(selectedZone.precio_base) || 0
    : (tipoEntrega === 'domicilio' ? basePrice : 0);

  // Notify parent about the selected zone price
  useEffect(() => {
    onChangeTipo(tipoEntrega, deliveryCost);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEntrega, deliveryCost]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <p className="text-sm font-semibold flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" /> Tipo de entrega
      </p>
      <div className="grid grid-cols-3 gap-2">
        {ENTREGA_OPTIONS.map(({ key, label, desc, Icon }) => (
          <button
            key={key}
            onClick={() => { onChangeTipo(key, key === 'domicilio' ? basePrice : 0); setSelectedZone(null); }}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
              tipoEntrega === key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-semibold leading-tight">{label}</span>
            <span className={`text-[10px] leading-tight ${tipoEntrega === key ? 'text-primary-foreground/80' : 'text-slate-400'}`}>{desc}</span>
          </button>
        ))}
      </div>

      {tipoEntrega === 'domicilio' && (
        <div className="space-y-2 pt-1">
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Dirección de entrega…"
              value={direccion}
              onChange={e => onChangeDireccion(e.target.value)}
            />
          </div>

          {/* Zones (if configured) */}
          {zones.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Zona de domicilio:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedZone(null)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all ${!selectedZone ? 'bg-primary text-primary-foreground border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-primary/40'}`}
                >
                  Base · {formatCurrency(basePrice)}
                </button>
                {zones.map((z, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedZone(z)}
                    className={`px-3 py-1 rounded-lg text-xs border transition-all ${selectedZone?.nombre === z.nombre ? 'bg-primary text-primary-foreground border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-primary/40'}`}
                  >
                    {z.nombre} · {formatCurrency(z.precio_base)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800 pt-2">
            <span className="text-slate-500">Costo domicilio:</span>
            <span className="font-bold text-amber-600">{formatCurrency(deliveryCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main POS Page ─────────────────────────────────────────────────────────────
export default function POSPage() {
  const { createSale, loading } = useSales();
  const { toast } = useToast();

  const [companyConfig, setCompanyConfig] = useState(null);

  // Product search
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);

  // Cart & sale config
  const [cartItems, setCartItems] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [tipoEntrega, setTipoEntrega] = useState('en_punto');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [notes, setNotes] = useState('');

  const [lastSale, setLastSale] = useState(null);

  // Load company config on mount
  useEffect(() => {
    companyService.getConfig().then(setCompanyConfig).catch(() => {});
  }, []);

  const searchProducts = useCallback(async (term) => {
    if (!term || term.length < 2) { setProducts([]); return; }
    setSearching(true);
    try {
      const data = await productsService.getAll({ search: term });
      setProducts(data.filter(p => p.activo && p.existencias > 0));
    } catch { setProducts([]); } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm, searchProducts]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        if (ex.cantidad >= product.existencias) {
          toast({ title: '⚠️ Stock máximo alcanzado', variant: 'destructive' }); return prev;
        }
        return prev.map(i => i.product.id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { product, cantidad: 1, precio: parseFloat(product.precio_venta_normal) }];
    });
    setSearchTerm(''); setProducts([]);
  };

  const updateQty = (id, delta) => setCartItems(prev =>
    prev.map(i => i.product.id === id ? { ...i, cantidad: Math.max(0, Math.min(i.cantidad + delta, i.product.existencias)) } : i)
      .filter(i => i.cantidad > 0)
  );
  const updatePrice = (id, val) => setCartItems(prev => prev.map(i => i.product.id === id ? { ...i, precio: parseFloat(val) || 0 } : i));
  const removeItem = (id) => setCartItems(prev => prev.filter(i => i.product.id !== id));

  const subtotal = cartItems.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const total = subtotal + (tipoEntrega === 'domicilio' ? deliveryCost : 0);

  const handleDeliveryChange = (tipo, cost) => {
    setTipoEntrega(tipo);
    setDeliveryCost(cost);
    if (tipo !== 'domicilio') setDireccionEntrega('');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({ title: '⚠️ El carrito está vacío', variant: 'destructive' }); return;
    }
    if (tipoEntrega === 'domicilio' && !direccionEntrega.trim()) {
      toast({ title: '⚠️ Debes ingresar la dirección de entrega', variant: 'destructive' }); return;
    }
    const domObs = tipoEntrega === 'domicilio'
      ? `[Domicilio · ${formatCurrency(deliveryCost)}] ${direccionEntrega}` : '';
    const payload = {
      id_cliente: selectedClient?.id || null,
      metodo_pago: paymentMethod,
      tipo_entrega: tipoEntrega,
      direccion_entrega: tipoEntrega === 'domicilio' ? direccionEntrega : null,
      observaciones: [notes, domObs].filter(Boolean).join(' | ') || null,
      items: cartItems.map(i => ({
        id_producto: i.product.id,
        cantidad: i.cantidad,
        precio_unitario_aplicado: i.precio
      }))
    };
    const result = await createSale(payload);
    if (result.success) {
      setLastSale(result.data);
      setCartItems([]); setSelectedClient(null); setNotes('');
      setTipoEntrega('en_punto'); setDeliveryCost(0); setDireccionEntrega('');
    } else {
      toast({ title: '❌ Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Punto de Venta</h2>
          <p className="text-sm text-muted-foreground">Busca productos, ajusta precios y cobra al cliente</p>
        </div>
      </div>

      {/* Success banner */}
      {lastSale && (
        <div className="mb-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-bold text-green-800 dark:text-green-200">Venta #{lastSale.id} registrada</p>
              <p className="text-sm text-green-600 dark:text-green-400">Total: {formatCurrency(lastSale.total)} · {lastSale.items_count} producto(s)</p>
            </div>
          </div>
          <button onClick={() => setLastSale(null)} className="text-green-400 hover:text-green-600"><X className="h-5 w-5" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Left: Product search + cart */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-10" placeholder="Buscar producto por nombre o código…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} autoFocus />
            </div>
            {(searching || products.length > 0) && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto rounded-lg border border-slate-100 dark:border-slate-800">
                {searching && <div className="p-3 text-center text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin inline mr-1" />Buscando…</div>}
                {products.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                    <div>
                      <p className="font-medium text-sm">{p.nombre}</p>
                      <p className="text-xs text-slate-400">{p.codigo_referencia} · Stock: {p.existencias}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-primary">{formatCurrency(p.precio_venta_normal)}</p>
                      <Plus className="h-4 w-4 text-slate-400 ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex-1">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-sm">Productos en la venta</span>
              <Badge variant="secondary">{cartItems.length}</Badge>
            </div>
            {cartItems.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Busca y agrega productos arriba</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {cartItems.map(item => (
                  <div key={item.product.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.nombre}</p>
                      <p className="text-xs text-slate-400">{item.product.codigo_referencia}</p>
                    </div>
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                      <input type="number"
                        className="w-full pl-5 pr-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                        value={item.precio} onChange={e => updatePrice(item.product.id, e.target.value)} min={0} />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(item.product.id, -1)} className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><Plus className="h-3 w-3" /></button>
                    </div>
                    <p className="w-24 text-right font-bold text-sm shrink-0">{formatCurrency(item.precio * item.cantidad)}</p>
                    <button onClick={() => removeItem(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Checkout panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Payment method */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Método de Pago</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${paymentMethod === m
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery panel */}
          <DeliveryPanel
            tipoEntrega={tipoEntrega}
            onChangeTipo={handleDeliveryChange}
            direccion={direccionEntrega}
            onChangeDireccion={setDireccionEntrega}
            companyConfig={companyConfig}
          />

          {/* Client */}
          <ClientPanel selectedClient={selectedClient} onSelectClient={setSelectedClient} />

          {/* Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" />Observaciones</p>
            <textarea
              className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
              rows={2} placeholder="Nota interna…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Total & Checkout */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mt-auto space-y-4">
            <div className="space-y-1.5">
              {cartItems.map(i => (
                <div key={i.product.id} className="flex justify-between text-sm text-slate-500">
                  <span className="truncate max-w-[60%]">{i.product.nombre} x{i.cantidad}</span>
                  <span>{formatCurrency(i.precio * i.cantidad)}</span>
                </div>
              ))}
              {tipoEntrega === 'domicilio' && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Domicilio</span>
                  <span>{formatCurrency(deliveryCost)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
            </div>
            <Button className="w-full gap-2 h-12 text-base" onClick={handleCheckout} disabled={loading || cartItems.length === 0}>
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Procesando…</> : <><Banknote className="h-5 w-5" /> Cobrar {formatCurrency(total)}</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
