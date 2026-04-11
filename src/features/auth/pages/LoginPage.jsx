import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import AuthSplitLayout from '../components/AuthSplitLayout';

export default function LoginPage() {
  const footerIcons = (
    <div className="mt-8 flex flex-col items-center">
      <div className="flex items-center gap-4 text-slate-300 w-full mb-6">
        <hr className="flex-1 border-slate-200 dark:border-slate-800" />
        <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">Ingresar con</span>
        <hr className="flex-1 border-slate-200 dark:border-slate-800" />
      </div>
      <div className="flex gap-4">
        {/* Placeholder social icons styling based on the image */}
        <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm">
           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
        </button>
        <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 overflow-hidden hover:bg-slate-100 transition-colors shadow-sm">
           <span className="font-bold text-xl leading-none">X</span>
        </button>
        <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors shadow-sm">
           <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
        </button>
      </div>
      <div className="mt-8 text-center text-sm text-slate-500">
        ¿Aún no eres cliente?{' '}
        <Link to="/auth/register" className="text-primary font-bold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );

  return (
    <AuthSplitLayout 
      title="Create your account"
      subtitle="Crea tu cuenta para desbloquear características premium y mantenerte actualizado con las últimas noticias. ¡Únete a nuestra comunidad!"
      isAdmin={false}
      childrenFooter={footerIcons}
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
