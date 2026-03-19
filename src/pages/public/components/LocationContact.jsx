import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Map, Clock, Phone, Navigation } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function LocationContact() {
  return (
    <section className="py-24 bg-[#F9F9F9] dark:bg-[#0A0A0A] relative border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Contact Details (Left) */}
          <div className="flex-1 space-y-8 w-full">
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Contacto Inmediato</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Estamos aquí para <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">ayudarte.</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-10">
                Visita nuestro taller o escríbenos por WhatsApp. Cotizamos reparaciones sin compromiso y enviamos equipos a todo el país.
              </p>

              <div className="space-y-6">
                 {/* Address */}
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">Tienda Física y Taller</h4>
                      <p className="text-slate-500">Unilago, Local 1234, Carrera 15 #78-33<br/>Bogotá, Colombia</p>
                    </div>
                 </div>

                 {/* Hours */}
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-cyan-500 shrink-0 shadow-sm">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">Horarios de Atención</h4>
                      <p className="text-slate-500">Lunes a Sábado: 9:00 AM - 7:00 PM<br/>Domingos: 10:00 AM - 3:00 PM</p>
                    </div>
                 </div>
              </div>

              {/* Giant CTA */}
              <div className="mt-12">
                 <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-[#25D366] hover:bg-[#20BE5A] text-white text-lg font-bold shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.5)] transition-all flex items-center justify-center gap-3">
                   <MessageCircle size={24} /> 
                   Cotizar por WhatsApp
                 </Button>
                 <p className="text-xs text-slate-500 mt-4 text-center sm:text-left">Respondemos en menos de 5 minutos.</p>
              </div>

            </motion.div>
          </div>

          {/* Map / Image Placeholder (Right) */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
             className="flex-1 w-full"
          >
             <div className="w-full h-[400px] md:h-[550px] bg-slate-200 dark:bg-[#111111] rounded-[3rem] border-8 border-white dark:border-[#1A1A1A] overflow-hidden relative shadow-2xl group flex items-center justify-center text-center">
                {/* Embedded Map iframe would go here. Using a placeholder for esthetic purposes */}
                <img 
                   src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop" 
                   alt="Mapa Ubicación" 
                   className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
                
                {/* Floating Map Pin Indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer hover:-translate-y-8 transition-transform duration-300">
                   <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl relative">
                     <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50" />
                     <Navigation size={32} className="fill-current -mt-1 -ml-1" />
                   </div>
                   <div className="mt-4 bg-white/90 backdrop-blur text-slate-900 font-bold px-4 py-2 rounded-xl text-sm shadow-xl border border-slate-200">
                     ¡CÓMO LLEGAR!
                   </div>
                </div>
             </div>
          </motion.div>

        </div>
        
      </div>
    </section>
  );
}
