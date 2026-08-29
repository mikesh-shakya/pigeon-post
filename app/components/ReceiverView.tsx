// app/components/ReceiverView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, Clock, Mail } from "lucide-react";
import confetti from "canvas-confetti";
import { LetterData } from "../types";

export default function ReceiverView({ receivedData }: { receivedData: LetterData }) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isUnsealed, setIsUnsealed] = useState(false);

  // Timer countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((receivedData.deliverAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [receivedData]);

  const breakSeal = () => {
    setIsUnsealed(true);
    // Dark, moody confetti colors to match the aesthetic
    confetti({ 
      particleCount: 40, 
      spread: 60, 
      origin: { y: 0.6 },
      colors: ['#7a1c1c', '#8a6b1c', '#3d3329'] 
    });
  };

  const isArrived = timeLeft !== null && timeLeft <= 0;

  return (
    <main className="min-h-screen bg-[#0e0c0b] text-[#b8a99a] relative selection:bg-[#3d3329] flex flex-col items-center justify-center p-6 sm:p-12 font-serif overflow-hidden">
      
      {/* Film Grain / Darkness Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.03] z-50 mix-blend-screen" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* Static Subtle Lamp Glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(45,35,25,0.4)_0%,rgba(14,12,11,1)_70%)] z-0"></div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col min-h-[80vh] justify-center items-center">
        
        <header className="absolute top-0 flex flex-col items-center opacity-30">
          <Feather className="w-4 h-4 mb-3" strokeWidth={1} />
          <h1 className="text-xs font-mono tracking-[0.3em] uppercase">Pigeon Post</h1>
        </header>

        <AnimatePresence mode="wait">
          {!isArrived ? (
            
            /* --- IN TRANSIT (WAITING) --- */
            <motion.div 
              key="waiting"
              initial={{ opacity: 0, filter: "blur(4px)" }} 
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <motion.div 
                  animate={{ opacity: [0.3, 0.8, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="text-3xl grayscale opacity-50 mb-8"
                >
                  🕊️
                </motion.div>
                <h2 className="text-xl font-serif text-[#d6c9b3] italic tracking-wide">A message is traveling through the night.</h2>
                <p className="text-xs font-mono opacity-40 tracking-widest uppercase">Dispatched by {receivedData.sender}</p>
              </div>

              <div className="pt-8 flex flex-col items-center gap-4">
                <Clock className="w-5 h-5 opacity-30 animate-pulse" />
                <span className="font-mono text-2xl tracking-[0.2em] text-[#e8ded1] font-light">
                  {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}` : "--:--"}
                </span>
              </div>
            </motion.div>

          ) : !isUnsealed ? (
            
            /* --- ARRIVED (SEALED) --- */
            <motion.div 
              key="sealed"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
              transition={{ duration: 1.5 }}
              className="text-center space-y-16"
            >
              <div className="space-y-4">
                <Mail className="w-8 h-8 opacity-40 mx-auto mb-6" strokeWidth={1} />
                <h2 className="text-2xl font-serif text-[#d6c9b3] italic tracking-wide">A pigeon has landed.</h2>
                <p className="text-xs font-mono opacity-40 tracking-widest uppercase">From the desk of {receivedData.sender}</p>
              </div>

              <button 
                onClick={breakSeal} 
                className={`relative group px-12 py-4 rounded-full font-serif italic text-lg transition-all duration-700 ${receivedData.sealColor} bg-opacity-20 hover:bg-opacity-40 text-[#e8ded1] border border-white/10`}
              >
                <span className="relative z-10 tracking-widest">Break the Seal</span>
                {/* Glowing ring behind the button */}
                <div className={`absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 ${receivedData.sealColor}`}></div>
              </button>
            </motion.div>

          ) : (
            
            /* --- UNSEALED (READING) --- */
            <motion.div 
              key="reading"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-full"
            >
              <div className="border-b border-[#3d362f] pb-6 mb-12 flex justify-between items-end opacity-40">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Dispatch Record</span>
                <span className="text-sm font-serif italic">From {receivedData.sender}</span>
              </div>
              
              <p className="text-3xl sm:text-4xl md:text-5xl leading-[1.7] text-[#e8ded1] font-[family-name:var(--font-caveat)] whitespace-pre-wrap">
                {receivedData.text}
              </p>
              
              <div className="mt-24 pt-12 border-t border-[#3d362f] text-center opacity-30 hover:opacity-100 transition-opacity duration-700">
                <a href="/" className="text-[10px] uppercase font-mono tracking-[0.3em] hover:text-[#d6c9b3] transition-colors">
                  [ Wanna send your own pigeon? Click here. ]
                </a>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </main>
  );
}