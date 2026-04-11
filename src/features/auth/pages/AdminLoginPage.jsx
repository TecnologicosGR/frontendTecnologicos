import React from 'react';
import LoginForm from '../components/LoginForm';
import AuthSplitLayout from '../components/AuthSplitLayout';

export default function AdminLoginPage() {
  const footerIcons = (
    <div className="mt-8">
      <p className="text-xs text-slate-500 font-mono text-center tracking-widest uppercase">
          Acceso Exclusivo Autorizado &copy; {new Date().getFullYear()}
      </p>
    </div>
  );

  return (
    <AuthSplitLayout 
      title="Staff Login"
      subtitle="Portal de acceso exclusivo para personal técnico y roles administrativos. Cualquier intento de acceso no autorizado será registrado."
      isAdmin={true}
      childrenFooter={footerIcons}
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
