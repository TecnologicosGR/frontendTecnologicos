import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Map, Clock, Phone, Navigation } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function LocationContact() {
  const mapsUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.3842195608045!2d-73.25030782598692!3d10.47034676476691!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8abbdd538d3a97%3A0x2fd0b0a41084bb!2sTECNO-LOGICOS%20GR!5e0!3m2!1ses!2sco!4v1775250103058!5m2!1ses!2sco';
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=TECNO-LOGICOS%20GR';
  const handleWhatsAppClick = () => {
    const wppLink = 'https://wa.me/573001234567?text=Hola,%20me%20gustar%C3%ADa%20cotizar%20un%20servicio%20o%20producto.';
    window.open(wppLink, '_blank');
  };

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
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">Tienda Física</h4>
                      <p className="text-slate-500">Calle 18 #12 - 05, Barrio Gaitan<br/>Valledupar, Cesar</p>
                    </div>
                 </div>

                 {/* Hours */}
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-cyan-500 shrink-0 shadow-sm">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">Horarios de Atención</h4>
                      <p className="text-slate-500">Lunes a Viernes: 8:00 AM - 12:00 PM & 02:00 PM - 06:00 PM<br/>Sabados: 08:00 AM - 02:00 PM</p>
                    </div>
                 </div>
              </div>

              {/* Giant CTA */}
              <div className="mt-12">
                 <Button onClick={handleWhatsAppClick} size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-[#25D366] hover:bg-[#20BE5A] text-white text-lg font-bold shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.5)] transition-all flex items-center justify-center gap-3">
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
             <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir ubicación en Google Maps"
              className="block w-full h-[400px] md:h-[550px] bg-slate-200 dark:bg-[#111111] rounded-[3rem] border-8 border-white dark:border-[#1A1A1A] overflow-hidden relative shadow-2xl group"
             >
               <iframe
                src={mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de TECNO-LOGICOS GR"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
               />

               <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-10 pointer-events-none" />

               <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between gap-4">
                <div className="bg-white/90 dark:bg-[#111111]/90 backdrop-blur px-4 py-3 rounded-2xl shadow-xl border border-white/60 dark:border-white/10 max-w-[75%]">
                  <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Ubicación</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">TECNO-LOGICOS GR</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Haz clic para abrir cómo llegar</p>
                </div>

                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl relative shrink-0">
                  <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
                  <Navigation size={30} className="fill-current -mt-1 -ml-1 relative z-10" />
                </div>
               </div>
             </a>
           </motion.div>

        </div>
        
      </div>
    </section>
  );
}
