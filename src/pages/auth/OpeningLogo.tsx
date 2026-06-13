import React from 'react';
import { motion } from 'motion/react';

export function OpeningLogo() {
  return (
    <div className="flex flex-col items-center">
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, delay: 3.5 }}
        className="text-5xl md:text-7xl font-lux text-[#d4af37] tracking-[0.3em] mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]"
      >
        Nakiya_Bar
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 4.5 }}
        className="text-white/40 tracking-[0.5em] text-xs uppercase font-light"
      >
        Tonight begins.
      </motion.p>
      
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 3, delay: 3.5, ease: "circOut" }}
        className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mt-8"
      />
    </div>
  );
}
