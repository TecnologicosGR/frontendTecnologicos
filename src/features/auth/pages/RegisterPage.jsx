import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { AlertCircle, UserPlus, Cpu } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';

export default function RegisterPage() {
  const { registerClient } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre_completo: '',
    tipo_documento: 'CC',
    numero_documento: '',
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nombre_completo: formData.nombre_completo,
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento,
      telefono: formData.telefono,
      email: formData.email,
      direccion: formData.direccion,
      usuario: {
        email: formData.email,
        password: formData.password
      }
    };

    const result = await registerClient(payload);

    if (result.success) {
      toast({
        title: "¡Bienvenido/a!",
        description: "Tu cuenta ha sido creada exitosamente.",
        variant: "success",
      });
      navigate('/'); // Redirect to public facing home map after registering
    } else {
      setError(result.error || "Ocurrió un error en el registro");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] flex flex-col justify-center items-center p-4">
      
      {/* Background visual flair */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Link to="/" className="flex items-center gap-2 mb-8 relative z-10 group">
         <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:rotate-12 transition-transform">
           <Cpu size={24} />
         </div>
         <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
           Tecnológicos<span className="text-primary">GR</span>
         </span>
      </Link>

      <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 shadow-2xl rounded-3xl w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white flex justify-center items-center gap-2">
            <UserPlus className="text-primary" /> Crear Cuenta
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Únete y accede a compras, envíos y seguimiento técnico.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-start gap-2 text-sm font-medium mb-6">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nombre Completo</label>
            <Input 
              name="nombre_completo" 
              value={formData.nombre_completo} 
              onChange={handleChange} 
              required 
              className="bg-slate-50 dark:bg-[#0A0A0A]" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Tipo Doc</label>
              <select 
                name="tipo_documento" 
                value={formData.tipo_documento} 
                onChange={handleChange} 
                className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0A0A] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="NIT">NIT</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Número</label>
              <Input 
                name="numero_documento" 
                value={formData.numero_documento} 
                onChange={handleChange} 
                required 
                className="bg-slate-50 dark:bg-[#0A0A0A]" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Teléfono</label>
            <Input 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange} 
              required 
              className="bg-slate-50 dark:bg-[#0A0A0A]" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
            <Input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="bg-slate-50 dark:bg-[#0A0A0A]" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">Contraseña</label>
               <Input 
                 name="password" 
                 type="password" 
                 value={formData.password} 
                 onChange={handleChange} 
                 required 
                 className="bg-slate-50 dark:bg-[#0A0A0A]" 
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">Confirmar</label>
               <Input 
                 name="confirmPassword" 
                 type="password" 
                 value={formData.confirmPassword} 
                 onChange={handleChange} 
                 required 
                 className="bg-slate-50 dark:bg-[#0A0A0A]" 
               />
             </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-bold mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">
            Inicia Sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
