import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { X, Loader2, Save } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { rolesService } from '../../roles/services/roles.service';

export default function EmployeeForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    documento_identidad: '',
    nombres: '',
    apellidos: '',
    cargo: '',
    id_rol: '',
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (isOpen) {
        fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        password: '', // Don't show password on edit
        documento_identidad: initialData.documento_identidad || '',
        nombres: initialData.nombres || '',
        apellidos: initialData.apellidos || '',
        cargo: initialData.cargo || '',
        id_rol: initialData.id_rol || '',
        activo: initialData.activo !== undefined ? initialData.activo : true
      });
    } else {
        setFormData({
            email: '',
            password: '',
            documento_identidad: '',
            nombres: '',
            apellidos: '',
            cargo: '',
            id_rol: '',
            activo: true
        });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
        const data = await rolesService.getAll();
        setRoles(data);
    } catch (e) {
        console.error("Error loading roles", e);
    } finally {
        setLoadingRoles(false);
    }
  };

  if (!isOpen) return null;

  const validateField = (name, value) => {
      let error = null;
      
      switch (name) {
          case 'email':
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  error = "Formato de correo inválido.";
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
    if (!formData.cargo) newErrors.cargo = "Campo requerido";
    if (!formData.id_rol) newErrors.id_rol = "Seleccione un rol";
    
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;
    if (!formData.email) newErrors.email = "Campo requerido";

    if (!initialData) {
        const docError = validateField('documento_identidad', formData.documento_identidad);
        if (docError) newErrors.documento_identidad = docError;
        if (!formData.documento_identidad) newErrors.documento_identidad = "Campo requerido";
        
        if (!formData.password) newErrors.password = "Campo requerido";
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
                <h2 className="text-xl font-bold tracking-tight">{initialData ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {initialData ? 'Actualiza la información y permisos del empleado.' : 'Registra un nuevo miembro del equipo.'}
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
                    <Input name="nombres" value={formData.nombres} onChange={handleChange} required placeholder="Ej. Ana" className="h-10" />
                    {errors.nombres && <p className="text-xs text-destructive">{errors.nombres}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Apellidos <span className="text-destructive">*</span></label>
                    <Input name="apellidos" value={formData.apellidos} onChange={handleChange} required placeholder="Ej. Lopez" className="h-10" />
                    {errors.apellidos && <p className="text-xs text-destructive">{errors.apellidos}</p>}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                     <label className="text-sm font-medium">
                        Documento Identidad 
                        {initialData && <span className="text-muted-foreground text-xs ml-1">(No editable)</span>}
                        {!initialData && <span className="text-destructive">*</span>}
                     </label>
                     <Input 
                        name="documento_identidad" 
                        value={formData.documento_identidad} 
                        onChange={handleChange} 
                        required 
                        disabled={!!initialData} 
                        placeholder="Ej. 77889900" 
                        className={cn("h-10", errors.documento_identidad && "border-destructive focus-visible:ring-destructive", initialData && "bg-muted")} 
                     />
                     {errors.documento_identidad && <p className="text-xs text-destructive">{errors.documento_identidad}</p>}
                </div>
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                     <Input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="empleado@empresa.com" 
                        className={cn("h-10", errors.email && "border-destructive focus-visible:ring-destructive")} 
                     />
                     {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Cargo <span className="text-destructive">*</span></label>
                    <Input name="cargo" value={formData.cargo} onChange={handleChange} required placeholder="Ej. Técnico" className="h-10" />
                    {errors.cargo && <p className="text-xs text-destructive">{errors.cargo}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Rol <span className="text-destructive">*</span></label>
                    <select 
                        name="id_rol" 
                        value={formData.id_rol} 
                        onChange={handleChange} 
                        required
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Seleccione un rol...</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.nombre}</option>
                        ))}
                    </select>
                    {errors.id_rol && <p className="text-xs text-destructive">{errors.id_rol}</p>}
                </div>
            </div>

            {!initialData && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Contraseña <span className="text-destructive">*</span></label>
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-10" />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
            )}

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
                            {initialData ? 'Actualizar' : 'Guardar Empleado'}
                        </>
                    )}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
