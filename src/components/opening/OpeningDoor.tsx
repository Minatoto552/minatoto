import React from 'react';
import { motion } from 'motion/react';

interface OpeningDoorProps {
  isOpen: boolean;
}

export function OpeningDoor({ isOpen }: OpeningDoorProps) {
  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden pointer-events-none">
      {/* Left Door */}
      <motion.div
        initial={{ x: 0 }}
        animate={isOpen ? { x: '-100%' } : { x: 0 }}
        transition={{ duration: 2.5, ease: [0.7, 0, 0.3, 1] }}
        className="relative w-1/2 h-full bg-[#0a0a0a] border-r border-[#d4af37]/40 shadow-[20px_0_100px_rgba(0,0,0,0.8)] flex items-center justify-end overflow-hidden"
      >
        {/* Door Panel Inset */}
        <div className="absolute inset-4 md:inset-10 border border-[#d4af37]/10 bg-black/40 rounded-lg">
           {/* Decorative Corner */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#d4af37]/30"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#d4af37]/30"></div>
        </div>

        {/* Door Handle Plate (Left) */}
        <div className="absolute right-4 w-12 h-64 bg-gradient-to-b from-[#1a1a1a] via-[#333] to-[#1a1a1a] border border-[#d4af37]/30 rounded-l-md shadow-lg flex items-center justify-center">
           <div className="w-2 h-40 bg-[#d4af37]/40 rounded-full blur-[1px]"></div>
        </div>
        
        {/* Left Half Logo - Moved to be more centered across the crack */}
        <div className="absolute right-0 translate-x-1/2 z-10 flex flex-col items-center">
            {!isOpen && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1.5, delay: 0.5 }}
                 className="flex flex-col items-center pointer-events-none"
               >
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]"></div>
                     <div className="w-3 h-3 rotate-45 border-2 border-[#d4af37] shadow-[0_0_10px_#d4af37]"></div>
                     <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]"></div>
                  </div>
                  <h1 className="font-lux text-5xl md:text-8xl gold-gradient-text tracking-[0.4em] uppercase whitespace-nowrap drop-shadow-[0_0_50px_rgba(212,175,55,0.8)]">
                    Nakiya_Bar
                  </h1>
                  <div className="h-[2px] w-full max-w-sm bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mt-6 shadow-[0_0_20px_rgba(212,175,55,1)]"></div>
                  <div className="text-[#d4af37] text-xs md:text-sm tracking-[1.2em] font-bold uppercase mt-8 animate-pulse drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]">
                    Entrance
                  </div>
               </motion.div>
            )}
        </div>
      </motion.div>

      {/* Right Door */}
      <motion.div
        initial={{ x: 0 }}
        animate={isOpen ? { x: '100%' } : { x: 0 }}
        transition={{ duration: 2.5, ease: [0.7, 0, 0.3, 1] }}
        className="relative w-1/2 h-full bg-[#0a0a0a] border-l border-[#d4af37]/40 shadow-[-20px_0_100px_rgba(0,0,0,0.8)] flex items-center justify-start overflow-hidden"
      >
        {/* Door Panel Inset */}
        <div className="absolute inset-4 md:inset-10 border border-[#d4af37]/10 bg-black/40 rounded-lg">
           {/* Decorative Corner */}
           <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#d4af37]/30"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#d4af37]/30"></div>
        </div>

        {/* Door Handle Plate (Right) */}
        <div className="absolute left-4 w-12 h-64 bg-gradient-to-b from-[#1a1a1a] via-[#333] to-[#1a1a1a] border border-[#d4af37]/30 rounded-r-md shadow-lg flex items-center justify-center">
           <div className="w-2 h-40 bg-[#d4af37]/40 rounded-full blur-[1px]"></div>
        </div>
      </motion.div>

      {/* Light from crack when closed */}
      {!isOpen && (
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scaleY: [1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-full bg-[#d4af37] blur-md z-50 pointer-events-none"
        />
      )}

      {/* Door Frame Inner Glow */}
      <div className="absolute inset-0 pointer-events-none z-40">
         <div className="absolute inset-0 border-[1px] border-[#d4af37]/10"></div>
      </div>
    </div>
  );
}
