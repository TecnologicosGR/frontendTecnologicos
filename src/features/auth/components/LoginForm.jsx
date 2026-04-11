import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      if (result.user?.role === 'CLIENTE') {
        navigate('/mi-cuenta');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 w-full">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/15 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
        <Input 
          id="email" 
          type="text" 
          placeholder="Ingresa tu email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="h-14 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-base text-slate-900 dark:text-white shadow-inner focus-visible:ring-primary focus-visible:ring-2 transition-all placeholder:text-slate-400"
        />
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
        <Input 
          id="password" 
          type="password" 
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className="h-14 bg-slate-100/80 dark:bg-slate-800/50 border-0 rounded-2xl px-5 text-base text-slate-900 dark:text-white shadow-inner focus-visible:ring-primary focus-visible:ring-2 transition-all placeholder:text-slate-400"
        />
      </div>
      
      <div className="flex items-center space-x-2 ml-1 mt-1 cursor-pointer">
        <input 
          type="checkbox" 
          id="terms" 
          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary" 
        />
         <label htmlFor="terms" className="text-xs font-medium leading-none text-slate-500 cursor-pointer">
            Recuérdame en este dispositivo
         </label>
      </div>

      <Button 
        className="w-full h-14 mt-4 rounded-2xl bg-gradient-to-r from-primary to-blue-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-primary/30 text-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Ingresando...' : 'Sign In'}
      </Button>
    </form>
  );
}
