"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Icon } from "@/components/general/huge-icon";
import { ReportStatus } from "./report-status";
import { ViewIcon, PrinterIcon, Globe02Icon } from "@hugeicons/core-free-icons";

interface StudentReport {
  id: string;
  name: string;
  schoolId: string;
  academicGrade: string;
  reportStatus: "published" | "unpublished";
  progress?: number;
  dateGenerated: string;
  timeGenerated: string;
}

interface ReportTableProps {
  students: StudentReport[];
}

export function ReportTable({ students }: ReportTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => id !== rowId) : [...prev, id],
    );
  };

  const toggleAllSelection = () => {
    if (selectedRows.length === students.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(students.map((student) => student.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-main-blue/5">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedRows.length === students.length &&
                    students.length > 0
                  }
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              <TableHead>Full Name + School ID</TableHead>
              <TableHead>Academic Grade</TableHead>
              <TableHead>Report Status</TableHead>
              <TableHead>Date Generated</TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(student.id)}
                    onCheckedChange={() => toggleRowSelection(student.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {student.name} ({student.schoolId})
                </TableCell>
                <TableCell>{student.academicGrade}</TableCell>
                <TableCell className={`capitalize ${student.reportStatus === "published" ? "text-green-600" : "text-red-600"}`}>
                  {/* <ReportStatus
                    status={student.reportStatus}
                    progress={student.progress}
                  /> */}
                  {student.reportStatus}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {student.dateGenerated}, {student.timeGenerated}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex flex-row gap-3 items-center">
                        <Icon icon={ViewIcon} size={16} />
                        <p>View Report</p>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-row gap-3 items-center">
                        <Icon icon={Globe02Icon} size={16} />
                        <p>Publish to portal</p>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-row gap-3 items-center">
                        <Icon icon={PrinterIcon} size={16} />
                        <p>Print report</p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  );
}
