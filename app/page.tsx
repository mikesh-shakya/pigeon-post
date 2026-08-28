"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Feather, Send, Clock, Mail, RotateCcw, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";

const MAX_WEIGHT = 500;
const SEALS = [
  { name: "Ruby", color: "bg-red-800 text-red-100 border-red-950" },
  { name: "Navy", color: "bg-blue-900 text-blue-100 border-blue-950" },
  { name: "Emerald", color: "bg-emerald-800 text-emerald-100 border-emerald-950" },
  { name: "Gold", color: "bg-amber-700 text-amber-100 border-amber-900" },
];

interface LetterData {
  text: string;
  sender: string;
  sealColor: string;
  deliverAt: number;
}

export default function Home() {
  // Sender State
  const [senderName, setSenderName] = useState("");
  const [letterText, setLetterText] = useState("");
  const [sealColor, setSealColor] = useState(SEALS[0].color);
  const [travelMinutes, setTravelMinutes] = useState(2);
  const [shareableUrl, setShareableUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Receiver State
  const [receivedData, setReceivedData] = useState<LetterData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isUnsealed, setIsUnsealed] = useState(false);

  const currentWeight = letterText.length;
  const isHeavy = currentWeight > MAX_WEIGHT * 0.85;

  // On load, check if this is a received pigeon link
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decoded: LetterData = JSON.parse(decodeURIComponent(atob(hash)));
        setReceivedData(decoded);
      } catch (e) {
        console.error("Invalid pigeon dispatch", e);
      }
    }
  }, []);

  // Timer countdown for receiver
  useEffect(() => {
    if (!receivedData) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((receivedData.deliverAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [receivedData]);

  const handleSendPigeon = () => {
    if (!letterText.trim()) return;
    const deliverAt = Date.now() + travelMinutes * 60 * 1000;
    const payload: LetterData = {
      text: letterText,
      sender: senderName || "An Anonymous Friend",
      sealColor,
      deliverAt,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    setShareableUrl(`${window.location.origin}/#${encoded}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const breakSeal = () => {
    setIsUnsealed(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // --- RECEIVER VIEW ---
  if (receivedData) {
    const isArrived = timeLeft !== null && timeLeft <= 0;

    return (
      <main className="min-h-screen bg-[#2c241d] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {!isArrived ? (
            <div className="bg-[#f5ebd7] rounded-xl p-8 border-4 border-[#8c6d48] text-center shadow-2xl overflow-hidden">
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-6xl mb-4">🕊️</motion.div>
              <h2 className="text-2xl font-serif text-[#3e2723] font-bold">Pigeon in Flight</h2>
              <p className="text-[#6d4c41] mt-1">A letter from <b>{receivedData.sender}</b> is approaching.</p>
              <div className="my-6 p-4 bg-[#ebdcc2] rounded-lg border border-[#cfbfa4] inline-flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#5d4037] animate-pulse" />
                <span className="font-mono text-2xl font-bold text-[#3e2723]">
                  {timeLeft !== null ? `${Math.floor(timeLeft / 60)}m ${String(timeLeft % 60).padStart(2, "0")}s` : "Calculating..."}
                </span>
              </div>
            </div>
          ) : !isUnsealed ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="bg-[#eedcba] p-10 rounded-2xl border-4 border-[#9c7a4b] shadow-2xl flex flex-col items-center">
                <Mail className="w-16 h-16 text-[#5d4037] mb-2" />
                <h2 className="text-2xl font-serif text-[#3e2723] font-bold">A Pigeon Has Landed</h2>
                <p className="text-[#795548] mb-6">Dispatched by {receivedData.sender}</p>
                <button onClick={breakSeal} className={`px-6 py-3 rounded-full font-bold shadow-lg border-2 transform hover:scale-105 transition-all ${receivedData.sealColor}`}>
                  Break Wax Seal
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#fcf7ee] p-8 rounded-xl border-4 border-[#8d6e63] shadow-2xl">
              <div className="border-b border-[#d7ccc8] pb-4 mb-4 flex justify-between items-center text-[#8d6e63]">
                <span className="text-xs font-mono uppercase tracking-widest">Carrier Dispatch</span>
                <span className="text-xs">From: {receivedData.sender}</span>
              </div>
              <p className="text-2xl leading-relaxed text-[#3e2723] font-[family-name:var(--font-caveat)] whitespace-pre-wrap">{receivedData.text}</p>
              <div className="mt-8 pt-4 border-t border-[#d7ccc8] text-center">
                <a href="/" className="inline-flex items-center gap-2 text-sm text-[#5d4037] hover:underline font-semibold">
                  <RotateCcw className="w-4 h-4" /> Send your own pigeon
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    );
  }

  // --- SENDER VIEW ---
  return (
    <main className="min-h-screen bg-[#241c16] text-[#f4ede4] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#2e241d] rounded-2xl border-2 border-[#5c4636] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Feather className="w-8 h-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)] tracking-wide text-amber-100">Pigeon Post</h1>
            <p className="text-xs text-stone-400">Craft a slow, thoughtful dispatch</p>
          </div>
        </div>

        {!shareableUrl ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Your Name</label>
              <input type="text" placeholder="e.g. Lord Alexander" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full bg-[#1c1510] border border-[#4d3a2b] rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Letter Parchment</label>
              <textarea rows={6} maxLength={MAX_WEIGHT} placeholder="Write your note here... keep it brief, pigeons are small." value={letterText} onChange={(e) => setLetterText(e.target.value)} className="w-full bg-[#1c1510] border border-[#4d3a2b] rounded-lg p-4 text-stone-200 font-[family-name:var(--font-caveat)] text-xl leading-relaxed focus:outline-none focus:border-amber-500 resize-none" />
              <div className="flex justify-between items-center mt-2 px-1">
                <span className={`text-xs font-mono ${currentWeight === MAX_WEIGHT ? "text-red-500 font-bold" : isHeavy ? "text-orange-400" : "text-stone-500"}`}>
                  Scroll weight: {currentWeight} / {MAX_WEIGHT}
                </span>
                <span className="text-xs italic text-red-400">
                  {currentWeight === MAX_WEIGHT ? "Maximum weight reached!" : isHeavy ? "Your pigeon is struggling..." : ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Wax Seal Color</label>
                <div className="flex gap-2">
                  {SEALS.map((seal) => (
                    <button key={seal.name} onClick={() => setSealColor(seal.color)} className={`w-8 h-8 rounded-full border-2 ${seal.color} ${sealColor === seal.color ? "ring-2 ring-white scale-110" : "opacity-70"}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Flight Delay ({travelMinutes} min)</label>
                <input type="range" min="1" max="15" value={travelMinutes} onChange={(e) => setTravelMinutes(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
            </div>

            <button onClick={handleSendPigeon} className="w-full mt-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50">
              <Send className="w-5 h-5" /> Send Pigeon
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🕊️</div>
            <h3 className="text-xl font-[family-name:var(--font-playfair)] text-amber-100 font-bold">Pigeon Dispatched!</h3>
            <p className="text-sm text-stone-400 mt-1 mb-6">Send this link to your recipient. It will unlock when the bird arrives.</p>
            <div className="flex items-center gap-2 bg-[#1c1510] border border-[#4d3a2b] p-2 rounded-lg">
              <input readOnly value={shareableUrl} className="bg-transparent text-xs text-stone-300 w-full px-2 outline-none" />
              <button onClick={copyToClipboard} className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button onClick={() => setShareableUrl("")} className="mt-6 text-xs text-stone-400 hover:text-stone-200 underline">Write another letter</button>
          </div>
        )}
      </div>
    </main>
  );
}