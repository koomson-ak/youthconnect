import { motion } from "framer-motion";
import { Users, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  attendanceCount: number;
}

export const HeroSection = ({ attendanceCount }: HeroSectionProps) => {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl mb-8 sm:mb-12 mx-0">
      {/* Animated background pattern - hidden on mobile for performance */}
      <div className="absolute inset-0 opacity-10 hidden sm:block">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative px-4 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Title */}
          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-4 text-center leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Youth Connect
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-center mb-6 sm:mb-8 opacity-90 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {greeting}! Welcome to today's gathering
          </motion.p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-white/20 p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm opacity-80">Present Today</p>
                  <motion.p
                    className="text-xl sm:text-2xl md:text-3xl font-bold"
                    key={attendanceCount}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {attendanceCount}
                  </motion.p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20 sm:col-span-2 lg:col-span-1 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
                <div className="bg-white/20 p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm opacity-80">Date</p>
                  <p className="text-xs sm:text-sm md:text-lg font-semibold">{formattedDate}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20 sm:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-white/20 p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm opacity-80">Current Time</p>
                  <p className="text-xs sm:text-sm md:text-lg font-semibold">{formattedTime}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
