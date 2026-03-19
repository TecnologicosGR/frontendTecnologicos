import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppFAB() {
  const handleWhatsAppClick = () => {
    // Replace with actual business WhatsApp number
    const wppLink = "https://wa.me/573001234567?text=Hola,%20me%20gustar%C3%ADa%20cotizar%20un%20servicio%20o%20producto.";
    window.open(wppLink, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-30" />
      <div className="absolute inset-0 rounded-full animate-ping [animation-delay:400ms] bg-[#25D366] opacity-20" />
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWhatsAppClick}
        className="relative flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] transition-shadow"
      >
        <MessageCircle size={32} className="fill-current" />
      </motion.button>
    </div>
  );
}
