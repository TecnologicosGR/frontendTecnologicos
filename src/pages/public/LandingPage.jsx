import React from 'react';
import SEO from '../../components/SEO';
import PublicNavbar from './components/PublicNavbar';
import HeroSection from './components/HeroSection';
import BrandBar from './components/BrandBar';
import FeaturedProducts from './components/FeaturedProducts';
import PublicServices from './components/PublicServices';
import SocialProof from './components/SocialProof';
import LocationContact from './components/LocationContact';
import WhatsAppFAB from './components/WhatsAppFAB';
import PublicFooter from './components/PublicFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 scroll-smooth">
      <SEO 
        title="Inicio" 
        description="Servicio técnico especializado y tienda de tecnología en Valledupar. Reparación de pantallas, soporte para celulares y computadores, y venta de accesorios con garantía."
        keywords="tecnologicos valledupar, servicio tecnico valledupar, reparacion de celulares valledupar, tienda de tecnologia valledupar, accesorios para celular valledupar"
      />
      <PublicNavbar />
      <main>
        <HeroSection />
        <BrandBar />
        <FeaturedProducts />
        <PublicServices />
        <SocialProof />
        <LocationContact />
      </main>
      <PublicFooter />
      <WhatsAppFAB />
    </div>
  );
}
