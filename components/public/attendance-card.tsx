"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MapPin, User, KeyRound, CheckCircle2 } from "lucide-react";

interface AttendanceCardProps {
  isOpen: boolean | null;
}

export function AttendanceCard({ isOpen }: AttendanceCardProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      toast.error("Attendance is currently closed.");
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
            body: JSON.stringify({
              name,
              password,
              latitude,
              longitude,
              browser,
              device,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to sign attendance");
          }

          setSuccess(true);
          toast.success("Attendance signed successfully!");
          setName("");
          setPassword("");
        } catch (error: any) {
          toast.error(error.message || "An error occurred.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error("Location access denied. Please enable GPS permissions to sign attendance.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md"
    >
      <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-display">Sign Attendance</CardTitle>
          <CardDescription>Enter your details to confirm your presence.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold mb-1">Attendance Confirmed</h3>
              <p className="text-sm text-muted-foreground mb-6">Your presence has been successfully recorded.</p>
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Sign in for another member
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Member Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading || !isOpen}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Shared Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter shared password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || !isOpen}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
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
                <p className="text-xs text-center text-muted-foreground pt-2">
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