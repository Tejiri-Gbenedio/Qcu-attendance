"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2, MapPin, User, KeyRound, CheckCircle2, Sparkles,
  Satellite, Navigation, AlertCircle, Check, Church,
} from "lucide-react";

const SERVICES = ["Sunday", "Thursday", "Other"] as const;
type ServiceType = typeof SERVICES[number];

interface AttendanceCardProps {
  isOpen: boolean | null;
}

interface GpsPhase {
  label: string;
  icon: typeof Satellite;
}

const GPS_PHASES: GpsPhase[] = [
  { label: "Acquiring GPS signal...", icon: Satellite },
  { label: "Verifying location...", icon: Navigation },
];

export function AttendanceCard({ isOpen }: AttendanceCardProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [service, setService] = useState<ServiceType>("Sunday");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ name: string; time: string } | null>(null);
  const [gpsPhase, setGpsPhase] = useState(0);

  /* ---------- Autocomplete state ---------- */
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [nameTouched, setNameTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---------- Inline validation ---------- */
  const nameError = nameTouched && name.trim().length > 0 && whitelist.length > 0
    ? (!isNameValid(name) ? "Name not found in the whitelist. Check spelling or try a different combination of your names." : null)
    : null;

  const passwordError = nameTouched && password.length > 0 && password.length < 3
    ? "Password seems too short."
    : null;

  function isNameValid(value: string): boolean {
    const inputWords = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (inputWords.length === 0) return false;
    return whitelist.some((wn) => {
      const ww = wn.split(/\s+/);
      return inputWords.every((w) => ww.includes(w));
    });
  }

  /* ---------- Fetch whitelist ---------- */
  useEffect(() => {
    const fetchWhitelist = async () => {
      try {
        const res = await fetch("/api/whitelist");
        if (res.ok) {
          const data = await res.json();
          setWhitelist(data.names);
        }
      } catch {
        // silent
      }
    };
    fetchWhitelist();
  }, []);

  /* ---------- Autocomplete filtering ---------- */
  const updateSuggestions = useCallback((value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const inputWords = trimmed.split(/\s+/).filter(Boolean);
    const matches = whitelist.filter((wn) => {
      const ww = wn.split(/\s+/);
      return inputWords.every((w) => ww.includes(w));
    });
    setSuggestions(matches.slice(0, 8));
    setShowDropdown(matches.length > 0 && matches[0] !== trimmed);
    setActiveIndex(-1);
  }, [whitelist]);

  useEffect(() => {
    updateSuggestions(name);
  }, [name, updateSuggestions]);

  /* ---------- Autocomplete keyboard nav ---------- */
  const selectSuggestion = (suggestion: string) => {
    setName(suggestion);
    setShowDropdown(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- Form submission ---------- */
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
    setNameTouched(true);

    if (!isOpen) {
      toast.error("Attendance is currently closed.", {
        description: "Please wait for an administrator to open attendance.",
      });
      return;
    }

    if (nameError) {
      toast.error("Name not found in the whitelist.", {
        description: "Check your spelling or try a different combination of your names.",
      });
      return;
    }

    setLoading(true);
    setGpsPhase(0);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setGpsPhase(1);
        const { latitude, longitude } = position.coords;
        const { browser, device } = getBrowserInfo();

        // Small delay so the user can see phase 2
        await new Promise((r) => setTimeout(r, 400));

        try {
          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password, service, latitude, longitude, browser, device }),
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
          setNameTouched(false);
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

  const CurrentGpsIcon = GPS_PHASES[gpsPhase].icon;

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
              {/* Service selector */}
              <div className="space-y-2">
                <Label htmlFor="service" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Service
                </Label>
                <div className="relative">
                  <Church className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50 z-10" />
                  <select
                    id="service"
                    value={service}
                    onChange={(e) => setService(e.target.value as ServiceType)}
                    disabled={loading || !isOpen}
                    className="flex h-12 w-full rounded-xl border border-border bg-background/50 backdrop-blur px-4 py-2 pl-11 text-sm ring-offset-background transition-all duration-200 appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>{s === "Sunday" ? "Sunday Service" : s === "Thursday" ? "Thursday Service" : "Other Service"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name field with autocomplete */}
              <div className="space-y-2 relative">
                <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Member Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50 z-10" />
                  <Input
                    ref={inputRef}
                    id="name"
                    placeholder="e.g. John or John Michael"
                    className={`pl-11 ${nameError ? "border-destructive/50 focus-visible:ring-destructive/40 focus-visible:border-destructive/40" : ""}`}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameTouched(true); }}
                    onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                    onKeyDown={handleKeyDown}
                    required
                    disabled={loading || !isOpen}
                    autoComplete="off"
                  />
                  {nameTouched && name.trim().length > 0 && !loading && (
                    <div className="absolute right-4 top-4 z-10">
                      {isNameValid(name) ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive/60" />
                      )}
                    </div>
                  )}
                </div>

                {/* Inline name error */}
                <AnimatePresence>
                  {nameError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      className="text-xs text-destructive/80 flex items-center gap-1.5 pt-0.5"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {nameError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Autocomplete dropdown */}
                <AnimatePresence>
                  {showDropdown && suggestions.length > 0 && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl shadow-black/[0.08] overflow-hidden"
                    >
                      <div className="max-h-48 overflow-y-auto scrollbar-thin py-1">
                        {suggestions.map((suggestion, i) => (
                          <button
                            key={suggestion}
                            type="button"
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 flex items-center gap-3 ${
                              i === activeIndex
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-primary/5"
                            }`}
                            onMouseDown={(e) => { e.preventDefault(); selectSuggestion(suggestion); }}
                            onMouseEnter={() => setActiveIndex(i)}
                          >
                            <User className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Shared Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter shared password"
                    className={`pl-11 ${passwordError ? "border-destructive/50 focus-visible:ring-destructive/40 focus-visible:border-destructive/40" : ""}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setNameTouched(true); }}
                    required
                    disabled={loading || !isOpen}
                  />
                </div>
                <AnimatePresence>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      className="text-xs text-destructive/80 flex items-center gap-1.5 pt-0.5"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                variant="gradient"
                className="w-full h-12 text-base font-semibold"
                disabled={loading || !isOpen}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <CurrentGpsIcon className="mr-1 h-4 w-4" />
                    {GPS_PHASES[gpsPhase].label}
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