import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="bg-white dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-slate-800/50 pt-20 pb-10">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Intro */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/LogoTecnologicos.png" alt="Tecnológicos GR" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                Tecnológicos GR
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tu aliado estratégico en tecnología. Venta de equipos de última generación y laboratorio técnico especializado en microelectrónica.
            </p>
            <div className="flex gap-4 pt-2">
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111111] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors">
                 <Facebook size={18} />
               </a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111111] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors">
                 <Instagram size={18} />
               </a>
            </div>
          </div>

          {/* E-Commerce Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Tienda</h4>
            <ul className="space-y-3">
              <li><Link to="/catalogo" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Equipos y Laptops</Link></li>
              <li><Link to="/catalogo" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Componentes PC</Link></li>
              <li><Link to="/catalogo" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Smartphones</Link></li>
              <li><Link to="/catalogo" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Accesorios</Link></li>
            </ul>
          </div>

          {/* Policies & Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Soporte y Políticas</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Políticas de Garantía Técinica</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Políticas de Devolución</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Tiempos y Costos de Envío</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Términos y Condiciones</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-6">Contacto Directo</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                 <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                 <span className="text-slate-500 text-sm font-medium">Unilago, Local 1234, Carrera 15 #78-33, Bogotá, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                 <Phone size={18} className="text-primary shrink-0" />
                 <span className="text-slate-500 text-sm font-medium">+57 300 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                 <Mail size={18} className="text-primary shrink-0" />
                 <span className="text-slate-500 text-sm font-medium">soporte@tecnologicosgr.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm font-medium">
            © {new Date().getFullYear()} Tecnológicos GR. Todos los derechos reservados.
          </p>
          <div className="flex gap-2">
            <span className="w-10 h-6 bg-slate-200 dark:bg-[#111111] rounded uppercase text-[10px] font-bold flex items-center justify-center text-slate-500">VISA</span>
            <span className="w-10 h-6 bg-slate-200 dark:bg-[#111111] rounded uppercase text-[10px] font-bold flex items-center justify-center text-slate-500">MC</span>
            <span className="w-10 h-6 bg-slate-200 dark:bg-[#111111] rounded uppercase text-[10px] font-bold flex items-center justify-center text-slate-500">NEQUI</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
