import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { X, Loader2, Save } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function ClientForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    documento_identidad: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        password: '',
        documento_identidad: initialData.documento_identidad || '',
        nombres: initialData.nombres || '',
        apellidos: initialData.apellidos || '',
        telefono: initialData.telefono || '',
        direccion: initialData.direccion || ''
      });
    } else {
        setFormData({
            email: '',
            password: '',
            documento_identidad: '',
            nombres: '',
            apellidos: '',
            telefono: '',
            direccion: ''
        });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validateField = (name, value) => {
      let error = null;
      
      switch (name) {
          case 'email':
              // Simple regex, checking mostly on submit or valid format
              // We check length > 0 to start validating
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  error = "Formato de correo inválido.";
              }
              break;
          case 'telefono':
              if (!/^\d*$/.test(value)) {
                  error = "Solo se permiten números.";
              } else if (value.length > 0 && value.length < 10) {
                  error = `Faltan ${10 - value.length} dígitos.`;
              } else if (value.length > 10) {
                  error = `Excede el límite de 10 dígitos (sobran ${value.length - 10}).`;
              }
              break;
          case 'documento_identidad':
              if (!initialData) {
                  if (!/^\d*$/.test(value)) {
                      error = "Solo se permiten números.";
                  } else if (value.length > 0 && value.length < 7) {
                      error = `Muy corto (mínimo 7). Faltan ${7 - value.length}.`;
                  } else if (value.length > 10) {
                      error = `Muy largo (máximo 10). Sobran ${value.length - 10}.`;
                  }
              }
              break;
          default:
              break;
      }
      return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({
        ...prev,
        [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submitting
    const newErrors = {};
    if (!formData.nombres) newErrors.nombres = "Campo requerido";
    if (!formData.apellidos) newErrors.apellidos = "Campo requerido";
    
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validateField('telefono', formData.telefono);
    if (phoneError) newErrors.telefono = phoneError;
    if (!formData.telefono) newErrors.telefono = "Campo requerido";

    if (!initialData) {
        const docError = validateField('documento_identidad', formData.documento_identidad);
        if (docError) newErrors.documento_identidad = docError;
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setIsSubmitting(true);
    
    try {
        await onSubmit(formData);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-xl border bg-background shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b p-6">
            <div>
                <h2 className="text-xl font-bold tracking-tight">{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {initialData ? 'Actualiza la información del cliente.' : 'Registra un nuevo cliente en el sistema.'}
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
            </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nombres <span className="text-destructive">*</span></label>
                    <Input name="nombres" value={formData.nombres} onChange={handleChange} required placeholder="Ej. Juan" className="h-10" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Apellidos <span className="text-destructive">*</span></label>
                    <Input name="apellidos" value={formData.apellidos} onChange={handleChange} required placeholder="Ej. Pérez" className="h-10" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                     <label className="text-sm font-medium">
                        Documento Identidad 
                        {initialData && <span className="text-muted-foreground text-xs ml-1">(No editable)</span>}
                     </label>
                     <Input 
                        name="documento_identidad" 
                        value={formData.documento_identidad} 
                        onChange={handleChange} 
                        disabled={!!initialData} 
                        placeholder="Ej. 1234567890" 
                        className={cn("h-10", errors.documento_identidad && "border-destructive focus-visible:ring-destructive", initialData && "bg-muted")} 
                     />
                     {errors.documento_identidad && <p className="text-xs text-destructive">{errors.documento_identidad}</p>}
                </div>
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Email</label>
                     <Input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="cliente@empresa.com" 
                        className={cn("h-10", errors.email && "border-destructive focus-visible:ring-destructive")} 
                     />
                     {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
            </div>

            {!initialData && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Contraseña</label>
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="h-10" />
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Teléfono <span className="text-destructive">*</span></label>
                    <Input 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        required 
                        placeholder="3001234567" 
                        className={cn("h-10", errors.telefono && "border-destructive focus-visible:ring-destructive")} 
                    />
                    {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Dirección</label>
                    <Input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle 123 # 45-67" className="h-10" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                <Button type="button" variant="outline" onClick={onClose} className=" px-6">Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="px-6 min-w-[140px]">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {initialData ? 'Actualizar' : 'Guardar Cliente'}
                        </>
                    )}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
