import { motion } from "framer-motion";
import { Users, TrendingUp, Clock, UserCheck } from "lucide-react";
import { AttendanceEntry } from "./AttendanceTable";
import { useEffect, useState } from "react";

interface StatsDashboardProps {
  entries: AttendanceEntry[];
}

export const StatsDashboard = ({ entries }: StatsDashboardProps) => {
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
  const recentCheckIns = entries.slice(0, 5);

  // Calculate time-based stats
  const now = new Date();
  const last30Min = entries.filter((entry) => {
    const entryTime = new Date(entry.timestamp);
    return now.getTime() - entryTime.getTime() < 30 * 60 * 1000;
  }).length;

  const stats = [
    {
      label: "Total Attendees",
      value: displayCount,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Last 30 Minutes",
      value: last30Min,
      icon: Clock,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Recent Activity",
      value: recentCheckIns.length,
      icon: TrendingUp,
      color: "text-accent-foreground",
      bgColor: "bg-accent",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-2 md:p-3 rounded-xl`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </motion.div>
        ))}
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
            <UserCheck className="h-5 w-5 text-primary" />
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
                  <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                    {getInitials(entry.first_name, entry.last_name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.first_name} {entry.other_names && `${entry.other_names} `}
                      {entry.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.phone}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
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
