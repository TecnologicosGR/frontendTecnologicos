import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { X, Loader2, Save, Box, AlertCircle, DollarSign, Archive, MapPin, Tag } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useCategories } from '../../categories/hooks/useCategories';
import { useProviders } from '../../providers/hooks/useProviders';
import ProductImageGallery from './ProductImageGallery';

export default function ProductForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const { categories, subcategories, fetchCategories, fetchSubcategories } = useCategories();
  const { providers, fetchProviders } = useProviders();
  
  const [formData, setFormData] = useState({
    codigo_referencia: '',
    nombre: '',
    descripcion: '',
    id_categoria: '', // Virtual field for filtering
    id_subcategoria: '',
    id_proveedor: '',
    costo_compra: '',
    precio_venta_normal: '',
    precio_venta_tecnico: '',
    stock_minimo: '',
    existencias: '',
    meses_garantia: '',
    ubicacion_fisica: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDependencies, setLoadingDependencies] = useState(false);
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    if (isOpen) {
        loadDependencies();
    }
  }, [isOpen]);

  useEffect(() => {
      if (initialData && isOpen) {
          // Flatten data if needed, or mapping
          // If initialData comes from List, check if it has all fields or if we need detail fetch
          // Assuming list has enough or we use what we have.
          
          // We need to find the category of the subcategory to pre-fill the virtual field
          // This might be tricky if we don't have the full subcategory list loaded or if initialData doesn't have it.
          // API List response: "nombre_categoria". 
          // But to set the dropdown correctly we need `id_category`. 
          // If the list item has `id_categoria` inside `subcategoria` object or similar...
          // The API docs for List Product don't show `id_category` or `id_subcategory` explicitly in the example response `ProductoResponse`.
          // It shows `nombre_categoria`.
          // IF the edit is hard, let's rely on `fetchSubcategories` having all subs and we find the matching one.
          
          setFormData({
            codigo_referencia: initialData.codigo_referencia || '',
            nombre: initialData.nombre || '',
            descripcion: initialData.descripcion || '',
            id_categoria: initialData.id_categoria || '',
            id_subcategoria: initialData.id_subcategoria || '',
            id_proveedor: initialData.id_proveedor || '',
            costo_compra: initialData.costo_compra || '',
            precio_venta_normal: initialData.precio_venta_normal || '',
            precio_venta_tecnico: initialData.precio_venta_tecnico || '',
            stock_minimo: initialData.stock_minimo || '',
            existencias: initialData.existencias || '',
            meses_garantia: initialData.meses_garantia || '',
            ubicacion_fisica: initialData.ubicacion_fisica || ''
          });
          setProductImages(initialData.urls_imagenes || []);
          
          // Heuristic to set category if missing but we have subcat ID
          // (Requires subcategories to be loaded)
      } else if (isOpen) {
          setFormData({
            codigo_referencia: '',
            nombre: '',
            descripcion: '',
            id_categoria: '',
            id_subcategoria: '',
            id_proveedor: '',
            costo_compra: '',
            precio_venta_normal: '',
            precio_venta_tecnico: '',
            stock_minimo: 5,
            existencias: 0,
            meses_garantia: 12,
            ubicacion_fisica: ''
          });
      }
  }, [initialData, isOpen]);

  const loadDependencies = async () => {
      setLoadingDependencies(true);
      await Promise.all([
          fetchCategories(),
          fetchSubcategories(),
          fetchProviders()
      ]);
      setLoadingDependencies(false);
  };
  
  // Logic to auto-select category if editing and we have subcat ID
  useEffect(() => {
      if (initialData && formData.id_subcategoria && !formData.id_categoria && subcategories.length > 0) {
          const sub = subcategories.find(s => s.id === formData.id_subcategoria);
          if (sub) {
              setFormData(prev => ({ ...prev, id_categoria: sub.id_categoria }));
          }
      }
  }, [initialData, formData.id_subcategoria, subcategories]);

  const filteredSubcategories = subcategories.filter(
      s => String(s.id_categoria) === String(formData.id_categoria)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        // Prepare payload (exclude virtual fields)
        const payload = { ...formData };
        delete payload.id_categoria;
        
        // Convert numbers
        payload.id_subcategoria = parseInt(payload.id_subcategoria);
        payload.id_proveedor = parseInt(payload.id_proveedor);
        payload.costo_compra = parseFloat(payload.costo_compra);
        payload.precio_venta_normal = parseFloat(payload.precio_venta_normal);
        payload.precio_venta_tecnico = parseFloat(payload.precio_venta_tecnico);
        payload.stock_minimo = parseInt(payload.stock_minimo);
        payload.existencias = parseInt(payload.existencias);
        payload.meses_garantia = parseInt(payload.meses_garantia);

        await onSubmit(payload);
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6 shrink-0 bg-white dark:bg-slate-900">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Complete la información técnica y comercial.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
            </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
            {loadingDependencies ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left Column: General Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 mb-4">
                            <Box className="h-5 w-5" />
                            <h3>Información General</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Código Referencia <span className="text-red-500">*</span></label>
                                <Input required value={formData.codigo_referencia} onChange={e => setFormData({...formData, codigo_referencia: e.target.value.toUpperCase()})} placeholder="Ej. SKU-123" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ubicación Física</label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input className="pl-9" value={formData.ubicacion_fisica} onChange={e => setFormData({...formData, ubicacion_fisica: e.target.value})} placeholder="Estante A1" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre del Producto <span className="text-red-500">*</span></label>
                            <Input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Laptop HP Pavilion 15" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.descripcion} 
                                onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                                placeholder="Detalles técnicos, características..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría <span className="text-red-500">*</span></label>
                                <select 
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.id_categoria}
                                    onChange={e => setFormData({...formData, id_categoria: e.target.value, id_subcategoria: ''})}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subcategoría <span className="text-red-500">*</span></label>
                                <select 
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.id_subcategoria}
                                    onChange={e => setFormData({...formData, id_subcategoria: e.target.value})}
                                    required
                                    disabled={!formData.id_categoria}
                                >
                                    <option value="">Seleccionar...</option>
                                    {filteredSubcategories.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Proveedor <span className="text-red-500">*</span></label>
                            <select 
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.id_proveedor}
                                onChange={e => setFormData({...formData, id_proveedor: e.target.value})}
                                required
                            >
                                <option value="">Seleccionar Proveedor...</option>
                                {providers.map(p => <option key={p.id} value={p.id}>{p.nombre_empresa}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Right Column: Financial & Stock */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 mb-4">
                            <DollarSign className="h-5 w-5" />
                            <h3>Costos e Inventario</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Costo Compra</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                    <Input type="number" step="0.01" className="pl-7" value={formData.costo_compra} onChange={e => setFormData({...formData, costo_compra: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meses Garantía</label>
                                <Input type="number" value={formData.meses_garantia} onChange={e => setFormData({...formData, meses_garantia: e.target.value})} />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4 border border-slate-100 dark:border-slate-800">
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Precio Venta Público <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                    <Input required type="number" step="0.01" className="pl-7 bg-white dark:bg-slate-900 font-bold" value={formData.precio_venta_normal} onChange={e => setFormData({...formData, precio_venta_normal: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Precio Venta Técnico</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                    <Input type="number" step="0.01" className="pl-7 bg-white dark:bg-slate-900" value={formData.precio_venta_tecnico} onChange={e => setFormData({...formData, precio_venta_tecnico: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Existencia Actual</label>
                                <div className="relative">
                                    <Archive className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input type="number" className="pl-9" value={formData.existencias} onChange={e => setFormData({...formData, existencias: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock Mínimo</label>
                                <Input type="number" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: e.target.value})} />
                            </div>
                        </div>

                         <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>El stock se actualizará automáticamente con las compras y ventas. Ajuste manual solo para correcciones.</p>
                        </div>
                    </div>

                    {/* Image Gallery — full-width row */}
                    <div className="md:col-span-2 border-t pt-6 space-y-3">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <h3>Imágenes</h3>
                        </div>
                        <ProductImageGallery
                            productId={initialData?.id || null}
                            images={productImages}
                            onChange={setProductImages}
                        />
                    </div>

                </form>
            )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="product-form" disabled={isSubmitting} className="px-6 min-w-[140px]">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Producto
                    </>
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}
