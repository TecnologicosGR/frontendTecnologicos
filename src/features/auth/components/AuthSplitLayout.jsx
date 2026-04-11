import React from 'react';

export default function AuthSplitLayout({ children, title, subtitle, isAdmin = false, childrenFooter }) {
  // Configuración de colores
  const leftBgColor = isAdmin ? 'bg-slate-900' : 'bg-[#1565C0]'; 
  
  return (
    <div className={`flex min-h-screen w-full font-sans overflow-hidden ${isAdmin ? 'bg-[#0A0A0A]' : 'bg-white dark:bg-[#0A0A0A]'}`}>
      
      {/* ── LATERAL IZQUIERDO ── */}
      <div className={`relative hidden md:flex flex-col justify-center items-center w-[45%] lg:w-[40%] ${leftBgColor} text-white p-12 z-10 shadow-2xl`}>
        
        {/* SVG Clound Boundary exacto */}
        {!isAdmin && (
          <div className="absolute inset-y-0 right-0 translate-x-[99%] w-[10vw] h-full pointer-events-none z-0">
             <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="w-full h-full fill-[#1565C0]">
                <path d="M0,0 C100,50 150,150 50,250 C-20,350 120,450 60,550 C0,650 140,750 60,850 C-30,950 80,1000 0,1000 Z" />
             </svg>
             <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="absolute top-0 left-[-10px] w-full h-full fill-[#1565C0]/30 -z-10 blur-sm">
                <path d="M0,0 C120,60 170,160 60,260 C-10,360 140,460 70,560 C10,660 160,760 70,860 C-20,960 100,1000 0,1000 Z" />
             </svg>
             <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="absolute top-0 left-[10px] w-full h-full fill-[#81D4FA]/30 -z-20 blur-md">
                <path d="M0,0 C100,50 150,150 50,250 C-20,350 120,450 60,550 C0,650 140,750 60,850 C-30,950 80,1000 0,1000 Z" />
             </svg>
          </div>
        )}

        <div className="relative z-20 flex flex-col items-center text-center max-w-sm mt-[-5%]">
          <h2 className="text-3xl font-bold mb-10 tracking-wide">
            {isAdmin ? 'Acceso Privado' : 'Welcome to'}
          </h2>
          
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.2)] mb-8 overflow-hidden p-6">
             <img src="/LogoTecnologicos.png" alt="Tecnológicos GR" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight mb-6">
            {!isAdmin && 'Spacer'}
          </h1>
          
          <p className="text-white/90 leading-relaxed text-sm font-medium">
            {subtitle}
          </p>
          
          <div className="mt-20 text-xs text-white/70 tracking-widest font-bold flex items-center gap-6">
             <span className="cursor-pointer hover:text-white transition-colors">CREATE HERE</span> 
             <span className="w-1 h-3 bg-white/30 rounded-full"></span> 
             <span className="cursor-pointer hover:text-white transition-colors">DISCOVER HERE</span>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-20">
        <div className="w-full max-w-md bg-white dark:bg-[#0A0A0A] md:bg-transparent md:dark:bg-transparent p-8 md:p-10 rounded-3xl md:rounded-none shadow-xl border border-slate-100 dark:border-slate-800 md:shadow-none md:border-none relative z-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-left mb-8">
            {title}
          </h2>
          
          {children}

          {childrenFooter && (
             <div className="mt-6">
               {childrenFooter}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
