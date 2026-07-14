"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, CalendarDays, ShieldCheck, ShieldAlert } from "lucide-react";
import { AttendanceCard } from "@/components/public/attendance-card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setCurrentDate(now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/admin/status");
        if (res.ok) {
          const data = await res.json();
          setIsOpen(data.isOpen);
        }
      } catch {
        // silent fail
      }
    };
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center mb-10"
        >
          {/* Logo in floating glass card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 brand-gradient rounded-3xl blur-2xl opacity-30 animate-breathe" />
            <div className="relative w-28 h-28 rounded-3xl glass-card flex items-center justify-center shadow-2xl animate-breathe overflow-hidden">
              <Image
                src="/soja-logo.jpeg"
                alt="Streams of Joy International"
                width={96}
                height={96}
                className="rounded-2xl object-cover"
                priority
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight mb-3"
          >
            <span className="brand-gradient-text">Quality Control Unit</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground text-sm sm:text-base max-w-md mb-2"
          >
            Secure location-based attendance platform ensuring authenticity, accountability and excellence.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium mb-8"
          >
            Streams of Joy International
          </motion.p>

          {/* Date & Time Glass Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-6"
          >
            <div className="flex-1 glass-card px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{currentDate || "—"}</span>
            </div>
            <div className="flex-1 glass-card px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-foreground tabular-nums">{currentTime || "--:--:--"}</span>
            </div>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.6 }}
          >
            {isOpen === null ? (
              <Badge variant="secondary" className="px-5 py-2.5 text-sm">Loading status...</Badge>
            ) : isOpen ? (
              <motion.div
                animate={{ boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 20px rgba(16,185,129,0.15)", "0 0 0px rgba(16,185,129,0)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Badge variant="success" className="px-5 py-2.5 text-sm">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Attendance Open
                </Badge>
              </motion.div>
            ) : (
              <Badge variant="destructive" className="px-5 py-2.5 text-sm">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Attendance Closed
              </Badge>
            )}
          </motion.div>
        </motion.div>

        {/* Attendance Form */}
        <AttendanceCard isOpen={isOpen} />

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-xs text-muted-foreground/40 mt-12 text-center"
        >
          © {new Date().getFullYear()} Streams of Joy International · Quality Control Unit
        </motion.p>
      </div>
    </main>
  );
}
