import React, { useState, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2, FileText, Info } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { cn } from '../../../lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';

export default function ProductImportModal({ isOpen, onClose }) {
  const { validateFile, uploadFile } = useProducts();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Status state
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [processType, setProcessType] = useState(null); // 'validation' | 'import'
  const [validationErrors, setValidationErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Drag & Drop Handlers
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
      // Reset state on new file
      setFile(selectedFile);
      setStatus('idle');
      setValidationErrors([]);
      setErrorMsg('');
      setSuccessMsg('');
  }

  const handleAction = async (type) => {
    if (!file) return;
    setProcessType(type);
    setStatus('processing');
    setErrorMsg('');
    setValidationErrors([]);
    setSuccessMsg('');

    let result;
    if (type === 'validation') {
        result = await validateFile(file);
    } else {
        result = await uploadFile(file);
    }

    if (result.success) {
        setStatus('success');
        if (type === 'validation') {
            setSuccessMsg('El archivo es válido y seguro para importar.');
        } else {
            setSuccessMsg('Importación completada exitosamente.');
        }
    } else {
        setStatus('error');
        if (Array.isArray(result.error)) {
            setValidationErrors(result.error);
        } else {
            setErrorMsg(typeof result.error === 'string' ? result.error : 'Ocurrió un error inesperado');
        }
    }
  };

  const reset = () => {
      setFile(null);
      setStatus('idle');
      setProcessType(null);
      setValidationErrors([]);
      setErrorMsg('');
      setSuccessMsg('');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6 bg-white dark:bg-slate-900 shrink-0">
           <div>
                   <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                   <FileText className="h-6 w-6 text-green-600" />
                   Importación de Inventario (CSV)
               </h2>
               <p className="text-sm text-slate-500 mt-1">Cargue su archivo CSV para actualizar productos.</p>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5"/></Button>
        </div>
        
        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
            
            {/* SUCCESS STATE (Only for Import) */}
            {status === 'success' && processType === 'import' ? (
                <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in duration-300">
                    <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircle className="h-12 w-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Inventario Actualizado!</h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Los productos han sido creados y sincronizados correctamente en el sistema.</p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={reset}>Importar Otro</Button>
                        <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">Finalizar</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    
                    {/* DROP ZONE */}
                    {!file ? (
                        <div 
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={cn(
                                "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer",
                                isDragging 
                                    ? "border-primary bg-primary/5 scale-[1.02]" 
                                    : "border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <input 
                                type="file" 
                                accept=".csv"
                                className="hidden" 
                                id="file-upload"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload" className="w-full flex flex-col items-center cursor-pointer">
                                <div className={cn(
                                    "h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                    isDragging ? "bg-primary/20 text-primary" : "text-slate-400"
                                )}>
                                    <FileText className="h-10 w-10" />
                                </div>
                                <p className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">Arrastra tu archivo CSV aquí</p>
                                <p className="text-sm text-slate-400 mb-6">o haz clic para explorar tus carpetas</p>
                                <div className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 font-medium">
                                    Soporta formato .csv (Delimitado por comas)
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB • Listo para procesar</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* STATUS ALERTS */}
                    {status === 'processing' && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-3 animate-pulse">
                            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {processType === 'validation' ? 'Analizando integridad del archivo...' : 'Importando productos al sistema...'}
                            </span>
                        </div>
                    )}

                    {status === 'success' && processType === 'validation' && (
                        <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-400 font-bold">Validación Exitosa</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-500">
                                El archivo no contiene errores. Puede proceder con la importación.
                            </AlertDescription>
                        </Alert>
                    )}

                    {(status === 'error') && (
                        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-5 w-5" />
                            <AlertTitle className="font-bold">Error en {processType === 'validation' ? 'validación' : 'importación'}</AlertTitle>
                            <AlertDescription>
                                {errorMsg && <p className="mt-1">{errorMsg}</p>}
                                {validationErrors.length > 0 && (
                                    <div className="mt-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                                        {validationErrors.map((err, idx) => (
                                            <div key={idx} className="text-xs bg-white dark:bg-slate-950 p-2 rounded border border-red-200 dark:border-red-900 text-red-700 font-mono">
                                                [{err.loc?.join(' > ')}] {err.msg}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* ACTIONS */}
                    {file && status !== 'processing' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button 
                                variant="outline" 
                                onClick={() => handleAction('validation')}
                                className="h-auto py-4 flex flex-col gap-1 items-start px-5 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                            >
                                <span className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <CheckCircle className="h-4 w-4" /> Simular Validación
                                </span>
                                <span className="text-xs text-slate-500 text-left leading-tight">
                                    Verifica errores sin guardar cambios en la base de datos.
                                </span>
                            </Button>

                            <Button 
                                onClick={() => handleAction('import')} 
                                className="h-auto py-4 flex flex-col gap-1 items-start px-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-0 shadow-lg text-white"
                            >
                                <span className="font-bold flex items-center gap-2">
                                    <Upload className="h-4 w-4" /> Subir e Importar
                                </span>
                                <span className="text-xs text-indigo-100 text-left leading-tight">
                                    Carga los datos y actualiza el inventario real.
                                </span>
                            </Button>
                        </div>
                    )}

                    {!file && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                            <Info className="h-5 w-5 shrink-0" />
                            <p>Recuerde que el archivo debe seguir la plantilla maestra CSV. La importación sobrescribirá los datos existentes si coinciden los códigos.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
