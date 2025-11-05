import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Trash2 } from "lucide-react";
import { AttendanceEntry } from "./AttendanceTable";

interface AttendanceControlsProps {
  entries: AttendanceEntry[];
  onClearAll: (key: string) => Promise<boolean>;
}

// Admin key is provided via Vite env during development/build.
// WARNING: Any VITE_ env is exposed to client-side code. For true secrecy, move this check to a server endpoint.
const ADMIN_KEY = (import.meta.env.VITE_ADMIN_KEY as string) || "";

export const AttendanceControls = ({ entries, onClearAll }: AttendanceControlsProps) => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  const handleExportCSV = () => {
    if (entries.length === 0) return;

    const csvContent = [
      ["First Name", "Other Names", "Last Name", "Phone Number"],
      ...entries.map((entry) => [
        entry.first_name,
        entry.other_names || "",
        entry.last_name,
        entry.phone,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split("T")[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `youth_connect_attendance_${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearClick = () => {
    setShowClearDialog(true);
    setAdminKey("");
    setKeyError("");
  };

  const handleConfirmClear = async () => {
    if (adminKey === ADMIN_KEY) {
      setIsClearing(true);
      try {
        const success = await onClearAll(adminKey);
        if (success) {
          setShowClearDialog(false);
          setAdminKey("");
          setKeyError("");
        }
      } finally {
        setIsClearing(false);
      }
    } else {
      setKeyError("Incorrect admin key. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto flex gap-3 justify-end"
      >
        <Button
          onClick={handleExportCSV}
          variant="outline"
          disabled={entries.length === 0}
          className="transition-all duration-250 ease-in-out gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          onClick={handleClearClick}
          variant="destructive"
          className="transition-all duration-250 ease-in-out bg-destructive hover:bg-destructive/90 gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Entries
        </Button>
      </motion.div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Verification Required</DialogTitle>
            <DialogDescription>
              Please enter the admin key to proceed with clearing all attendance records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-key">Admin Key</Label>
              <Input
                id="admin-key"
                type="password"
                value={adminKey}
                onChange={(e) => {
                  setAdminKey(e.target.value);
                  setKeyError("");
                }}
                placeholder="Enter admin key"
                onKeyDown={(e) => e.key === "Enter" && handleConfirmClear()}
              />
              {keyError && (
                <p className="text-sm text-destructive">{keyError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmClear}
              disabled={isClearing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Clear All Records"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
