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
  onDeleteEntries?: (ids: string[]) => Promise<void>;
}

export const AttendanceTable = ({ entries, onDeleteEntries }: AttendanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleConfirmDelete = async () => {
    if (adminKey === ADMIN_KEY) {
      setIsDeleting(true);
      try {
        if (onDeleteEntries) {
          await onDeleteEntries(selectedIds);
        }
        setSelectedIds([]);
        setShowDeleteDialog(false);
        setAdminKey("");
        setKeyError("");
      } finally {
        setIsDeleting(false);
      }
    } else {
      setKeyError("Incorrect admin key. Please try again.");
    }
  };

  const isAllSelected = paginatedEntries.length > 0 && selectedIds.length === paginatedEntries.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-4 px-0 sm:px-2">
      {/* Header with Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-border/50 p-4 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold">Attendance List</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              ({filteredEntries.length})
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9 sm:h-10 text-sm"
              />
            </div>
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Delete ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table - Responsive Design */}
        <div className="border rounded-lg sm:rounded-xl overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-8 sm:w-10 md:w-12 px-1 sm:px-2">
                    <div className="scale-75 sm:scale-100 origin-left">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-10 sm:w-12 md:w-16"></TableHead>
                  <TableHead className="text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Gender</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 sm:py-12 text-sm">
                      {searchTerm ? (
                        <div className="space-y-1">
                          <p className="text-base">No results found</p>
                          <p className="text-xs">Try a different search term</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-base">No attendance records yet</p>
                          <p className="text-xs">Check-ins will appear here</p>
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
                        className="border-b hover:bg-muted/30 transition-colors text-xs sm:text-sm"
                      >
                        <TableCell className="p-1 sm:p-3 md:p-4 w-8 sm:w-10 md:w-12">
                          <div className="scale-75 sm:scale-100 origin-left">
                            <Checkbox
                              checked={selectedIds.includes(entry.id)}
                              onCheckedChange={(checked) => handleSelectOne(entry.id, checked as boolean)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-1 sm:p-3 md:p-4">
                          <div className="bg-primary/10 text-primary rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center font-semibold text-xs sm:text-sm">
                            {getInitials(entry.first_name, entry.last_name)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium p-2 sm:p-4">
                          <div className="space-y-0.5">
                            <div>{entry.first_name} {entry.other_names && `${entry.other_names} `}{entry.last_name}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">{entry.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4 hidden sm:table-cell">{entry.phone}</TableCell>
                        <TableCell className="p-2 sm:p-4 hidden md:table-cell">{entry.gender ?? '-'}</TableCell>
                        <TableCell className="text-right text-muted-foreground p-2 sm:p-4 text-xs sm:text-sm">
                          {formatTime(entry.timestamp)}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
            <p className="text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length}
            </p>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-xs h-8"
              >
                Prev
              </Button>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 text-xs"
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
                className="text-xs h-8"
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
            }} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
