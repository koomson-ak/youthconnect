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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-3 sm:p-6">
      {/* Back Button */}
      <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50">
        <Link to="/">
          <Button variant="outline" size="icon" className="rounded-full shadow-lg h-9 w-9 sm:h-10 sm:w-10">
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1 sm:space-y-2"
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
            Youth Connect
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl text-muted-foreground font-light">
            Live Attendance
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-4 text-xs sm:text-lg text-muted-foreground">
            <span>{formattedDate}</span>
            <span className="text-primary hidden sm:inline">•</span>
            <span className="font-mono">{formattedTime}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-primary/20 p-3 sm:p-4 md:p-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-primary/10 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-10 md:w-10 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase tracking-wide">
                  Total Present
                </p>
                <motion.p
                  className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary"
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
            className="bg-card rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-primary/20 p-3 sm:p-4 md:p-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-primary/10 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-10 md:w-10 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase tracking-wide">
                  Male
                </p>
                <motion.p
                  className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary"
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
            className="bg-card rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-pink-500/20 p-3 sm:p-4 md:p-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-pink-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-10 md:w-10 text-pink-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase tracking-wide">
                  Female
                </p>
                <motion.p
                  className="text-2xl sm:text-3xl md:text-5xl font-bold text-pink-600"
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
            className="bg-card rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-success/20 p-3 sm:p-4 md:p-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-success/10 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl flex-shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 md:h-10 md:w-10 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase tracking-wide">
                  Live Updates
                </p>
                <p className="text-2xl sm:text-3xl md:text-5xl font-bold text-green-500">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-border/50 p-3 sm:p-4 md:p-6 flex flex-col justify-center"
          >
            <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground uppercase">Filter</h3>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <Button 
                variant={genderFilter === 'All' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setGenderFilter('All')}
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                All
              </Button>
              <Button 
                variant={genderFilter === 'Male' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setGenderFilter('Male')}
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                <User className="mr-1 h-4 w-4 sm:h-5 sm:w-5" /> Male
              </Button>
              <Button 
                variant={genderFilter === 'Female' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setGenderFilter('Female')}
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                <User className="mr-1 h-4 w-4 sm:h-5 sm:w-5" /> Female
              </Button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-border/50 p-3 sm:p-4 md:p-6 flex flex-col justify-center"
          >
            <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground uppercase">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>
          </motion.div>
        </div>

        {/* Attendance List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-border/50 p-4 sm:p-6 md:p-8"
        >
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
            Recent Check-Ins
          </h2>

          <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 sm:py-16 text-muted-foreground text-sm sm:text-lg"
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
                    className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-3 md:p-4 rounded-lg sm:rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                  >
                    <div className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center font-bold text-sm sm:text-base md:text-lg border-2 flex-shrink-0 ${
                      entry.gender === "Male"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : entry.gender === "Female"
                        ? "bg-pink-100 text-pink-700 border-pink-200"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      {getInitials(entry.first_name, entry.last_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base md:text-lg font-semibold break-words line-clamp-2">
                        {entry.first_name} {entry.other_names && `${entry.other_names} `}
                        {entry.last_name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{entry.phone}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
                      <p className="text-xs sm:text-sm md:text-lg font-mono text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </p>
                      {entry.gender && (
                        <span className={`text-2xl sm:text-3xl font-semibold ${
                          entry.gender === "Male" 
                            ? "text-primary" 
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
          className="text-center text-muted-foreground text-xs sm:text-sm"
        >
          <p>Updates automatically every 5 seconds</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Display;
