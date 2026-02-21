import React, { useState, useRef } from 'react';
import { productsService } from '../services/products.service';
import { useToast } from '../../../components/ui/toast';
import { Camera, Trash2, Upload, ZoomIn, X, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

/**
 * ProductImageGallery
 * Props:
 *   productId  — ID of the product (required for upload/delete). Pass null if product not yet created.
 *   images     — current array of image URLs
 *   onChange   — callback(newUrlsArray) called after every upload/delete
 *   readOnly   — show only, no upload/delete controls
 */
export default function ProductImageGallery({ productId, images = [], onChange, readOnly = false }) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  const handleFilePick = () => fileInputRef.current?.click();

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (!productId) {
      toast({ title: '⚠️ Guarda el producto primero', description: 'Las imágenes se suben después de crear el producto.' });
      return;
    }
    setUploading(true);
    try {
      const updatedUrls = await productsService.uploadImages(productId, files);
      onChange?.(updatedUrls);
      toast({ title: `✅ ${files.length} imagen(es) subida(s)` });
    } catch (err) {
      toast({ title: '❌ Error', description: err.detail || 'No se pudo subir la imagen', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (url) => {
    if (!productId) return;
    setDeletingUrl(url);
    try {
      const updatedUrls = await productsService.deleteImage(productId, url);
      onChange?.(updatedUrls);
      toast({ title: '🗑️ Imagen eliminada' });
    } catch (err) {
      toast({ title: '❌ Error', description: err.detail || 'No se pudo eliminar', variant: 'destructive' });
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Camera className="h-4 w-4 text-primary" />
          Imágenes del Producto
          {images.length > 0 && (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">{images.length}</span>
          )}
        </div>
        {!readOnly && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFilePick}
              disabled={uploading}
              className="gap-1.5 text-xs"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? 'Subiendo…' : 'Subir fotos'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}
      </div>

      {/* Gallery grid */}
      {images.length === 0 ? (
        !readOnly && (
          <button
            type="button"
            onClick={handleFilePick}
            disabled={uploading || !productId}
            className={cn(
              'w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 transition-colors',
              productId
                ? 'border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-400 hover:text-primary cursor-pointer'
                : 'border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed'
            )}
          >
            <Camera className="h-8 w-8" />
            <span className="text-xs font-medium">
              {productId ? 'Haz clic o arrastra imágenes aquí' : 'Guarda el producto para subir imágenes'}
            </span>
          </button>
        )
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setLightboxImg(url)}
                  className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full hover:bg-white transition-colors"
                >
                  <ZoomIn className="h-4 w-4 text-slate-700" />
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(url)}
                    disabled={deletingUrl === url}
                    className="bg-red-500/90 p-1.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    {deletingUrl === url
                      ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                      : <Trash2 className="h-4 w-4 text-white" />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* Add more button */}
          {!readOnly && (
            <button
              type="button"
              onClick={handleFilePick}
              disabled={uploading || !productId}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span className="text-xs">Añadir</span>
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxImg}
            alt="Vista ampliada"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
