import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, HeadphonesIcon } from 'lucide-react';

const props = [
  {
    icon: ShieldCheck,
    title: "Innovación Garantizada",
    description: "Equipos de última generación con garantía certificada y soporte directo.",
    color: "from-primary to-secondary",
    bg: "bg-primary/10 text-primary"
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte Técnico Especializado",
    description: "Expertos listos para reparar o mejorar tu equipo con repuestos originales.",
    color: "from-purple-400 to-pink-500",
    bg: "bg-purple-500/10 text-purple-500"
  },
  {
    icon: Truck,
    title: "Envíos Seguros",
    description: "Llegamos a todo el país. Tus compras viajan aseguradas y rastreadas.",
    color: "from-orange-400 to-rose-500",
    bg: "bg-orange-500/10 text-orange-500"
  }
];

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
};

export default function ValueProposition() {
  return (
    <section className="py-24 bg-[#F9F9F9] dark:bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {props.map((prop, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariant}
              className="bg-white dark:bg-[#111111] p-8 rounded-3xl border border-slate-200/50 dark:border-white/5 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
            >
              <div className={`h-16 w-16 ${prop.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <prop.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {prop.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
