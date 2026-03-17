import React, { useEffect, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../../categories/hooks/useCategories';
import { useToast } from '../../../components/ui/toast';
import ProductForm from '../components/ProductForm';
import ProductImportModal from '../components/ProductImportModal';
import { Button } from '../../../components/ui/button';
import {
  Search, Plus, Filter, Box, AlertTriangle, CheckCircle,
  Tag, FileSpreadsheet, X, Pencil, Trash2, ChevronLeft,
  ChevronRight, Package, DollarSign, Hash, Barcode
} from 'lucide-react';
import { cn } from '../../../lib/utils';

/** Format a price value (string or number) as Colombian pesos without decimals */
const fmt = (v) => Number(v || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });

// ── Product Detail Modal ──────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose, onEdit, onDelete }) {
  const [imgIndex, setImgIndex] = useState(0);

  // Reset image index when product changes
  useEffect(() => { setImgIndex(0); }, [product?.id]);

  if (!product) return null;

  const images = product.urls_imagenes || [];
  const hasImages = images.length > 0;
  const lowStock = product.existencias <= product.stock_minimo;

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIndex(i => (i - 1 + images.length) % images.length);
  };
  const nextImg = (e) => {
    e.stopPropagation();
    setImgIndex(i => (i + 1) % images.length);
  };

  const prices = [
    { label: 'Precio Público',    value: product.precio_venta_normal,     highlight: true  },
    { label: 'Precio Técnico',    value: product.precio_venta_tecnico,    highlight: false },
    { label: 'Precio Intermedio', value: product.precio_venta_intermedio, highlight: false },
    { label: 'Precio Etiqueta',   value: product.precio_etiqueta,         highlight: false },
    { label: 'Costo de Compra',   value: product.costo_compra,            highlight: false },
  ].filter(p => p.value != null && p.value > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Image banner */}
        <div className="relative h-60 bg-slate-100 dark:bg-slate-800 shrink-0">
          {hasImages ? (
            <>
              <img
                src={images[imgIndex]}
                alt={product.nombre}
                className="w-full h-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={e => { e.stopPropagation(); setImgIndex(i); }}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === imgIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Box className="h-16 w-16 text-slate-300" />
            </div>
          )}

          {/* Stock badge */}
          <div className={cn(
            "absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow",
            lowStock ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
          )}>
            {lowStock ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            {product.existencias} en stock {lowStock && `(mín. ${product.stock_minimo})`}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-slate-400">{product.codigo_referencia}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {product.nombre_categoria || 'Sin categoría'}
              </span>
              {!product.activo && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  Inactivo
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{product.nombre}</h2>
          </div>

          {/* Description */}
          {product.descripcion && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-primary/30 pl-3">
              {product.descripcion}
            </p>
          )}

          {/* Meta chips */}
          {(product.numero_serie || product.meses_garantia > 0 || product.ubicacion_fisica) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {product.numero_serie && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <Barcode className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Nro. Serie</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">{product.numero_serie}</p>
                  </div>
                </div>
              )}
              {product.meses_garantia > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <Package className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Garantía</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">
                      {product.meses_garantia} mes{product.meses_garantia !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>
              )}
              {product.ubicacion_fisica && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <Hash className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Ubicación</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">{product.ubicacion_fisica}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prices */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Precios
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {prices.map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-lg p-3 border",
                    highlight
                      ? "bg-primary/5 border-primary/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{label}</p>
                  <p className={cn("text-base font-black", highlight ? "text-primary" : "text-slate-800 dark:text-white")}>
                    ${fmt(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3 bg-slate-50 dark:bg-slate-900 shrink-0">
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => { onClose(); onDelete(product.id); }}
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </Button>
          <Button
            className="gap-2 flex-1"
            onClick={() => { onClose(); onEdit(product); }}
          >
            <Pencil className="h-4 w-4" /> Editar Producto
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { toast } = useToast();

  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterCategory,   setFilterCategory]   = useState('');
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [isImportOpen,     setIsImportOpen]     = useState(false);
  const [editingProduct,   setEditingProduct]   = useState(null);
  const [viewingProduct,   setViewingProduct]   = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    const params = {};
    if (searchTerm)    params.search      = searchTerm;
    if (filterCategory) params.category_id = filterCategory;
    const t = setTimeout(() => fetchProducts(params), 300);
    return () => clearTimeout(t);
  }, [searchTerm, filterCategory, fetchProducts]);

  const handleCreate = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleEdit   = (p) => { setEditingProduct(p);   setIsModalOpen(true); };
  const handleView   = (p) => setViewingProduct(p);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;
    const r = await deleteProduct(id);
    if (r.success) toast({ title: 'Producto eliminado', variant: 'success' });
    else           toast({ title: 'Error', description: r.error, variant: 'destructive' });
  };

  const handleSubmit = async (data) => {
    const r = editingProduct
      ? await updateProduct(editingProduct.id, data)
      : await createProduct(data);
    if (r.success) {
      setIsModalOpen(false);
      toast({ title: editingProduct ? 'Producto Actualizado' : 'Producto Creado', variant: 'success' });
    } else {
      toast({ title: 'Error', description: r.error, variant: 'destructive' });
    }
  };

  return (
    <main className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventario de Productos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestione su catálogo, existencias y precios.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Importar Excel
          </Button>
          <Button onClick={handleCreate} className="shadow-md hover:shadow-lg transition-all active:scale-95">
            <Plus className="h-5 w-5 mr-2" /> Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            className="block w-full pl-10 pr-3 py-2 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="Buscar por nombre, código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm focus:outline-none focus:border-primary w-full md:w-[200px]"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && products.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <Box className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No se encontraron productos.</p>
          </div>
        ) : products.map(product => (
          <div
            key={product.id}
            onClick={() => handleView(product)}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
          >
            {/* Image */}
            <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
              {product.urls_imagenes?.length > 0 ? (
                <img
                  src={product.urls_imagenes[0]}
                  alt={product.nombre}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              ) : (
                <Box className="h-12 w-12 text-slate-300" />
              )}

              {/* Hover action buttons */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  size="icon" variant="secondary"
                  className="h-8 w-8 rounded-full shadow-sm"
                  title="Editar"
                  onClick={e => { e.stopPropagation(); handleEdit(product); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon" variant="destructive"
                  className="h-8 w-8 rounded-full shadow-sm"
                  title="Eliminar"
                  onClick={e => { e.stopPropagation(); handleDelete(product.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Stock badge */}
              <div className={cn(
                "absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm",
                product.existencias <= product.stock_minimo
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}>
                {product.existencias <= product.stock_minimo
                  ? <AlertTriangle className="h-3 w-3" />
                  : <CheckCircle className="h-3 w-3" />}
                {product.existencias} en stock
              </div>
            </div>

            {/* Card content */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-mono text-slate-400">{product.codigo_referencia}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {product.nombre_categoria || 'Generico'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2" title={product.nombre}>
                {product.nombre}
              </h3>

              {product.numero_serie && (
                <div className="mb-2 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 w-fit gap-1">
                  <Tag className="h-3 w-3" /> S/N: {product.numero_serie}
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Precio Público</span>
                  <span className="font-bold text-lg text-primary">${fmt(product.precio_venta_normal)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400">Técnico</span>
                  <span className="font-medium text-sm text-slate-600 dark:text-slate-400">${fmt(product.precio_venta_tecnico)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product detail modal */}
      <ProductDetailModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProduct}
      />

      <ProductImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </main>
  );
}
