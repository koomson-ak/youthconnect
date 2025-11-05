import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Activity, Home, User, Search } from "lucide-react";
import { AttendanceEntry } from "@/components/AttendanceTable";
import { getAttendances } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "youth_connect_attendance";
const REFRESH_INTERVAL = 5000; // Refresh every 5 seconds

const Display = () => {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [genderFilter, setGenderFilter] = useState<"All" | "Male" | "Female">("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load and refresh data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await getAttendances();
        if (!error && data) {
          const mapped: AttendanceEntry[] = data.map((r: any) => ({
            id: String(r.id),
            first_name: r.first_name,
            last_name: r.last_name,
            other_names: r.other_names,
            phone: r.phone,
            gender: r.gender,
            timestamp: r.timestamp,
          }));
          setEntries(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      } catch (e) {
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setEntries(parsed);
          } catch (err) {
            console.error("Error loading data:", err);
          }
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Get recent entries (last 30 minutes)
  const now = new Date();
  const recentCount = entries.filter((entry) => {
    const entryTime = new Date(entry.timestamp);
    return now.getTime() - entryTime.getTime() < 30 * 60 * 1000;
  }).length;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate gender counts
  const maleCount = entries.filter((e) => e.gender === "Male").length;
  const femaleCount = entries.filter((e) => e.gender === "Female").length;
  const unknownCount = entries.filter((e) => !e.gender).length;

  const COLORS = ["#4F46E5", "#EC4899", "#9CA3AF"]; // primary (male), pink (female), gray (unknown)

  const pieData = [
    ...(maleCount > 0 ? [{ name: "Male", value: maleCount }] : []),
    ...(femaleCount > 0 ? [{ name: "Female", value: femaleCount }] : []),
    ...(unknownCount > 0 ? [{ name: "Unknown", value: unknownCount }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link to="/">
          <Button variant="outline" size="icon" className="rounded-full shadow-lg">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Youth Connect
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground font-light">
            Live Attendance
          </p>
          <div className="flex items-center justify-center gap-4 text-lg text-muted-foreground">
            <span>{formattedDate}</span>
            <span className="text-primary">•</span>
            <span className="font-mono">{formattedTime}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-3xl shadow-xl border-2 border-primary/20 p-8"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Total Present
                </p>
                <motion.p
                  className="text-5xl font-bold text-primary"
                  key={entries.length}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {entries.length}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-3xl shadow-xl border-2 border-blue-500/20 p-8"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Male
                </p>
                <motion.p
                  className="text-5xl font-bold text-blue-600"
                  key={maleCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {maleCount}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-3xl shadow-xl border-2 border-pink-500/20 p-8"
          >
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-4 rounded-2xl">
                <User className="h-10 w-10 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Female
                </p>
                <motion.p
                  className="text-5xl font-bold text-pink-600"
                  key={femaleCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {femaleCount}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-3xl shadow-xl border-2 border-success/20 p-8"
          >
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-4 rounded-2xl">
                <Activity className="h-10 w-10 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  Live Updates
                </p>
                <p className="text-5xl font-bold text-green-500">
                  <motion.span
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ON
                  </motion.span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-3xl shadow-xl border-2 border-border/50 p-6 flex flex-col justify-center"
          >
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Filter</h3>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={genderFilter === 'All' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setGenderFilter('All')}
              >
                All
              </Button>
              <Button 
                variant={genderFilter === 'Male' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setGenderFilter('Male')}
              >
                <User className="mr-2 h-4 w-4" /> Male
              </Button>
              <Button 
                variant={genderFilter === 'Female' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setGenderFilter('Female')}
              >
                <User className="mr-2 h-4 w-4" /> Female
              </Button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-3xl shadow-xl border-2 border-border/50 p-6 flex flex-col justify-center"
          >
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        </div>

        {/* Attendance List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl shadow-xl border-2 border-border/50 p-8"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Recent Check-Ins
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-muted-foreground text-xl"
                >
                  Waiting for first check-in...
                </motion.div>
              ) : (
                entries
                  .filter((e) => {
                    if (genderFilter === 'All') return true;
                    return e.gender === genderFilter;
                  })
                  .filter((e) => {
                    const fullName = `${e.first_name} ${e.other_names || ""} ${e.last_name}`.toLowerCase();
                    const phone = e.phone.toLowerCase();
                    const search = searchTerm.toLowerCase();
                    return fullName.includes(search) || phone.includes(search);
                  })
                  .slice(0, 20)
                  .map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                  >
                    <div className={`rounded-full h-14 w-14 flex items-center justify-center font-bold text-lg border-2 ${
                      entry.gender === "Male"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : entry.gender === "Female"
                        ? "bg-pink-100 text-pink-700 border-pink-200"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      {getInitials(entry.first_name, entry.last_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-semibold truncate">
                        {entry.first_name} {entry.other_names && `${entry.other_names} `}
                        {entry.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-mono text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </p>
                      {entry.gender && (
                        <span className={`text-2xl font-semibold ${
                          entry.gender === "Male" 
                            ? "text-blue-600" 
                            : "text-pink-600"
                        }`}>
                          {entry.gender === "Male" ? "♂" : "♀"}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-muted-foreground text-sm"
        >
          <p>Updates automatically every 5 seconds</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Display;
