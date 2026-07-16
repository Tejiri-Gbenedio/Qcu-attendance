"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA support.
 * Members can add the app to their home screen.
 */
export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed — likely offline or unsupported.
        // The app still works, just without offline caching.
      });
    }
  }, []);

  return null;
}
