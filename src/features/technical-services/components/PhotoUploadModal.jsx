import React, { useState, useEffect, useCallback } from 'react';
import { useTechnicalServices } from '../hooks/useTechnicalServices';
import { Button } from '../../../components/ui/button';
import { X, Upload, CheckCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';
import { cn } from '../../../lib/utils';

export default function PhotoUploadModal({ ticketId, onClose, onSuccess }) {
    const { uploadEvidence } = useTechnicalServices();
    const { toast } = useToast();
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Clean up previews on unmount
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const addFiles = useCallback((newFiles) => {
        const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length !== newFiles.length) {
            toast({ title: "Aviso", description: "Solo se permiten archivos de imagen.", variant: "warning" });
        }

        if (validFiles.length === 0) return;

        setFiles(prev => [...prev, ...validFiles]);
        
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }, [toast]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Drag and Drop handlers
    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    // Paste handler
    useEffect(() => {
        const handlePaste = (e) => {
            if (e.clipboardData && e.clipboardData.files) {
                const pastedFiles = Array.from(e.clipboardData.files);
                if (pastedFiles.length > 0) {
                    addFiles(pastedFiles);
                }
            }
        };
        
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [addFiles]);

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const result = await uploadEvidence(ticketId, files);
        setUploading(false);

        if (result.success) {
            toast({ title: "Fotos subidas", description: `${files.length} imágenes agregadas correctamente.`, variant: "success" });
            onSuccess?.();
            onClose();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Subir Evidencia</h3>
                        <p className="text-xs text-slate-500">Ticket #{ticketId}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Convert drop zone to label for click-to-upload support combined with drag-drop */}
                    <div 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 relative",
                            isDragging 
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]" 
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                    >
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            onChange={handleFileChange}
                        />
                        
                        <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <Upload className="h-7 w-7" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                            Arrastra fotos aquí o haz clic para seleccionar
                        </h4>
                        <p className="text-sm text-slate-500 mb-4">
                            También puedes pegar imágenes (Ctrl+V)
                        </p>
                        <p className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            PNG, JPG, WEBP soporta múltiples archivos
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {files.length} Archivos seleccionados
                            </h4>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {previews.map((src, i) => (
                                    <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button 
                                                variant="destructive" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => removeFile(i)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        {/* File Info Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                            <p className="text-[10px] text-white truncate text-center">{files[i].name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button 
                        onClick={handleUpload} 
                        disabled={uploading || files.length === 0} 
                        className={cn(
                            "min-w-[120px]",
                            uploading ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"
                        )}
                    >
                        {uploading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Subiendo...</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Subir {files.length > 0 ? `(${files.length})` : ''}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
