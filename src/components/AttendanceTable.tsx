import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

export interface AttendanceEntry {
  id: string;
  first_name: string;
  last_name: string;
  other_names?: string | null;
  gender?: string | null;
  phone: string;
  timestamp: string;
}

interface AttendanceTableProps {
  entries: AttendanceEntry[];
  onDeleteEntries?: (ids: string[]) => void;
}

export const AttendanceTable = ({ entries, onDeleteEntries }: AttendanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const itemsPerPage = 10;

  const ADMIN_KEY = (import.meta.env.VITE_ADMIN_KEY as string) || "";

  // Filter entries based on search term
  const filteredEntries = entries.filter((entry) => {
    const fullName = `${entry.first_name} ${entry.other_names || ""} ${entry.last_name}`.toLowerCase();
    const phone = entry.phone.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || phone.includes(search);
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedEntries.map((entry) => entry.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setShowDeleteDialog(true);
    setAdminKey("");
    setKeyError("");
  };

  const handleConfirmDelete = () => {
    if (adminKey === ADMIN_KEY) {
      if (onDeleteEntries) {
        onDeleteEntries(selectedIds);
      }
      setSelectedIds([]);
      setShowDeleteDialog(false);
      setAdminKey("");
      setKeyError("");
    } else {
      setKeyError("Incorrect admin key. Please try again.");
    }
  };

  const isAllSelected = paginatedEntries.length > 0 && selectedIds.length === paginatedEntries.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header with Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl shadow-lg border border-border/50 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Attendance List</h2>
            <span className="text-sm text-muted-foreground">
              ({filteredEntries.length} {filteredEntries.length === 1 ? "person" : "people"})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-background">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    {searchTerm ? (
                      <div className="space-y-2">
                        <p className="text-lg">No results found</p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg">No attendance records yet</p>
                        <p className="text-sm">Check-ins will appear here</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedEntries.map((entry, index) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(entry.id)}
                          onCheckedChange={(checked) => handleSelectOne(entry.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="bg-primary/10 text-primary rounded-full h-10 w-10 flex items-center justify-center font-semibold text-sm">
                          {getInitials(entry.first_name, entry.last_name)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.first_name} {entry.other_names && `${entry.other_names} `}
                        {entry.last_name}
                      </TableCell>
                      <TableCell>{entry.phone}</TableCell>
                      <TableCell>{entry.gender ?? '-'}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEntries.length)} of{" "}
              {filteredEntries.length} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Entries</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedIds.length} {selectedIds.length === 1 ? 'entry' : 'entries'}. 
              Please enter the admin key to confirm this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter admin key"
              value={adminKey}
              onChange={(e) => {
                setAdminKey(e.target.value);
                setKeyError("");
              }}
              className={keyError ? "border-destructive" : ""}
            />
            {keyError && (
              <p className="text-sm text-destructive mt-2">{keyError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setAdminKey("");
              setKeyError("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
