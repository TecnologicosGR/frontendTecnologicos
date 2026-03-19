import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'MERCUSYS', logo: 'MERCUSYS', color: 'text-[#E50012] font-black tracking-tighter' },
  { name: 'PLUS ENERGY', logo: '+PLUS', color: 'text-blue-600 font-extrabold tracking-tighter' },
  { name: 'TP-Link', logo: 'tp-link', color: 'text-[#41B6E6] font-bold lowercase tracking-tight' },
  { name: 'Unitec', logo: 'unitec', color: 'text-[#00529B] font-medium lowercase tracking-wide' },
  { name: 'YANPO', logo: 'YANPO', color: 'text-slate-900 dark:text-white font-black font-serif' },
  { name: 'FLY', logo: 'FLY', color: 'text-[#E3000F] font-black border-2 border-[#E3000F] rounded-full px-2 py-1 text-sm' },
  { name: 'Genius', logo: 'Genius', color: 'text-slate-900 dark:text-white font-bold italic tracking-tight' },
  { name: 'JALTECH', logo: 'JALTECH', color: 'text-slate-500 font-black tracking-widest' },
  { name: 'J&R', logo: 'J&R', color: 'text-[#005697] font-black italic' },
  { name: 'Kingston', logo: 'Kingston', color: 'text-slate-900 dark:text-white font-black' },
];

export default function BrandBar() {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#0A0A0A] border-y border-slate-200/50 dark:border-white/5 py-8 overflow-hidden flex relative z-20">
      
      {/* Decorative gradient masks for infinite scroll effect */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#0A0A0A] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#0A0A0A] to-transparent z-10" />

      {/* Infinite scrolling marquee container */}
      <div className="flex w-fit animate-marquee whitespace-nowrap gap-16 md:gap-24 px-8 items-center justify-center min-w-full">
        {brands.map((brand, i) => (
           <div key={`brand1-${i}`} className="flex flex-col items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
              <span className={`text-2xl md:text-3xl font-black ${brand.color}`}>{brand.logo}</span>
           </div>
        ))}
        {/* Duplicate for seamless infinite scroll */}
        {brands.map((brand, i) => (
           <div key={`brand2-${i}`} className="flex flex-col items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
              <span className={`text-2xl md:text-3xl font-black ${brand.color}`}>{brand.logo}</span>
           </div>
        ))}
      </div>
      
    </div>
  );
}
