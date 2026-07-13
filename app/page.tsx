"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Church, Clock, CalendarDays, ShieldCheck, ShieldAlert } from "lucide-react";
import { AttendanceCard } from "@/components/public/attendance-card";
import { Badge } from "@/components/ui/badge";

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
      } catch (error) {
        console.error("Failed to fetch status");
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
    <main className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/30 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Header / Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-border flex items-center justify-center mb-6 shadow-sm">
            <Church className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground mb-2">
            Quality Control Unit
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-6">
            Secure geofenced attendance platform. Ensure authenticity, prevent fraud.
          </p>

          {/* Date & Time Card */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-6">
            <div className="flex-1 bg-card/80 backdrop-blur border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{currentDate}</span>
            </div>
            <div className="flex-1 bg-card/80 backdrop-blur border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground tabular-nums">{currentTime}</span>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {isOpen === null ? (
              <Badge variant="secondary" className="px-4 py-2 text-sm">Loading status...</Badge>
            ) : isOpen ? (
              <Badge className="px-4 py-2 text-sm bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Attendance Open
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-4 py-2 text-sm">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Attendance Closed
              </Badge>
            )}
          </motion.div>
        </motion.div>

        {/* Attendance Form */}
        <AttendanceCard isOpen={isOpen} />
      </div>
    </main>
  );
}