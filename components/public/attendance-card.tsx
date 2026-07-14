"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MapPin, User, KeyRound, CheckCircle2, Sparkles } from "lucide-react";

interface AttendanceCardProps {
  isOpen: boolean | null;
}

export function AttendanceCard({ isOpen }: AttendanceCardProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ name: string; time: string } | null>(null);

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let device = "Desktop";

    if (userAgent.match(/chrome|chromium|crios/i)) browser = "Chrome";
    else if (userAgent.match(/firefox|fxios/i)) browser = "Firefox";
    else if (userAgent.match(/safari/i)) browser = "Safari";
    else if (userAgent.match(/edg/i)) browser = "Edge";

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      device = "Mobile";
    } else if (/Mac|Windows|Linux/i.test(userAgent)) {
      device = "Desktop";
    }

    return { browser, device };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOpen) {
      toast.error("Attendance is currently closed.", {
        description: "Please wait for an administrator to open attendance.",
      });
      return;
    }

    setLoading(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const { browser, device } = getBrowserInfo();

        try {
          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password, latitude, longitude, browser, device }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to sign attendance");
          }

          const now = new Date();
          setSuccessData({
            name: name,
            time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
          setSuccess(true);
          toast.success("Attendance signed successfully!");
          setName("");
          setPassword("");
        } catch (error: any) {
          toast.error(error.message || "An error occurred.", {
            description: "Please try again or contact an administrator.",
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error("Location access denied.", {
          description: "Please enable GPS permissions to sign attendance.",
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <Card variant="gradient-border" className="shadow-2xl shadow-black/[0.08]">
        <CardHeader>
          <CardTitle className="text-xl font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Sign Attendance
          </CardTitle>
          <CardDescription>Enter your details to confirm your presence.</CardDescription>
        </CardHeader>
        <CardContent>
          {success && successData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5"
              >
                <CheckCircle2 className="w-12 h-12 text-success" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-lg font-semibold mb-1">Attendance Confirmed</h3>
              <p className="text-sm text-muted-foreground mb-1">{successData.name}</p>
              <p className="text-xs text-muted-foreground mb-6">Recorded at {successData.time}</p>
              <Button variant="outline" size="sm" onClick={() => { setSuccess(false); setSuccessData(null); }}>
                Sign in for another member
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">Member Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading || !isOpen}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">Shared Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter shared password"
                    className="pl-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || !isOpen}
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="gradient"
                className="w-full h-12 text-base font-semibold"
                disabled={loading || !isOpen}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Sign Attendance
                  </>
                )}
              </Button>
              {!isOpen && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  Attendance checking is currently closed by the administrator.
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
