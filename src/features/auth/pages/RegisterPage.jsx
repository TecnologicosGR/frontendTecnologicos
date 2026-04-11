import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { AlertCircle, UserPlus, Cpu } from 'lucide-react';
import { useToast } from '../../../components/ui/toast';
import AuthSplitLayout from '../components/AuthSplitLayout';

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
    <AuthSplitLayout 
      title="Create your account"
      subtitle="Regístrate para desbloquear funciones de seguimiento avanzadas y comprar en línea con nosotros. ¡Embárcate en un viaje tecnológico!"
      isAdmin={false}
    >
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm font-medium mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Nombre Completo</label>
            <Input 
              name="nombre_completo" 
              value={formData.nombre_completo} 
              onChange={handleChange} 
              placeholder="Ingresa tu nombre"
              required 
              className="h-12 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-sm text-slate-900 dark:text-white shadow-inner placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Tipo Doc</label>
              <select 
                name="tipo_documento" 
                value={formData.tipo_documento} 
                onChange={handleChange} 
                className="w-full h-12 px-5 rounded-2xl border-0 bg-slate-100/80 dark:bg-slate-800/50 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary transition-all text-slate-700 dark:text-slate-300"
              >
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="NIT">NIT</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Número</label>
              <Input 
                name="numero_documento" 
                value={formData.numero_documento} 
                onChange={handleChange} 
                placeholder="12345678"
                required 
                className="h-12 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-sm text-slate-900 dark:text-white shadow-inner placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Teléfono</label>
                <Input 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  placeholder="Ingresa tu celular"
                  required 
                  className="h-12 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-sm text-slate-900 dark:text-white shadow-inner placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="ejemplo@email.com"
                  required 
                  className="h-12 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-sm text-slate-900 dark:text-white shadow-inner placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all" 
                />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Contraseña</label>
               <Input 
                 name="password" 
                 type="password" 
                 value={formData.password} 
                 onChange={handleChange} 
                 placeholder="Crea Password"
                 required 
                 className="h-12 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-sm text-slate-900 dark:text-white shadow-inner placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all" 
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Confirmar</label>
               <Input 
                 name="confirmPassword" 
                 type="password" 
                 value={formData.confirmPassword} 
                 onChange={handleChange} 
                 placeholder="Repetir Password"
                 required 
                 className="h-12 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-sm text-slate-900 dark:text-white shadow-inner placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary transition-all" 
               />
             </div>
          </div>

          <div className="flex items-center space-x-2 ml-1 mt-2 cursor-pointer">
            <input 
              type="checkbox" 
              id="terms_register" 
              className="w-4 h-4 rounded border-slate-300 text-[#1565C0] focus:ring-[#1565C0] accent-[#1565C0]" 
              required
            />
             <label htmlFor="terms_register" className="text-xs font-medium leading-none text-slate-500 cursor-pointer">
                I agree to the terms and Conditions
             </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-[#1565C0] hover:bg-[#0D47A1] shadow-lg shadow-blue-500/30 text-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center gap-4 text-slate-300 w-full mb-6">
              <hr className="flex-1 border-slate-200 dark:border-slate-800" />
              <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">Sign Up with</span>
              <hr className="flex-1 border-slate-200 dark:border-slate-800" />
            </div>
            <div className="flex gap-4">
              <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
              </button>
              <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 overflow-hidden hover:bg-slate-100 transition-colors shadow-sm">
                 <span className="font-bold leading-none">X</span>
              </button>
              <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors shadow-sm">
                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              </button>
            </div>
            <div className="mt-6 text-center text-sm text-slate-500">
               Already have an account?{' '}
               <Link to="/auth/login" className="text-[#1565C0] font-bold hover:underline">
                 Sign in
               </Link>
            </div>
        </div>
    </AuthSplitLayout>
  );
}
