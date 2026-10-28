import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  Tag, 
  Search, 
  Flame, 
  CheckCircle2,
  RefreshCw 
} from 'lucide-react';
import { usePromotions } from '../hooks/usePromotions';
import PromotionCard from '../components/PromotionCard';
import PromotionFormModal from '../components/PromotionFormModal';
import PromotionImageModal from '../components/PromotionImageModal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../components/ui/toast';

export default function PromotionsPage() {
  const { toast } = useToast();
  const {
    promotions,
    loading,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    toggleActive,
    uploadImages,
    deleteImage
  } = usePromotions();

  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = useCallback(() => {
    const params = {};
    if (filterType !== 'ALL') params.tipo = filterType;
    if (onlyActive) params.solo_vigentes = true;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    fetchPromotions(params);
  }, [filterType, onlyActive, searchTerm, fetchPromotions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejo de Modales
  const handleOpenCreate = () => {
    setSelectedPromo(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setSelectedPromo(promo);
    setIsFormOpen(true);
  };

  const handleOpenImageModal = (promo) => {
    setSelectedPromo(promo);
    setIsImageModalOpen(true);
  };

  // Enviar formulario (Crear / Actualizar)
  const handleFormSubmit = async (formData) => {
    if (!formData.titulo.trim()) {
      toast({ title: 'Campo obligatorio', description: 'El título es requerido', variant: 'destructive' });
      return;
    }
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      toast({ title: 'Fechas requeridas', description: 'Define la fecha de inicio y finalización', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const payload = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion?.trim() || null,
      tipo: formData.tipo,
      descuento_porcentaje: formData.descuento_porcentaje ? parseFloat(formData.descuento_porcentaje) : 0,
      descuento_fijo: formData.descuento_fijo ? parseFloat(formData.descuento_fijo) : 0,
      precio_promocional: formData.precio_promocional ? parseFloat(formData.precio_promocional) : null,
      fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
      fecha_fin: new Date(formData.fecha_fin).toISOString(),
      activo: formData.activo,
      destacado: formData.destacado,
      banner_posicion: formData.banner_posicion,
      condiciones: formData.condiciones?.trim() || null,
    };

    if (selectedPromo) {
      const res = await updatePromotion(selectedPromo.id, payload);
      setSubmitting(false);
      if (res.success) {
        toast({ title: 'Promoción actualizada', description: 'Cambios guardados con éxito' });
        setIsFormOpen(false);
      } else {
        toast({ title: 'Error', description: res.error, variant: 'destructive' });
      }
    } else {
      const res = await createPromotion(payload);
      setSubmitting(false);
      if (res.success) {
        toast({ title: 'Promoción creada', description: 'Ahora puedes subirle imágenes para el carrusel' });
        setIsFormOpen(false);
        setSelectedPromo(res.data);
        setIsImageModalOpen(true);
      } else {
        toast({ title: 'Error', description: res.error, variant: 'destructive' });
      }
    }
  };

  // Toggle Activo
  const handleToggleActive = async (id) => {
    const res = await toggleActive(id);
    if (res.success) {
      toast({
        title: res.data.activo ? 'Promoción activada' : 'Promoción desactivada',
        description: res.data.message
      });
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta promoción? Se desvinculará del carrusel.')) return;
    const res = await deletePromotion(id);
    if (res.success) {
      toast({ title: 'Promoción eliminada', description: 'La promoción fue retirada exitosamente' });
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  // Subir Imágenes
  const handleUploadImages = async (files) => {
    if (!selectedPromo) return;
    setUploadingImage(true);
    const res = await uploadImages(selectedPromo.id, files);
    setUploadingImage(false);

    if (res.success) {
      const updatedPromo = {
        ...selectedPromo,
        urls_imagenes: res.urls,
        url_imagen: selectedPromo.url_imagen || (res.urls.length > 0 ? res.urls[0] : null)
      };
      setSelectedPromo(updatedPromo);
      toast({ 
        title: 'Imágenes subidas', 
        description: 'La imagen ya está disponible y se reflejará en el carrusel de inicio.' 
      });
    } else {
      toast({ title: 'Error al subir', description: res.error, variant: 'destructive' });
    }
  };

  // Eliminar Imagen
  const handleDeleteImage = async (url) => {
    if (!selectedPromo) return;
    if (!window.confirm('¿Deseas eliminar esta imagen de la promoción?')) return;

    const res = await deleteImage(selectedPromo.id, url);
    if (res.success) {
      const newMain = res.urls.length > 0 ? res.urls[0] : null;
      const updatedPromo = {
        ...selectedPromo,
        urls_imagenes: res.urls,
        url_imagen: newMain
      };
      setSelectedPromo(updatedPromo);
      toast({ title: 'Imagen eliminada' });
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  // Métricas
  const totalActive = promotions.filter((p) => p.activo && p.esta_vigente).length;
  const totalDaily = promotions.filter((p) => p.tipo === 'DIA').length;
  const totalMonthly = promotions.filter((p) => p.tipo === 'MES').length;

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" /> Promociones y Banners
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Administra promociones del día, mes y productos. Las imágenes subidas se reflejan en el carrusel público de la tienda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleOpenCreate} className="bg-primary text-black hover:bg-primary/90 font-bold">
            <Plus className="h-4 w-4 mr-2" /> Nueva Promoción
          </Button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Registradas</p>
            <p className="text-2xl font-black">{promotions.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Tag className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Vigentes Ahora</p>
            <p className="text-2xl font-black text-emerald-500">{totalActive}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Promociones del Día</p>
            <p className="text-2xl font-black text-amber-500">{totalDaily}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Promociones del Mes</p>
            <p className="text-2xl font-black text-indigo-500">{totalMonthly}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-3 rounded-2xl border">
        {/* Pills de Tipo */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'DIA', label: '🔥 Del Día' },
            { id: 'MES', label: '📅 Del Mes' },
            { id: 'PRODUCTO', label: '🏷️ De Productos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === tab.id
                  ? 'bg-primary text-black shadow-sm'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Búsqueda y Switch Activas */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar promoción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <Button
            variant={onlyActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyActive(!onlyActive)}
            className="text-xs h-9 rounded-xl whitespace-nowrap"
          >
            {onlyActive ? 'Mostrando Vigentes' : 'Todas las Fechas'}
          </Button>
        </div>
      </div>

      {/* Listado de Promociones */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Cargando promociones...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 bg-muted/20 border border-dashed rounded-3xl text-center p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg">No se encontraron promociones</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Crea tu primera promoción del día o del mes y súbele una imagen para que se visualice en el carrusel de inicio.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-primary text-black font-bold">
            <Plus className="h-4 w-4 mr-2" /> Crear Promoción
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              onEdit={handleOpenEdit}
              onManageImages={handleOpenImageModal}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      <PromotionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        promotion={selectedPromo}
        submitting={submitting}
      />

      {/* Modal Imágenes / Banners */}
      <PromotionImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        promotion={selectedPromo}
        onUpload={handleUploadImages}
        onDeleteImage={handleDeleteImage}
        uploading={uploadingImage}
      />
    </div>
  );
}
