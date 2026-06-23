import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { OpeningLogo } from './OpeningLogo';
import { useVrcBarApp } from '../../lib/VrcBarAppContext';

export function OpeningAnimation() {
  const navigate = useNavigate();
  const { currentUser, setHasSeenOpening } = useVrcBarApp();


  const [isSkipped, setIsSkipped] = useState(false);

const completeOpening = () => {
  if (!currentUser) {
    navigate('/login', { replace: true });
    return;
  }
  setHasSeenOpening(true);

  if (currentUser?.role === 'customer') {
    navigate('/guest', { replace: true });
  } else if (currentUser?.approvalStatus === 'pending') {
    navigate('/app/pending', { replace: true });
  } else if (currentUser?.role === 'admin' || currentUser?.role === 'staff' || currentUser?.role === 'cast') {
    navigate('/app', { replace: true });
  } else {
    navigate('/app', { replace: true });
  }
};

const handleSkip = () => {
  if (!isSkipped) {
    setIsSkipped(true);
    completeOpening();
  }
};

  useEffect(() => {
    const timer = setTimeout(() => {
      completeOpening();
    }, 7000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'Escape'].includes(e.key)) {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
        onClick={handleSkip}
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,17,19,0.15)_0%,rgba(5,5,5,1)_70%)]" />
        
        {/* Background ambience elements (Silhouettes removed) */}
        <div className="relative z-10 w-full h-full">
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </div>

        {/* Logo and text overlay */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center"
          >
            <OpeningLogo />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-8 text-[#d4af37]/60 text-xs md:text-sm tracking-[1.5em] uppercase animate-pulse"
            >
              Welcome to the Night
            </motion.div>
          </motion.div>
        </div>

        {/* Skip hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 right-10 text-white/20 text-[10px] tracking-[0.2em] font-medium uppercase"
        >
          {/* Only show on non-touch if possible, otherwise generic */}
          <span className="hidden md:inline">Press Space / </span>Tap to skip
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
      </motion.div>
    </AnimatePresence>
  );
}
