import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MultiStepForm } from "@/components/MultiStepForm";
import { AttendanceTable, AttendanceEntry } from "@/components/AttendanceTable";
import { AttendanceControls } from "@/components/AttendanceControls";
import { HeroSection } from "@/components/HeroSection";
import { StatsDashboard } from "@/components/StatsDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QRCodeSection } from "@/components/QRCodeSection";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { getAttendances, addAttendance } from "@/lib/supabase";

const STORAGE_KEY = "youth_connect_attendance";

const Index = () => {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load from Supabase on mount. If Supabase fails, fall back to localStorage.
    let mounted = true;

    (async () => {
      try {
        const { data, error } = await getAttendances();
        if (error) throw error;
        if (mounted && data) {
          // supabase returns rows with timestamp field; map to AttendanceEntry shape
          const mapped: AttendanceEntry[] = data.map((r: any) => ({
            id: String(r.id),
            first_name: r.first_name,
            last_name: r.last_name,
            other_names: r.other_names,
            gender: r.gender,
            phone: r.phone,
            timestamp: r.timestamp,
          }));
          setEntries(mapped);
          // also persist locally so a reload without network still shows data
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (mounted) setEntries(parsed);
          } catch (err) {
            console.error("Error loading attendance data:", err);
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (first: string, last: string, other: string, phone: string, gender?: string): Promise<boolean> => {
    // attempt to insert into Supabase; handle unique-phone errors from the DB
    try {
      const { data, error } = await addAttendance({ first_name: first, last_name: last, other_names: other, phone, gender });
      if (error) {
        // Postgres unique_violation is code 23505
        const isDuplicate = String(error?.code || '').includes('23505') || String(error?.message || '').toLowerCase().includes('duplicate');
        if (isDuplicate) {
          toast({
            title: 'Already Registered',
            description: 'This phone number has already been registered for today.',
            variant: 'destructive',
          });
          return false;
        }

        toast({
          title: 'Error',
          description: error.message || 'Failed to record attendance',
          variant: 'destructive',
        });
        return false;
      }

      // success: data is an array with the inserted row
      const inserted = Array.isArray(data) && data[0] ? data[0] : null;
      if (inserted) {
        const newEntry: AttendanceEntry = {
          id: String(inserted.id),
          first_name: inserted.first_name,
          last_name: inserted.last_name,
          other_names: inserted.other_names,
          gender: inserted.gender,
          phone: inserted.phone,
          timestamp: inserted.timestamp,
        };

        const newEntries = [newEntry, ...entries];
        setEntries(newEntries);
        // update local cache too
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));

        toast({
          title: 'Success',
          description: 'Your attendance has been recorded.',
          className: 'bg-[hsl(160,60%,55%)] text-white border-0',
        });

        return true;
      }

      toast({ title: 'Error', description: 'No data returned from server', variant: 'destructive' });
      return false;
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to record attendance', variant: 'destructive' });
      return false;
    }
  };

  const handleClearAll = (key: string): boolean => {
    if (key === "KOBINA2025ADMIN") {
      setEntries([]);
      toast({
        title: "Records Cleared",
        description: "All attendance records have been cleared.",
        className: "bg-primary text-primary-foreground",
      });
      return true;
    }
    return false;
  };

  const handleDeleteEntries = (ids: string[]) => {
    const updatedEntries = entries.filter(entry => !ids.includes(entry.id));
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    
    toast({
      title: "Entries Deleted",
      description: `${ids.length} ${ids.length === 1 ? 'entry' : 'entries'} deleted successfully.`,
      className: "bg-primary text-primary-foreground",
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <WelcomeAnimation />
      <ThemeToggle />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto space-y-12"
          >
            {/* Hero Section */}
            <HeroSection attendanceCount={entries.length} />

            {/* Multi-Step Form */}
            <MultiStepForm onSubmit={handleSubmit} />

            {/* QR Code Button */}
            <div className="flex justify-center">
              <QRCodeSection />
            </div>

            {/* Stats Dashboard */}
            <StatsDashboard
              entries={entries}
              filteredEntries={entries.filter((e) => {
                if (genderFilter === 'All') return true;
                return e.gender === genderFilter;
              })}
              genderFilter={genderFilter}
              setGenderFilter={setGenderFilter}
            />

            {/* Controls and Table */}
            <div className="space-y-6">
              <AttendanceControls entries={entries} onClearAll={handleClearAll} />
              <AttendanceTable entries={entries.filter((e) => {
                if (genderFilter === 'All') return true;
                return e.gender === genderFilter;
              })} onDeleteEntries={handleDeleteEntries} />
            </div>

            {/* Footer */}
            <Footer />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Index;
