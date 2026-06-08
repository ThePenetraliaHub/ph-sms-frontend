"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import {
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/general/huge-icon";

type AttendanceStatus = "present" | "absent" | "no-data";

interface StudentAttendance {
  id: string;
  name: string;
  schoolId: string;
  attendance: {
    day: number;
    status: AttendanceStatus;
  };
}

interface AttendanceTableProps {
  students: StudentAttendance[];
  dates: number[];
}

export function AttendanceTable({ students, dates }: AttendanceTableProps) {
  const getAttendanceIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return (
          <div className="flex items-center justify-center">
            <Icon
              size={20}
              icon={CheckmarkCircle01Icon}
              className=" text-green-600"
            />
          </div>
        );
      case "absent":
        return (
          <div className="flex items-center justify-center">
            <Icon size={20} icon={CancelCircleIcon} className=" text-red-600" />
          </div>
        );
      case "no-data":
        return (
          <div className="flex items-center justify-center">
            <Icon size={20} icon={MinusSignIcon} className=" text-gray-600" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-main-blue/5">
              <TableHead className="min-w-[250px] sticky left-0 z-10 border-r">
                Full Name + School ID
              </TableHead>
              {dates.map((date) => (
                <TableHead key={date} className="text-center min-w-[60px]">
                  {date}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="flex flex-col font-medium text-gray-700 sticky left-0 bg-white z-10 border-r">
                  <span>{student.name}</span>
                  <span className="text-light text-xs text-gray-400">
                    {student.schoolId}
                  </span>
                </TableCell>
                {dates.map((date) => (
                  <TableCell key={date} className="text-center">
                    {date.toString() === student.attendance.day.toString()
                      ? getAttendanceIcon(
                          student.attendance.status || "no-data",
                        )
                      : "-"}
                  </TableCell>
                ))}
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
