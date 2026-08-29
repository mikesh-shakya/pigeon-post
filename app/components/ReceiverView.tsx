"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, Map, Mail } from "lucide-react";
import confetti from "canvas-confetti";
import { LetterData } from "../types";

export default function ReceiverView({
  receivedData,
}: {
  receivedData: LetterData;
}) {
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(
    null,
  );
  const [isUnsealed, setIsUnsealed] = useState(false);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fallback for older test links that didn't have distance/sentAt
    const start = receivedData.sentAt || receivedData.deliverAt - 2 * 60 * 1000;
    const totalDist = receivedData.distance || 200;
    const totalTime = receivedData.deliverAt - start;

    const interval = setInterval(() => {
      const now = Date.now();

      if (now >= receivedData.deliverAt) {
        setDistanceRemaining(0);
        clearInterval(interval);
      } else {
        const elapsedTime = now - start;
        // Calculate the ratio of time passed (0.0 to 1.0)
        const progressRatio = Math.max(0, Math.min(1, elapsedTime / totalTime));

        // Convert that time ratio into a physical distance
        const covered = totalDist * progressRatio;
        const remaining = totalDist - covered;

        setDistanceRemaining(remaining);
      }
    }, 100); // 100ms tick rate makes the decimals drop smoothly like a digital odometer

    return () => clearInterval(interval);
  }, [receivedData]);

  // --- UPDATED: Quirky event pop-ups logic (Synced with progress) ---
  useEffect(() => {
    let isPopupActive = false;

    const eventInterval = setInterval(() => {
      // 40% chance to trigger a random event every 6 seconds
      if (Math.random() > 0.6 && !isPopupActive) {
        // 1. Calculate the exact progress percentage inside the timer
        const start =
          receivedData.sentAt || receivedData.deliverAt - 2 * 60 * 1000;
        const totalTime = receivedData.deliverAt - start;
        const progress = Math.max(
          0,
          Math.min(1, (Date.now() - start) / totalTime),
        );

        // Stop popping up if it has arrived
        if (progress >= 1) return;

        // 2. Select events that match the current flight stage
        let events: string[] = [];

        if (progress < 0.15) {
          events = [
            "Gaining altitude...",
            "Adjusting course to the wind...",
            "Leaving the familiar behind...",
          ];
        } else if (progress < 0.35) {
          events = [
            "Gliding silently over a sleeping city.",
            "Dodging a distant skyscraper...",
            "Only the moon for company...",
          ];
        } else if (progress < 0.55) {
          events = [
            "Consulting the stars for direction...",
            "A shooting star passes by...",
            "Following the Orion constellation...",
          ];
        } else if (progress < 0.75) {
          events = [
            "Navigating through heavy midnight winds...",
            "Oops, dodging a sudden thunderstorm!",
            "Battling a strong headwind. Speed dropping.",
          ];
        } else if (progress < 0.95) {
          events = [
            "Resting briefly on a distant telephone wire.",
            "Recognizing a winding river below...",
            "The air feels warmer now...",
          ];
        } else {
          events = [
            "Spotting the destination in the distance!",
            "Tucking wings for the final dive...",
            "Almost home...",
          ];
        }

        // 3. Display the synced message
        isPopupActive = true;
        setEventMessage(events[Math.floor(Math.random() * events.length)]);

        setTimeout(() => {
          setEventMessage(null);
          isPopupActive = false;
        }, 4000); // Fades out after 4 seconds
      }
    }, 6000);

    return () => clearInterval(eventInterval);
  }, [receivedData]); // Only depends on the initial payload data

  const breakSeal = () => {
    setIsUnsealed(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#7a1c1c", "#8a6b1c", "#3d3329"],
    });
  };

  const isArrived = distanceRemaining !== null && distanceRemaining <= 0;

  let statusMessage = "A message is crossing the wilderness.";
  if (distanceRemaining !== null && receivedData.distance) {
    const progress = 1 - distanceRemaining / receivedData.distance;

    if (progress < 0.15)
      statusMessage = "The pigeon has just taken flight into the dark.";
    else if (progress < 0.35)
      statusMessage = "Soaring high above sleeping cities.";
    else if (progress < 0.55)
      statusMessage = "Navigating quietly by the stars...";
    else if (progress < 0.75)
      statusMessage = "Struggling through heavy midnight winds.";
    else if (progress < 0.95)
      statusMessage = "Gliding over familiar landscapes.";
    else statusMessage = "Descending through the clouds. Almost there.";
  }

  return (
    <main className="min-h-screen bg-[#0e0c0b] text-[#b8a99a] relative selection:bg-[#3d3329] flex flex-col items-center justify-center p-6 sm:p-12 font-serif overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] z-50 mix-blend-screen"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      ></div>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(45,35,25,0.4)_0%,rgba(14,12,11,1)_70%)] z-0"></div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col min-h-[80vh] justify-center items-center">
        <header className="absolute top-0 flex flex-col items-center opacity-30">
          <Feather className="w-4 h-4 mb-3" strokeWidth={1} />
          <h1 className="text-xs font-mono tracking-[0.3em] uppercase">
            Pigeon Post
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {!isArrived ? (
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
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                  className="text-3xl grayscale opacity-50 mb-8"
                >
                  🕊️
                </motion.div>
                <h2 className="text-xl font-serif text-[#d6c9b3] italic tracking-wide text-balance px-4">
                  {statusMessage}
                </h2>
                <p className="text-xs font-mono opacity-40 tracking-widest uppercase">
                  Dispatched by {receivedData.sender}
                </p>
              </div>

              <div className="pt-8 flex flex-col items-center gap-4">
                {/* --- RESTORED: Seamless Fading Text --- */}
                <div className="h-4 flex justify-center items-center pointer-events-none mb-1 w-full">
                  <AnimatePresence mode="wait">
                    {eventMessage && (
                      <motion.div
                        key="event-msg"
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 1 }}
                      >
                        <span className="text-[9px] font-mono tracking-widest text-[#d6c9b3] uppercase text-center block opacity-60">
                          {eventMessage}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* --- RESTORED: Map Icon and Distance Output --- */}
                <Map className="w-5 h-5 opacity-30" />

                <div className="flex flex-col items-center min-w-[200px]">
                  <span className="font-mono text-3xl tracking-[0.1em] text-[#e8ded1] font-light">
                    {distanceRemaining !== null
                      ? distanceRemaining.toFixed(0)
                      : "..."}{" "}
                    <span className="text-sm opacity-50">km</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-mono opacity-30 mt-3">
                    Distance to Destination
                  </span>
                </div>
              </div>
            </motion.div>
          ) : !isUnsealed ? (
            <motion.div
              key="sealed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
              transition={{ duration: 1.5 }}
              className="text-center space-y-16"
            >
              <div className="space-y-4">
                <Mail
                  className="w-8 h-8 opacity-40 mx-auto mb-6"
                  strokeWidth={1}
                />
                <h2 className="text-2xl font-serif text-[#d6c9b3] italic tracking-wide">
                  A pigeon has landed.
                </h2>
                <p className="text-xs font-mono opacity-40 tracking-widest uppercase">
                  From the desk of {receivedData.sender}
                </p>
              </div>

              <button
                onClick={breakSeal}
                className={`relative group px-12 py-4 rounded-full font-serif italic text-lg transition-all duration-700 outline-none focus:outline-none focus:ring-0 ${receivedData.sealColor} bg-opacity-20 hover:bg-opacity-40 text-[#e8ded1] border border-white/10 z-0`}
              >
                <span className="relative z-10 tracking-widest">
                  Break the Seal
                </span>

                <div
                  className={`absolute inset-0 rounded-full blur-md opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ${receivedData.sealColor} -z-10`}
                ></div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-full"
            >
              <div className="border-b border-[#3d362f] pb-6 mb-12 flex justify-between items-end opacity-40">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em]">
                  Distance Traveled: {receivedData.distance}km
                </span>
                <span className="text-sm font-serif italic">
                  From {receivedData.sender}
                </span>
              </div>

              <p className="text-3xl sm:text-4xl md:text-5xl leading-[1.7] text-[#e8ded1] font-[family-name:var(--font-caveat)] whitespace-pre-wrap">
                {receivedData.text}
              </p>

              <div className="mt-24 pt-12 border-t border-[#3d362f] text-center opacity-30 hover:opacity-100 transition-opacity duration-700">
                <a
                  href="/"
                  className="text-[10px] uppercase font-mono tracking-[0.3em] hover:text-[#d6c9b3] transition-colors"
                >
                  [ Wanna reply? Click here to send a pigeon back! ]
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
