import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';

const initialForm = {
  titulo: '',
  descripcion: '',
  tipo: 'DIA',
  descuento_porcentaje: '',
  descuento_fijo: '',
  precio_promocional: '',
  fecha_inicio: '',
  fecha_fin: '',
  activo: true,
  destacado: true,
  banner_posicion: 'PRINCIPAL',
  condiciones: '',
};

export default function PromotionFormModal({
  isOpen,
  onClose,
  onSubmit,
  promotion = null,
  submitting = false
}) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (promotion) {
      const formatForInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return isNaN(d) ? '' : d.toISOString().slice(0, 16);
      };

      setFormData({
        titulo: promotion.titulo || '',
        descripcion: promotion.descripcion || '',
        tipo: promotion.tipo || 'DIA',
        descuento_porcentaje: promotion.descuento_porcentaje ? String(promotion.descuento_porcentaje) : '',
        descuento_fijo: promotion.descuento_fijo ? String(promotion.descuento_fijo) : '',
        precio_promocional: promotion.precio_promocional ? String(promotion.precio_promocional) : '',
        fecha_inicio: formatForInput(promotion.fecha_inicio),
        fecha_fin: formatForInput(promotion.fecha_fin),
        activo: promotion.activo ?? true,
        destacado: promotion.destacado ?? false,
        banner_posicion: promotion.banner_posicion || 'PRINCIPAL',
        condiciones: promotion.condiciones || '',
      });
    } else {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatForInput = (d) => d.toISOString().slice(0, 16);

      setFormData({
        ...initialForm,
        fecha_inicio: formatForInput(now),
        fecha_fin: formatForInput(tomorrow),
      });
    }
  }, [promotion, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Título de la Promoción *
            </label>
            <Input
              placeholder="Ej. Flash Sale Gamer: 25% OFF en Periféricos"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Tipo de Promoción *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DIA">🔥 Promoción del Día (Flash)</option>
                <option value="MES">📅 Promoción del Mes</option>
                <option value="PRODUCTO">🏷️ Promoción de Producto</option>
                <option value="GENERAL">⚡ Promoción General</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Ubicación del Banner
              </label>
              <select
                value={formData.banner_posicion}
                onChange={(e) => setFormData({ ...formData, banner_posicion: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PRINCIPAL">Carrusel Principal (Hero)</option>
                <option value="CATALOGO">Banner en Catálogo</option>
                <option value="POPUP">Ventana Emergente (Popup)</option>
                <option value="LATERAL">Banner Lateral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Descripción
            </label>
            <textarea
              placeholder="Describe los beneficios, productos participantes o detalles atractivos..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Descuentos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                % Descuento
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="Ej. 20"
                value={formData.descuento_porcentaje}
                onChange={(e) => setFormData({ ...formData, descuento_porcentaje: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Descuento Fijo ($)
              </label>
              <Input
                type="number"
                min="0"
                step="100"
                placeholder="Ej. 50000"
                value={formData.descuento_fijo}
                onChange={(e) => setFormData({ ...formData, descuento_fijo: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Precio Oferta ($)
              </label>
              <Input
                type="number"
                min="0"
                step="100"
                placeholder="Ej. 199000"
                value={formData.precio_promocional}
                onChange={(e) => setFormData({ ...formData, precio_promocional: e.target.value })}
              />
            </div>
          </div>

          {/* Fechas de Vigencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Fecha y Hora Inicio *
              </label>
              <Input
                type="datetime-local"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Fecha y Hora Fin *
              </label>
              <Input
                type="datetime-local"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Condiciones */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Términos y Condiciones (Opcional)
            </label>
            <Input
              placeholder="Ej. Hasta agotar existencias. Máximo 1 por cliente."
              value={formData.condiciones}
              onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}
            />
          </div>

          {/* Opciones booleanas */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={formData.destacado}
                onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              Destacar en Carrusel Principal
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              Activa de inmediato
            </label>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary text-black font-bold">
              {submitting ? 'Guardando...' : promotion ? 'Actualizar Promoción' : 'Continuar y Subir Imágenes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

