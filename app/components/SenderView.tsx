"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, Copy, Check } from "lucide-react";
import { LetterData, HistoryItem } from "../types";

const MAX_WEIGHT = 2000;
const SEALS = [
  { name: "Ruby", color: "bg-[#7a1c1c] shadow-[0_0_15px_rgba(122,28,28,0.4)]" },
  { name: "Navy", color: "bg-[#1c2841] shadow-[0_0_15px_rgba(28,40,65,0.4)]" },
  { name: "Emerald", color: "bg-[#1b3626] shadow-[0_0_15px_rgba(27,54,38,0.4)]" },
  { name: "Gold", color: "bg-[#8a6b1c] shadow-[0_0_15px_rgba(138,107,28,0.4)]" },
];

export default function SenderView() {
  const [senderName, setSenderName] = useState("");
  const [letterText, setLetterText] = useState("");
  const [sealColor, setSealColor] = useState(SEALS[0].color);
  const [travelMinutes, setTravelMinutes] = useState(2);
  const [shareableUrl, setShareableUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const [isSending, setIsSending] = useState(false);
  const [dispatchHistory, setDispatchHistory] = useState<HistoryItem[]>([]);
  const currentWeight = letterText.length;
  
  const scribbleSound = useRef<HTMLAudioElement | null>(null);
  // Ref for the dynamic cursor light
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pigeon_history");
    if (saved) {
      try { setDispatchHistory(JSON.parse(saved)); } 
      catch (e) { console.error("Failed to parse history", e); }
    }
    scribbleSound.current = new Audio('/scribble.mp3');
    scribbleSound.current.volume = 0.2;

    // Smooth Cursor Tracking Logic
    const handleMouseMove = (e: MouseEvent) => {
      if (lightRef.current) {
        lightRef.current.style.setProperty('--x', `${e.clientX}px`);
        lightRef.current.style.setProperty('--y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLetterText(e.target.value);
    if (scribbleSound.current) {
      scribbleSound.current.currentTime = 0;
      scribbleSound.current.play().catch(() => {}); 
    }
  };

  const handleSendPigeon = () => {
    if (!letterText.trim()) return;
    
    setIsSending(true);
    const deliverAt = Date.now() + travelMinutes * 60 * 1000;
    
    const payload: LetterData = {
      text: letterText,
      sender: senderName || "An Anonymous Friend",
      sealColor,
      deliverAt,
    };
    
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const generatedUrl = `${window.location.origin}/#${encoded}`;

    const newRecord: HistoryItem = {
      id: crypto.randomUUID(),
      dateSent: Date.now(),
      textPreview: letterText.slice(0, 40) + (letterText.length > 40 ? "..." : ""),
      url: generatedUrl,
    };

    setTimeout(() => {
      setShareableUrl(generatedUrl);
      setIsSending(false);
      
      const updatedHistory = [newRecord, ...dispatchHistory];
      setDispatchHistory(updatedHistory);
      localStorage.setItem("pigeon_history", JSON.stringify(updatedHistory));
    }, 2500);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to burn all past records? They will be lost to the night.")) {
      setDispatchHistory([]);
      localStorage.removeItem("pigeon_history");
    }
  };

  return (
    <main className="min-h-screen bg-[#0e0c0b] text-[#b8a99a] relative selection:bg-[#3d3329] flex flex-col items-center justify-center p-6 sm:p-12 font-serif overflow-hidden">
      
      {/* Film Grain Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.03] z-50 mix-blend-screen" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* --- DYNAMIC CURSOR LAMP EFFECT --- */}
      <div 
        ref={lightRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500" 
        style={{
          // Uses native CSS variables updated by the mouse listener
          background: 'radial-gradient(circle 600px at var(--x, 50vw) var(--y, 50vh), rgba(60,45,30,0.5) 0%, rgba(14,12,11,1) 80%)'
        }}
      ></div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col min-h-[80vh]">
        
        <header className="flex flex-col items-center mb-16 text-center opacity-40 hover:opacity-100 transition-opacity duration-700">
          <Feather className="w-4 h-4 mb-3" strokeWidth={1} />
          <h1 className="text-sm font-mono tracking-[0.3em] uppercase">Pigeon Post</h1>
        </header>

        <AnimatePresence mode="wait">
          {!shareableUrl && !isSending ? (
            <motion.div 
              key="drafting"
              initial={{ opacity: 0, filter: "blur(4px)" }} 
              animate={{ opacity: 1, filter: "blur(0px)" }} 
              exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 1.5 } }}
              className="flex-1 flex flex-col justify-center space-y-12"
            >
              
              <div className="text-center">
                <input 
                  type="text" 
                  placeholder="Who is writing?" 
                  value={senderName} 
                  onChange={(e) => setSenderName(e.target.value)} 
                  className="bg-transparent text-center text-lg sm:text-xl font-serif tracking-widest text-[#d6c9b3] focus:outline-none placeholder:text-[#5c534a] transition-all w-full" 
                />
              </div>

              <div className="relative group">
                <textarea 
                  rows={6} 
                  maxLength={MAX_WEIGHT} 
                  placeholder="Write your note in the dark..." 
                  value={letterText} 
                  onChange={handleTyping} 
                  className="w-full bg-transparent text-2xl sm:text-3xl md:text-4xl font-[family-name:var(--font-caveat)] leading-[1.6] text-[#e8ded1] focus:outline-none resize-none placeholder:text-[#3d362f] transition-all" 
                />
                <div className="absolute right-0 -bottom-6 opacity-0 group-hover:opacity-30 transition-opacity duration-500 text-[10px] font-mono tracking-widest">
                  {currentWeight} / {MAX_WEIGHT}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-12 opacity-20 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-700">
                <div className="flex flex-col items-center sm:items-start gap-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-mono">Wax Seal</span>
                  <div className="flex gap-4">
                    {SEALS.map((seal) => (
                      <button 
                        key={seal.name} 
                        onClick={() => setSealColor(seal.color)} 
                        className={`w-4 h-4 rounded-full transition-all duration-500 ${seal.color} ${sealColor === seal.color ? "scale-150 ring-1 ring-offset-2 ring-offset-[#0e0c0b] ring-[#d6c9b3]" : "opacity-30 hover:opacity-100 hover:scale-125"}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-center sm:items-end gap-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-mono">Delay: {travelMinutes}m</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="15" 
                    value={travelMinutes} 
                    onChange={(e) => setTravelMinutes(Number(e.target.value))} 
                    className="w-full sm:w-32 appearance-none h-[1px] bg-[#3d362f] outline-none" 
                  />
                  <style jsx>{`
                    input[type=range]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      height: 8px;
                      width: 8px;
                      border-radius: 50%;
                      background: #b8a99a;
                      cursor: pointer;
                      box-shadow: 0 0 10px rgba(184, 169, 154, 0.5);
                    }
                  `}</style>
                </div>
              </div>

              <div className="pt-12 flex justify-center">
                <button 
                  onClick={handleSendPigeon} 
                  disabled={!letterText.trim()}
                  className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-[#d6c9b3] disabled:opacity-10 transition-all duration-500"
                >
                  [ Release to the night ]
                </button>
              </div>
            </motion.div>
            
          ) : isSending ? (
            
            <motion.div 
              key="flying"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ x: -80, y: 80, scale: 0.8, opacity: 0 }}
                animate={{ 
                  x: [-80, 0, 120], 
                  y: [80, -20, -120], 
                  scale: [0.8, 1.2, 0.5], 
                  opacity: [0, 0.8, 0] 
                }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="text-7xl drop-shadow-[0_0_25px_rgba(214,201,179,0.3)] grayscale opacity-80"
              >
                🕊️
              </motion.div>
            </motion.div>
            
          ) : (
            
            <motion.div 
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1.5 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-serif text-[#d6c9b3] italic tracking-wide">The pigeon is in the air.</h3>
                <p className="text-xs font-mono opacity-40 tracking-widest uppercase">Awaiting Arrival</p>
              </div>
              
              <div className="w-full max-w-md group cursor-pointer" onClick={() => copyToClipboard(shareableUrl)}>
                <p className="text-[10px] uppercase font-mono tracking-widest opacity-30 mb-3 group-hover:opacity-70 transition-opacity">
                  {copiedUrl === shareableUrl ? "Sealed & Copied" : "Click to Copy Seal"}
                </p>
                <div className="p-4 border border-[#3d362f] rounded-sm bg-[#14110f] shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all group-hover:border-[#5c534a]">
                  <p className="font-mono text-[11px] truncate opacity-60 text-[#b8a99a]">{shareableUrl}</p>
                </div>
              </div>
              
              <button 
                onClick={() => { setShareableUrl(""); setLetterText(""); }} 
                className="text-[10px] uppercase font-mono tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity pt-12"
              >
                Draft Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Faint Memories (History Log with Burn Button) */}
        {dispatchHistory.length > 0 && !shareableUrl && !isSending && (
          <div className="mt-auto pt-24 pb-8 w-full group/history">
            <div className="space-y-6">
              {dispatchHistory.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-baseline gap-2 group/item opacity-20 hover:opacity-100 transition-opacity duration-500 cursor-default">
                  <p className="text-sm font-serif italic truncate flex-1 pr-4">
                    "{item.textPreview}"
                  </p>
                  <div className="flex items-center gap-6">
                    <p className="text-[9px] font-mono tracking-widest whitespace-nowrap">
                      {new Date(item.dateSent).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={() => copyToClipboard(item.url)} 
                      className="text-[9px] uppercase font-mono tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      {copiedUrl === item.url ? "Copied" : "[ Copy ]"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden Burn Button */}
            <div className="mt-12 text-center opacity-0 group-hover/history:opacity-100 transition-opacity duration-700">
              <button 
                onClick={clearHistory}
                className="text-[9px] uppercase font-mono tracking-[0.3em] text-[#7a1c1c] hover:text-[#a82525] transition-colors"
              >
                [ Burn All Records ]
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}