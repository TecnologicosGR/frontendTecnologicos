import React, { useRef } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';

export default function PromotionImageModal({
  isOpen,
  onClose,
  promotion,
  onUpload,
  onDeleteImage,
  uploading = false
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Imágenes de Promoción: {promotion?.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Aviso informativo de integración con el carrusel */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-foreground">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Integrado con el Carrusel de la Tienda</p>
              <p className="text-muted-foreground mt-0.5">
                Las imágenes que subas aquí se almacenan en Firebase Storage y se muestran automáticamente en el carrusel de inicio al entrar a la página sin iniciar sesión.
              </p>
            </div>
          </div>

          {/* Zona de subida */}
          <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/10">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="promo-file-upload-modal"
              disabled={uploading}
            />
            <label htmlFor="promo-file-upload-modal" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Upload className={`h-6 w-6 ${uploading ? 'animate-bounce' : ''}`} />
              </div>
              <div className="text-sm font-bold">
                {uploading ? 'Subiendo imagen a Firebase...' : 'Haz clic para seleccionar imágenes'}
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos recomendados: JPG, PNG o WEBP (proporción horizontal recomendada para el carrusel).
              </p>
            </label>
          </div>

          {/* Galería de imágenes existentes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Imágenes Asignadas ({promotion?.urls_imagenes?.length || 0})
            </h4>

            {(!promotion?.urls_imagenes || promotion.urls_imagenes.length === 0) ? (
              <div className="p-8 text-center bg-muted/20 rounded-2xl text-xs text-muted-foreground">
                No hay imágenes subidas aún. Selecciona una arriba para añadirla.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {promotion.urls_imagenes.map((url, idx) => {
                  const isMain = idx === 0 || url === promotion.url_imagen;
                  return (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border aspect-[16/9] bg-black">
                      <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {isMain && (
                        <span className="absolute top-2 left-2 bg-primary text-black font-black text-[9px] uppercase px-2 py-0.5 rounded shadow">
                          Portada Carrusel
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                          title="Ver en tamaño completo"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => onDeleteImage(url)}
                          className="p-1.5 rounded-full bg-red-600/80 text-white hover:bg-red-600 transition-colors"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={onClose} className="bg-primary text-black font-bold">
              Listo
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

