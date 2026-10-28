import React from 'react';
import { 
  Flame, 
  Calendar, 
  Tag, 
  Image as ImageIcon, 
  Upload, 
  Clock, 
  Edit3, 
  Power, 
  Trash2 
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { formatCurrency } from '../../../lib/utils';

export default function PromotionCard({
  promotion,
  onEdit,
  onManageImages,
  onToggleActive,
  onDelete
}) {
  const hasImage = promotion.url_imagen || (promotion.urls_imagenes && promotion.urls_imagenes.length > 0);
  const displayImage = promotion.url_imagen || (promotion.urls_imagenes ? promotion.urls_imagenes[0] : null);
  const totalImgs = promotion.urls_imagenes ? promotion.urls_imagenes.length : (promotion.url_imagen ? 1 : 0);

  return (
    <div
      className={`group bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col ${
        !promotion.activo ? 'opacity-70 border-dashed' : ''
      }`}
    >
      {/* Portada / Banner de la Promoción */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <img
            src={displayImage}
            alt={promotion.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 p-6 text-center">
            <ImageIcon className="h-10 w-10 stroke-[1.5] opacity-50" />
            <span className="text-xs">Sin imagen subida</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onManageImages(promotion)}
              className="text-xs rounded-full h-7 px-3 bg-white/10 hover:bg-white/20 text-white"
            >
              <Upload className="h-3 w-3 mr-1" /> Subir Imagen
            </Button>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {promotion.tipo === 'DIA' && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <Flame className="h-3 w-3" /> Del Día
            </span>
          )}
          {promotion.tipo === 'MES' && (
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <Calendar className="h-3 w-3" /> Del Mes
            </span>
          )}
          {promotion.tipo === 'PRODUCTO' && (
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <Tag className="h-3 w-3" /> Producto
            </span>
          )}
          {promotion.destacado && (
            <span className="px-2.5 py-1 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              ★ Carrusel
            </span>
          )}
        </div>

        {/* Contador de imágenes / botón de subida */}
        <button
          onClick={() => onManageImages(promotion)}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all z-10 border border-white/20"
          title="Administrar imágenes para el carrusel"
        >
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          <span>{totalImgs} img</span>
        </button>

        {/* Descuento destacado sobre la imagen */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
          <div>
            {promotion.descuento_porcentaje > 0 && (
              <div className="text-2xl font-black text-primary drop-shadow-md">
                {promotion.descuento_porcentaje}% OFF
              </div>
            )}
            {promotion.descuento_fijo > 0 && (
              <div className="text-xl font-black text-primary drop-shadow-md">
                -{formatCurrency(promotion.descuento_fijo)}
              </div>
            )}
            {promotion.precio_promocional && (
              <div className="text-lg font-black text-white drop-shadow-md">
                Precio Oferta: {formatCurrency(promotion.precio_promocional)}
              </div>
            )}
          </div>

          <Badge variant={promotion.activo ? 'default' : 'secondary'} className="text-[10px]">
            {promotion.activo ? (promotion.esta_vigente ? '● Activa y Vigente' : '● Fuera de fecha') : '○ Pausada'}
          </Badge>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-lg text-foreground line-clamp-1 leading-snug">
            {promotion.titulo}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {promotion.descripcion || 'Sin descripción detallada.'}
          </p>

          {/* Vigencia */}
          <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Fin: {new Date(promotion.fecha_fin).toLocaleDateString()}
            </span>
            <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded">
              Posición: {promotion.banner_posicion}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManageImages(promotion)}
            className="text-xs rounded-xl flex-1 flex items-center justify-center gap-1.5"
          >
            <ImageIcon className="h-3.5 w-3.5 text-primary" />
            Imágenes
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(promotion)}
            className="text-xs rounded-xl h-9 px-3"
            title="Editar promoción"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(promotion.id)}
            className={`text-xs rounded-xl h-9 px-3 ${
              promotion.activo ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'
            }`}
            title={promotion.activo ? 'Pausar promoción' : 'Activar promoción'}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(promotion.id)}
            className="text-xs rounded-xl h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            title="Eliminar promoción"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

