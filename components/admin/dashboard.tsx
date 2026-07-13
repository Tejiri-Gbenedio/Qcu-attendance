"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Users, CheckCircle2, XCircle, Lock, Unlock, Settings, LogOut, 
  Search, Loader2, ShieldCheck, ShieldAlert, Clock, MapPin
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardProps {
  onLogout: () => void;
}

interface Settings {
  churchLat: string;
  churchLng: string;
  allowedRadius: string;
  sharedPassword: string;
  adminPassword?: string;
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    onLogout();
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
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter and Pagination Logic
  const approved = records.filter(r => r.status === "Approved");
  const rejected = records.filter(r => r.status === "Rejected");

  const filteredApproved = approved.filter(r => r.memberName.toLowerCase().includes(searchApproved.toLowerCase()));
  const filteredRejected = rejected.filter(r => r.memberName.toLowerCase().includes(searchRejected.toLowerCase()));

  const itemsPerPage = 5;
  const paginatedApproved = filteredApproved.slice((pageApproved - 1) * itemsPerPage, pageApproved * itemsPerPage);
  const paginatedRejected = filteredRejected.slice((pageRejected - 1) * itemsPerPage, pageRejected * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Top Nav */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold font-display">QCU Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Attendance Status</p>
                  {isOpen ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">OPEN</Badge>
                  ) : (
                    <Badge variant="destructive">CLOSED</Badge>
                  )}
                </div>
                <div className={`p-3 rounded-full ${isOpen ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
                  {isOpen ? <Unlock className="w-6 h-6 text-emerald-600" /> : <Lock className="w-6 h-6 text-destructive" />}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Approved Today</p>
                  <h3 className="text-2xl font-bold">{approved.length}</h3>
                </div>
                <div className="p-3 rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rejected Today</p>
                  <h3 className="text-2xl font-bold">{rejected.length}</h3>
                </div>
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Control & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center"><Settings className="w-5 h-5 mr-2" /> Attendance Control</CardTitle>
              <CardDescription>Open or close attendance checking globally.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className={`w-full ${isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-emerald-500 hover:bg-emerald-600"}`}
                onClick={toggleStatus}
                disabled={togglingStatus}
              >
                {togglingStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
                  isOpen ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                {isOpen ? "Close Attendance" : "Open Attendance"}
              </Button>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Geofence & Security Settings</CardTitle>
              <CardDescription>Configure church location, radius, and passwords.</CardDescription>
            </CardHeader>
            <CardContent>
              {settings && (
                <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Church Latitude</Label>
                    <Input id="lat" value={settings.churchLat} onChange={e => setSettings({...settings, churchLat: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Church Longitude</Label>
                    <Input id="lng" value={settings.churchLng} onChange={e => setSettings({...settings, churchLng: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius">Allowed Radius (meters)</Label>
                    <Input id="radius" type="number" value={settings.allowedRadius} onChange={e => setSettings({...settings, allowedRadius: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shared">Shared Password</Label>
                    <Input id="shared" value={settings.sharedPassword} onChange={e => setSettings({...settings, sharedPassword: e.target.value})} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="admin">New Admin Password (leave blank to keep current)</Label>
                    <Input id="admin" type="password" placeholder="••••••••" onChange={e => setSettings({...settings, adminPassword: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={savingSettings}>
                      {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Settings"}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-emerald-600">Approved Attendance</CardTitle>
                <CardDescription>Members inside the geofence.</CardDescription>
              </div>
              <div className="relative w-40">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-9" value={searchApproved} onChange={e => {setSearchApproved(e.target.value); setPageApproved(1)}} />
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
                      <TableCell><Clock className="w-3 h-3 inline mr-1" />{r.time}</TableCell>
                      <TableCell><MapPin className="w-3 h-3 inline mr-1" />{r.distance}m</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Approved</Badge></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">No records found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination page={pageApproved} setPage={setPageApproved} total={filteredApproved.length} itemsPerPage={itemsPerPage} />
            </CardContent>
          </Card>

          {/* Rejected Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-destructive">Rejected Attendance</CardTitle>
                <CardDescription>Members outside geofence or invalid.</CardDescription>
              </div>
              <div className="relative w-40">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-9" value={searchRejected} onChange={e => {setSearchRejected(e.target.value); setPageRejected(1)}} />
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
                      <TableCell><Clock className="w-3 h-3 inline mr-1" />{r.time}</TableCell>
                      <TableCell><MapPin className="w-3 h-3 inline mr-1" />{r.distance}m</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{r.reason}</TableCell>
                      <TableCell><Badge variant="destructive">Rejected</Badge></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No records found.</TableCell></TableRow>
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
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</Button>
    </div>
  );
}