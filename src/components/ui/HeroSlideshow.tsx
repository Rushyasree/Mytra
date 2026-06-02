"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  { 
    url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80", 
    location: "Agra", 
    title: "The Iconic Taj Mahal" 
  },
  { 
    url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80", 
    location: "Jaipur", 
    title: "The Pink City Heritage" 
  },
  { 
    url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80", 
    location: "Kerala", 
    title: "Serene Backwaters" 
  },
  { 
    url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80", 
    location: "Varanasi", 
    title: "The Spiritual Ghats" 
  },
  { 
    url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80", 
    location: "Goa", 
    title: "Pristine Golden Beaches" 
  },
];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slides[currentIndex].url}')` }}
          />
          {/* Subtle overlay for caption readability */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Caption */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-12 left-12 z-20 hidden md:block"
          >
            <p className="text-primary font-bold tracking-widest uppercase text-sm mb-1">{slides[currentIndex].location}</p>
            <p className="text-white text-2xl font-bold">{slides[currentIndex].title}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
