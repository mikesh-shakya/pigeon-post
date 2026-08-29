"use client";

import React, { useState, useEffect } from "react";
import SenderView from "./components/SenderView";
import ReceiverView from "./components/ReceiverView";
import { LetterData } from "./types";
import LZString from "lz-string";

export default function Home() {
  const [receivedData, setReceivedData] = useState<LetterData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // On load, check if this is a received pigeon link
  useEffect(() => {
    setIsMounted(true);
    const hash = window.location.hash.slice(1);

    if (hash) {
      try {
        const decoded: LetterData = JSON.parse(LZString.decompressFromEncodedURIComponent(hash));
        setReceivedData(decoded);
      } catch (e) {
        console.error("Invalid pigeon dispatch", e);
      }
    }
  }, []);

  // Prevent hydration mismatch by returning nothing until the client mounts
  if (!isMounted) return null;

  // Act as a traffic director:
  // If we found valid data in the URL, show the receiver. Otherwise, show the sender!
  if (receivedData) {
    return <ReceiverView receivedData={receivedData} />;
  }

  return <SenderView />;
}
