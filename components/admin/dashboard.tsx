"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Lock, Unlock, Settings, LogOut,
  Search, Loader2, ShieldCheck, Clock, MapPin, Users,
  TrendingUp, CalendarClock, ChevronLeft, ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardProps {
  onLogout?: () => void;
}

interface Settings {
  churchLat: string;
  churchLng: string;
  allowedRadius: string;
}

interface AttendanceRecord {
  date: string;
  service: string;
  memberName: string;
  time: string;
  latitude: string;
  longitude: string;
  distance: string;
  status: string;
  reason: string;
  browser: string;
  device: string;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchApproved, setSearchApproved] = useState("");
  const [searchRejected, setSearchRejected] = useState("");
  const [pageApproved, setPageApproved] = useState(1);
  const [pageRejected, setPageRejected] = useState(1);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, recordsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/status"),
        fetch("/api/admin/attendance"),
        fetch("/api/admin/settings"),
      ]);

      if (statusRes.ok) setIsOpen((await statusRes.json()).isOpen);
      if (recordsRes.ok) setRecords(await recordsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async () => {
    setTogglingStatus(true);
    try {
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !isOpen }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setIsOpen(!isOpen);
      toast.success(`Attendance is now ${!isOpen ? "OPEN" : "CLOSED"}`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingStatus(false);
      setConfirmToggle(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    if (onLogout) {
      onLogout();
    } else {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings updated successfully.");
      fetchData();
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const approved = records.filter(r => r.status === "Approved");
  const rejected = records.filter(r => r.status === "Rejected");
  const approvalRate = records.length > 0 ? Math.round((approved.length / records.length) * 100) : 0;

  const filteredApproved = approved.filter(r => r.memberName.toLowerCase().includes(searchApproved.toLowerCase()));
  const filteredRejected = rejected.filter(r => r.memberName.toLowerCase().includes(searchRejected.toLowerCase()));

  const itemsPerPage = 6;
  const paginatedApproved = filteredApproved.slice((pageApproved - 1) * itemsPerPage, pageApproved * itemsPerPage);
  const paginatedRejected = filteredRejected.slice((pageRejected - 1) * itemsPerPage, pageRejected * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 brand-gradient rounded-2xl blur-xl opacity-30" />
            <Loader2 className="w-10 h-10 animate-spin text-primary relative" />
          </div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden glass-card flex items-center justify-center">
              <Image src="/soja-logo.jpeg" alt="SoJ" width={28} height={28} className="rounded-lg object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold font-display leading-tight">QCU Dashboard</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Streams of Joy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="glass" className="h-full">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Attendance Status</p>
                  {isOpen ? (
                    <Badge variant="success" className="text-sm px-3 py-1">OPEN</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-sm px-3 py-1">CLOSED</Badge>
                  )}
                </div>
                <div className={`p-3 rounded-2xl ${isOpen ? "bg-success/10" : "bg-destructive/10"}`}>
                  {isOpen ? <Unlock className="w-6 h-6 text-success" /> : <Lock className="w-6 h-6 text-destructive" />}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Approved Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card variant="glass" className="h-full">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Approved</p>
                  <h3 className="text-3xl font-bold font-display">
                    <AnimatedCounter value={approved.length} />
                  </h3>
                </div>
                <div className="p-3 rounded-2xl bg-success/10">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rejected Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card variant="glass" className="h-full">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Rejected</p>
                  <h3 className="text-3xl font-bold font-display">
                    <AnimatedCounter value={rejected.length} />
                  </h3>
                </div>
                <div className="p-3 rounded-2xl bg-destructive/10">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Approval Rate Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card variant="glass" className="h-full">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Approval Rate</p>
                  <h3 className="text-3xl font-bold font-display">
                    <AnimatedCounter value={approvalRate} />%
                  </h3>
                </div>
                <div className="p-3 rounded-2xl bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Control & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Control */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Attendance Control
              </CardTitle>
              <CardDescription>Open or close attendance checking globally.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {confirmToggle ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-muted-foreground text-center">
                      Are you sure you want to {isOpen ? "close" : "open"} attendance?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant={isOpen ? "destructive" : "gradient"}
                        className="flex-1"
                        onClick={toggleStatus}
                        disabled={togglingStatus}
                      >
                        {togglingStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Confirm
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setConfirmToggle(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button
                      variant={isOpen ? "destructive" : "gradient"}
                      className="w-full h-12 text-base font-semibold"
                      onClick={() => setConfirmToggle(true)}
                    >
                      {isOpen ? <Lock className="w-5 h-5 mr-2" /> : <Unlock className="w-5 h-5 mr-2" />}
                      {isOpen ? "Close Attendance" : "Open Attendance"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Visual status indicator */}
              <div className="mt-4 flex items-center justify-center">
                <div className={`relative w-3 h-3 rounded-full ${isOpen ? "bg-success" : "bg-destructive"}`}>
                  {isOpen && (
                    <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                  )}
                </div>
                <span className="ml-2 text-xs text-muted-foreground">
                  {isOpen ? "Live — accepting check-ins" : "Inactive — no check-ins accepted"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Geofence Configuration
              </CardTitle>
              <CardDescription>Configure church location coordinates and allowed radius.</CardDescription>
            </CardHeader>
            <CardContent>
              {settings && (
                <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat" className="text-xs uppercase tracking-wide text-muted-foreground">Church Latitude</Label>
                    <Input
                      id="lat"
                      value={settings.churchLat}
                      onChange={e => setSettings({ ...settings, churchLat: e.target.value })}
                      required
                      placeholder="e.g. 6.5244"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng" className="text-xs uppercase tracking-wide text-muted-foreground">Church Longitude</Label>
                    <Input
                      id="lng"
                      value={settings.churchLng}
                      onChange={e => setSettings({ ...settings, churchLng: e.target.value })}
                      required
                      placeholder="e.g. 3.3792"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius" className="text-xs uppercase tracking-wide text-muted-foreground">Allowed Radius (meters)</Label>
                    <Input
                      id="radius"
                      type="number"
                      value={settings.allowedRadius}
                      onChange={e => setSettings({ ...settings, allowedRadius: e.target.value })}
                      required
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <Button type="submit" variant="gradient" disabled={savingSettings} className="h-12">
                      {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Settings
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Approved Table */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Approved Attendance
                </CardTitle>
                <CardDescription className="mt-1">Members inside the geofence</CardDescription>
              </div>
              <div className="relative w-36 sm:w-40">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 text-xs"
                  value={searchApproved}
                  onChange={e => { setSearchApproved(e.target.value); setPageApproved(1); }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApproved.length > 0 ? paginatedApproved.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.memberName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />{r.time}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />{r.distance}m
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-xs">Approved</Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <EmptyState
                          icon={Users}
                          title="No approved attendance yet"
                          description="As members check in, approved records will appear here."
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination page={pageApproved} setPage={setPageApproved} total={filteredApproved.length} itemsPerPage={itemsPerPage} />
            </CardContent>
          </Card>

          {/* Rejected Table */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-4 h-4" />
                  Rejected Attendance
                </CardTitle>
                <CardDescription className="mt-1">Members outside geofence or invalid</CardDescription>
              </div>
              <div className="relative w-36 sm:w-40">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9 text-xs"
                  value={searchRejected}
                  onChange={e => { setSearchRejected(e.target.value); setPageRejected(1); }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRejected.length > 0 ? paginatedRejected.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.memberName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />{r.time}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />{r.distance}m
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{r.reason}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">Rejected</Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <EmptyState
                          icon={XCircle}
                          title="No rejected attendance"
                          description="No out-of-bounds check-in attempts have been recorded."
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination page={pageRejected} setPage={setPageRejected} total={filteredRejected.length} itemsPerPage={itemsPerPage} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Pagination({ page, setPage, total, itemsPerPage }: { page: number, setPage: (p: number) => void, total: number, itemsPerPage: number }) {
  const totalPages = Math.ceil(total / itemsPerPage);
  if (totalPages === 0) return null;
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-xs text-muted-foreground">
        {total} {total === 1 ? "record" : "records"}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[60px] text-center">Page {page} of {totalPages}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
