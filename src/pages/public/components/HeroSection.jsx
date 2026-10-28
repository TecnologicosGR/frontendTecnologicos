import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Wrench, ChevronRight, ChevronLeft, Sparkles, Flame, Calendar, Tag } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { useActivePromotions } from '../../../features/promotions/hooks/useActivePromotions';

const defaultSlides = [
  {
    id: 'def-1',
    title: 'Equipos Nuevos',
    subtitle: 'Laptops y PCs',
    desc: 'La última generación en tecnología directamente a tus manos, con envío nacional.',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1632&auto=format&fit=crop',
    link: '/catalogo',
    isPromo: false
  },
  {
    id: 'def-2',
    title: 'Servicio Técnico',
    subtitle: 'Taller Especializado',
    desc: 'Mantenimiento y diagnóstico de computadores y laptops con repuestos de grado original.',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=1530&auto=format&fit=crop',
    link: '#taller',
    isPromo: false
  },
  {
    id: 'def-3',
    title: 'Componentes',
    subtitle: 'Arma tu Setup',
    desc: 'Tarjetas gráficas, procesadores, RAM, fuentes y todo lo que necesitas para tu equipo.',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=1470&auto=format&fit=crop',
    link: '/catalogo',
    isPromo: false
  },
  {
    id: 'def-4',
    title: 'Periféricos y Redes',
    subtitle: 'Conectividad y Setup',
    desc: 'Teclados mecánicos, mouse, conectividad, audio y accesorios para potenciar tu estación de trabajo.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop',
    link: '/catalogo',
    isPromo: false
  }
];

export default function HeroSection() {
  const { promotions: activePromos } = useActivePromotions();
  const [slides, setSlides] = useState(defaultSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  // Mapear y anteponer promociones activas con imagen
  useEffect(() => {
    if (!activePromos || !Array.isArray(activePromos)) return;

    const promoSlides = activePromos
      .filter((p) => p.url_imagen || (p.urls_imagenes && p.urls_imagenes.length > 0))
      .map((p) => {
        let subtitle = '⚡ PROMOCIÓN DESTACADA';
        if (p.tipo === 'DIA') subtitle = '🔥 OFERTA DEL DÍA';
        else if (p.tipo === 'MES') subtitle = '⭐ ESPECIAL DEL MES';
        else if (p.tipo === 'PRODUCTO') subtitle = '🏷️ OFERTA EN PRODUCTO';

        if (p.descuento_porcentaje > 0) {
          subtitle += ` · ${p.descuento_porcentaje}% OFF`;
        }

        return {
          id: `promo-${p.id}`,
          title: p.titulo,
          subtitle: subtitle,
          desc: p.descripcion || 'Aprovecha nuestras ofertas y promociones exclusivas con garantía directa.',
          image: p.url_imagen || p.urls_imagenes[0],
          link: p.id_producto_principal ? `/producto/${p.id_producto_principal}` : '/catalogo',
          isPromo: true,
          tipo: p.tipo,
          descuento: p.descuento_porcentaje ? `${p.descuento_porcentaje}% OFF` : null
        };
      });

    if (promoSlides.length > 0) {
      setSlides([...promoSlides, ...defaultSlides]);
    } else {
      setSlides(defaultSlides);
    }
  }, [activePromos]);

  // Rotación automática cada 7 segundos
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const currentSlide = slides[activeSlide] || slides[0] || defaultSlides[0];

  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden bg-black flex items-center">
      
      {/* Dynamic Background con animación cruzada */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
          src={currentSlide.image}
          alt={currentSlide.title}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent z-0" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent z-0" />

      <div className="container mx-auto px-6 relative z-10 h-full flex flex-col md:flex-row items-center pt-24 pb-12">
        
        {/* Left Content (Text & Main CTAs) */}
        <div className="w-full md:w-5/12 text-left mb-12 md:mb-0 pr-0 md:pr-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
               <div className="relative flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                 <img src="/LogoTecnologicos.png" alt="Logo Oficial" className="w-8 h-8 object-contain" />
               </div>
               <span className="text-secondary font-bold tracking-widest uppercase text-sm drop-shadow-md">
                 Tecnológicos GR
               </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 uppercase">
              Pasión por la <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                Tecnología
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-10 font-light max-w-md">
              Tu tienda de confianza y el taller de servicio técnico más avanzado en computadores y laptops. Todo lo que tu mundo digital necesita en un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/catalogo" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full w-full bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all flex items-center gap-2">
                  Ver Tienda <ShoppingCart size={20} />
                </Button>
              </Link>
              <a href="#taller" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full w-full border-2 border-white/30 text-white hover:bg-white hover:text-black transition-all flex items-center gap-2 bg-transparent backdrop-blur-sm">
                  Cotizar Reparación <Wrench size={20} />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Content (Interactive Cards Slider) */}
        <div className="w-full md:w-7/12 flex flex-col justify-center h-full relative">
          
          <div className="flex items-end gap-4 overflow-x-hidden md:overflow-visible pb-10 w-full pl-4 md:pl-10">
            {slides.map((slide, index) => {
              const isActive = index === activeSlide;
              let xOffset = 0;
              let scale = 1;
              let zIndex = 10;
              let opacity = 1;

              if (index < activeSlide) {
                 opacity = 0;
                 xOffset = -100;
                 scale = 0.9;
                 zIndex = 0;
              } else if (index > activeSlide) {
                 const dist = index - activeSlide;
                 xOffset = dist * (window.innerWidth < 768 ? 160 : 250);
                 scale = 1 - (dist * 0.1);
                 zIndex = 10 - dist;
                 if (dist > 2) opacity = 0;
              }

              if (opacity === 0) return null;

              return (
                <motion.div
                  key={slide.id}
                  onClick={() => setActiveSlide(index)}
                  animate={{
                    x: isActive ? 0 : xOffset,
                    scale: scale,
                    opacity: opacity,
                    zIndex: zIndex
                  }}
                  transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }}
                  className={`absolute md:relative shrink-0 rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl transition-all ${
                    isActive 
                      ? 'w-[280px] h-[420px] md:w-[340px] md:h-[500px] border-2 border-primary/50 shadow-[0_0_40px_rgba(var(--primary),0.25)]' 
                      : 'w-[200px] h-[300px] md:w-[240px] md:h-[380px] filter brightness-75 hover:brightness-100'
                  }`}
                  style={{ 
                     originY: 1, 
                     left: isActive ? 0 : 'auto'
                  }}
                >
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />
                  
                  {/* Badge promocional destacado */}
                  {slide.isPromo && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <Sparkles className="h-3.5 w-3.5" />
                        {slide.descuento || 'OFERTA'}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <motion.div
                      animate={{ y: isActive ? 0 : 10, opacity: isActive ? 1 : 0.7 }}
                    >
                      <span className="text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2 block">
                        {slide.subtitle}
                      </span>
                      <h3 className={`font-black text-white leading-tight ${isActive ? 'text-2xl md:text-3xl mb-3' : 'text-xl'}`}>
                        {slide.title}
                      </h3>
                      
                      {isActive && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="overflow-hidden"
                        >
                          <p className="text-slate-300 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                            {slide.desc}
                          </p>
                          <Link to={slide.link}>
                            <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary bg-black/40 px-6 transition-all font-bold backdrop-blur-sm">
                              {slide.isPromo ? 'Aprovechar Oferta' : 'Explorar'}
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Slider Controls */}
          <div className="absolute bottom-0 md:bottom-12 left-4 md:left-10 flex items-center gap-4 z-20">
             <button 
               onClick={prevSlide}
               className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors backdrop-blur-sm"
               title="Anterior"
             >
               <ChevronLeft size={24} />
             </button>
             <button 
               onClick={nextSlide}
               className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors backdrop-blur-sm"
               title="Siguiente"
             >
               <ChevronRight size={24} />
             </button>
             <div className="text-white/50 ml-4 font-mono text-xl">
                <span className="text-white font-bold">0{activeSlide + 1}</span> / 0{slides.length}
             </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
