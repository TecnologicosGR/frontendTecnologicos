import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Gamepad2, Tablet, SearchCheck, CheckCircle, ShieldCheck, MessageSquare, Wrench, PackageCheck, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const repairCategories = [
  { icon: Smartphone, name: 'Móviles', desc: 'Pantallas, baterías, puertos y microelectrónica.' },
  { icon: Monitor, name: 'Computadoras', desc: 'Mantenimiento, upgrades, reballing y software.' },
  { icon: Gamepad2, name: 'Consolas', desc: 'Limpieza térmica, HDMI, lectura de discos.' },
  { icon: Tablet, name: 'Tablets', desc: 'Táctiles, displays, botones y conectividad.' },
];

const valueProps = [
  { icon: SearchCheck, title: 'Diagnóstico Rápido', text: 'Revisión técnica inmediata para darte un presupuesto sin compromiso.' },
  { icon: CheckCircle, title: 'Repuestos Originales', text: 'Solo utilizamos componentes de la más alta calidad y grado original (OEM).' },
  { icon: ShieldCheck, title: 'Garantía Total', text: 'Todas nuestras reparaciones cuentan con garantía directa y respaldo técnico.' },
];

const steps = [
  { step: '01', icon: MessageSquare, title: 'Contáctanos o Tráelo', desc: 'Escríbenos por WhatsApp o visítanos en nuestra tienda física para recibir tu equipo.' },
  { step: '02', icon: Wrench, title: 'Diagnóstico y Presupuesto', desc: 'Nuestros técnicos expertos evaluarán el daño y te daremos el precio exacto.' },
  { step: '03', icon: PackageCheck, title: 'Reparación y Entrega', desc: 'Reparamos tu dispositivo y te avisamos de inmediato para que lo recojas como nuevo.' },
];

export default function PublicServices() {
  return (
    <section id="taller" className="py-24 bg-white dark:bg-[#0A0A0A] relative border-t border-slate-100 dark:border-slate-800">
      
      {/* SECTION 4: El Taller / Servicio Técnico */}
      <div className="container mx-auto px-6 mb-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">El Taller Central</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Servicio Técnico Especializado
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">
              Diagnosticamos y reparamos a nivel componente. No importa la falla, tenemos el talento y la herramienta para solucionarlo.
            </p>
          </motion.div>
        </div>

        {/* Repair Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {repairCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-[#111111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-primary/30 hover:shadow-2xl transition-all group flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-slate-700 dark:text-slate-300">
                  <Icon size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{cat.name}</h4>
                <p className="text-sm text-slate-500">{cat.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Value Props */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-8 md:p-12 border border-primary/10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {valueProps.map((prop, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                   <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                      <prop.icon size={24} />
                   </div>
                   <div>
                      <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{prop.title}</h5>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{prop.text}</p>
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* SECTION 5: Process in 3 Steps */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-slate-900 text-white rounded-[3rem] p-10 md:p-20 overflow-hidden relative shadow-2xl">
          {/* Abstract geometric background */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
             <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="absolute w-[150%] right-[-25%] top-[-25%]">
               <path fill="#22D3EE" d="M381.5,-455.5C492.5,-399.5,579.5,-289.5,639.5,-163.5C699.5,-37.5,732.5,104.5,690.5,221.5C648.5,338.5,531.5,430.5,409.5,492.5C287.5,554.5,160.5,586.5,29.5,550.5C-101.5,514.5,-228.5,410.5,-337.5,314.5C-446.5,218.5,-537.5,130.5,-585.5,13.5C-633.5,-103.5,-638.5,-249.5,-569.5,-362.5C-500.5,-475.5,-357.5,-555.5,-230.5,-601.5C-103.5,-647.5,8.5,-659.5,123.5,-615.5C238.5,-571.5,356.5,-471.5,426.5,-387.5" transform="translate(400 400)" />
             </svg>
          </div>

          <div className="relative z-10 text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-black mb-4">A un paso de revivir tu equipo</h3>
            <p className="text-slate-300 max-w-xl mx-auto">Te lo hacemos extremadamente fácil. Dile adiós a las preocupaciones y deja la reparación en nuestras manos.</p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
             {/* Connecting dashed line on desktop */}
             <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-white/20 z-0" />
             
             {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                   <div className="w-24 h-24 bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center mb-6 text-primary relative shadow-xl">
                      <step.icon size={40} />
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-slate-900 flex items-center justify-center font-black text-xs border-2 border-slate-900">
                        {step.step}
                      </div>
                   </div>
                   <h4 className="text-2xl font-bold mb-3">{step.title}</h4>
                   <p className="text-slate-300 leading-relaxed font-light px-4">{step.desc}</p>
                </motion.div>
             ))}
          </div>

          <div className="mt-16 text-center relative z-10">
            <a href="https://wa.me/XXXXXXXXXX" target="_blank" rel="noreferrer">
             <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_hsl(var(--primary)/0.3)] border-none">
               Cotizar Ahora <ChevronRight className="ml-2" />
             </Button>
            </a>
          </div>
        </div>
      </div>
      
    </section>
  );
}
