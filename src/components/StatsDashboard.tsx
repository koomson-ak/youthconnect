import { motion } from "framer-motion";
import { Users, TrendingUp, Clock, User, Download, PieChart as PieChartIcon } from "lucide-react";
import { AttendanceEntry } from "./AttendanceTable";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface StatsDashboardProps {
  entries: AttendanceEntry[]; // full dataset
  filteredEntries: AttendanceEntry[]; // entries after filter
  genderFilter: "All" | "Male" | "Female";
  setGenderFilter: (f: "All" | "Male" | "Female") => void;
}

const COLORS = ["#4F46E5", "#EC4899", "#9CA3AF"]; // primary (male), pink (female), gray (unknown)

export const StatsDashboard = ({ entries, filteredEntries, genderFilter, setGenderFilter }: StatsDashboardProps) => {
  const [displayCount, setDisplayCount] = useState(0);
  const totalCount = entries.length;

  // Animated counter
  useEffect(() => {
    if (displayCount < totalCount) {
      const timer = setTimeout(() => {
        setDisplayCount(displayCount + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [displayCount, totalCount]);

  useEffect(() => {
    setDisplayCount(0);
  }, [totalCount]);

  // Get recent check-ins (last 5)
  const recentCheckIns = filteredEntries.slice(0, 5);

  // Calculate time-based stats
  const now = new Date();
  const last30Min = filteredEntries.filter((entry) => {
    const entryTime = new Date(entry.timestamp);
    return now.getTime() - entryTime.getTime() < 30 * 60 * 1000;
  }).length;

  const maleCount = entries.filter((e) => e.gender === "Male").length;
  const femaleCount = entries.filter((e) => e.gender === "Female").length;
  const unknownCount = entries.filter((e) => !e.gender).length;

  const pieData = useMemo(() => {
    const data = [] as { name: string; value: number }[];
    if (maleCount > 0) data.push({ name: "Male", value: maleCount });
    if (femaleCount > 0) data.push({ name: "Female", value: femaleCount });
    if (unknownCount > 0) data.push({ name: "Unknown", value: unknownCount });
    return data;
  }, [maleCount, femaleCount, unknownCount]);

  // CSV export for filtered entries
  const handleExportCSV = () => {
    const rows = filteredEntries.map((r) => ({
      id: r.id,
      first_name: r.first_name,
      other_names: r.other_names || "",
      last_name: r.last_name,
      phone: r.phone,
      gender: r.gender || "",
      timestamp: r.timestamp,
    }));

    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [header]
      .concat(rows.map((row) => Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Attendees",
      value: displayCount,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Male",
      value: maleCount,
      icon: User,
      color: "text-primary",
      bgColor: "bg-primary/10",
      sub: totalCount ? `${Math.round((maleCount / totalCount) * 100)}%` : "0%",
    },
    {
      label: "Female",
      value: femaleCount,
      icon: User,
      color: "text-pink-500",
      bgColor: "bg-pink-100",
      sub: totalCount ? `${Math.round((femaleCount / totalCount) * 100)}%` : "0%",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top controls: filter + export */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant={genderFilter === 'All' ? 'default' : 'outline'} size="sm" onClick={() => setGenderFilter('All')}>All</Button>
          <Button variant={genderFilter === 'Male' ? 'default' : 'outline'} size="sm" onClick={() => setGenderFilter('Male')}>
            <User className="mr-2 h-4 w-4" /> Male
          </Button>
          <Button variant={genderFilter === 'Female' ? 'default' : 'outline'} size="sm" onClick={() => setGenderFilter('Female')}>
            <User className="mr-2 h-4 w-4" /> Female
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-card rounded-2xl shadow-lg border border-border/50 p-4 md:p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
                <motion.p
                  className="text-3xl md:text-4xl font-bold"
                  key={stat.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {stat.value}
                </motion.p>
                {stat.sub && <p className="text-sm text-muted-foreground mt-1">{stat.sub}</p>}
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-2 md:p-3 rounded-xl`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Donut chart occupies one grid cell */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card rounded-2xl shadow-lg border border-border/50 p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Gender Distribution</h3>
            <div className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 p-2 rounded-xl">
              <PieChartIcon className="h-5 w-5" />
            </div>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                  onClick={(data) => {
                    const name = (data as any).name as string | undefined;
                    if (!name) return;
                    if (name === "Male") setGenderFilter("Male");
                    else if (name === "Female") setGenderFilter("Female");
                    else setGenderFilter("All");
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} people`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Check-ins Feed */}
      {recentCheckIns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card rounded-2xl shadow-lg border border-border/50 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Check-ins</h3>
          </div>
          <div className="space-y-3">
            {recentCheckIns.map((entry, index) => {
              const timeAgo = getTimeAgo(new Date(entry.timestamp));
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                      {getInitials(entry.first_name, entry.last_name)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.first_name} {entry.other_names && `${entry.other_names} `}
                      {entry.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    {entry.gender && (
                      <span className={`text-lg font-semibold ${
                        entry.gender === "Male" 
                          ? "text-blue-600" 
                          : "text-pink-600"
                      }`}>
                        {entry.gender === "Male" ? "♂" : "♀"}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
