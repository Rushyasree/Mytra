"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Timeout to hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    // Keyboard listener
    const handleKeyPress = () => {
      setIsVisible(false);
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("mousedown", handleKeyPress); // Also for mouse clicks for accessibility

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("mousedown", handleKeyPress);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Background Image - Authentic India / Travel Mix */}
          <motion.div 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: "linear" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80')" }} // High quality Taj Mahal/Ganges mix
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
          
          {/* Text Content */}
          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <h2 className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-4">India Awaits</h2>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8">
                WELCOME TO <span className="text-primary">MYTRA</span>
              </h1>
              
              <motion.p 
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-gray-400 text-sm font-medium tracking-widest uppercase"
              >
                Press any key to begin your journey
              </motion.p>
            </motion.div>
          </div>

          {/* Progress Bar (Visual indicator of the 10s timer) */}
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 10, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-primary z-20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
