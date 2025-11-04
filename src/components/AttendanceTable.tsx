import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AttendanceEntry {
  id: string;
  first_name: string;
  last_name: string;
  other_names?: string | null;
  phone: string;
  timestamp: string;
}

interface AttendanceTableProps {
  entries: AttendanceEntry[];
}

export const AttendanceTable = ({ entries }: AttendanceTableProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Name</TableHead>
              <TableHead className="w-1/2">Phone Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                  No attendance records yet
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} className="animate-slide-up">
                  <TableCell className="font-medium">
                    {entry.first_name} {entry.other_names ? entry.other_names + ' ' : ''}{entry.last_name}
                  </TableCell>
                  <TableCell>{entry.phone}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
