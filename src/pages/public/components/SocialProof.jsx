import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ShoppingBag, Wrench } from 'lucide-react';

const testimonials = [
  {
    type: 'shop',
    text: "¡Excelente el portátil que compré! Llegó al día siguiente perfectamente sellado. El precio fue imbatible comparado con tiendas de cadena.",
    author: "Mateo R.",
    product: "Laptop Asus ROG"
  },
  {
    type: 'repair',
    text: "¡Revivieron mi teléfono que se había mojado! Pensé que había perdido todas mis fotos. Trabajo súper profesional de micro-soldadura.",
    author: "Valentina G.",
    product: "Reparación iPhone 13"
  },
  {
    type: 'shop',
    text: "Compré los componentes para armar mi PC Gamer y la asesoría fue increíble. Todo súper bien empaquetado.",
    author: "Andrés C.",
    product: "Componentes PC"
  },
  {
    type: 'repair',
    text: "Me cambiaron el visor del Apple Watch y quedó como nuevo de fábrica. No se nota para nada que fue reparado. Súper recomendados.",
    author: "Diana P.",
    product: "Cambio de Visor"
  }
];

export default function SocialProof() {
  return (
    <section className="py-24 bg-white dark:bg-[#111111] border-y border-slate-100 dark:border-white/5 overflow-hidden">
      <div className="container mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
           <h2 className="text-sm font-bold tracking-widest text-[#25D366] uppercase mb-3">Comunidad Tecnológicos</h2>
           <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
             Lo que dicen quienes <br/> confían en nosotros
           </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F9F9F9] dark:bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 relative flex flex-col justify-between"
              >
                 <div className="absolute top-6 right-6 text-slate-200 dark:text-slate-800">
                    <MessageCircle size={40} className="fill-current" />
                 </div>
                 
                 <div>
                   <div className="flex gap-1 text-yellow-500 mb-6 relative z-10">
                     <Star size={16} className="fill-current" />
                     <Star size={16} className="fill-current" />
                     <Star size={16} className="fill-current" />
                     <Star size={16} className="fill-current" />
                     <Star size={16} className="fill-current" />
                   </div>
                   <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic relative z-10 mb-8">
                     "{t.text}"
                   </p>
                 </div>
                 
                 <div className="flex items-center gap-3 pt-6 border-t border-slate-200 dark:border-white/10 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{t.author}</h5>
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-white dark:bg-[#1A1A1A] border-2 border-slate-100 dark:border-[#222] shadow-sm flex items-center justify-center -translate-x-3 z-10">
                          {t.type === 'shop' ? <ShoppingBag size={12} className="text-primary" /> : <Wrench size={12} className="text-secondary" />}
                        </div>
                        <span className="text-[11px] font-bold uppercase text-slate-500">
                          {t.product}
                        </span>
                      </div>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>

      </div>
    </section>
  );
}
