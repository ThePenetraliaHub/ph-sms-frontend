"use client";

import { useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { usePagination } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePickerIcon from "@/components/ui/date-picker";
import { format } from "date-fns";
import { SelectField } from "@/components/ui/input-field";

interface Student {
  id: string;
  name: string;
  studentId: string;
}

interface AttendanceRosterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sample data - in production, this would come from an API
const allStudents: Student[] = [
  {
    id: "1",
    name: "Sola Adebayo",
    studentId: "adebayo.m178031",
  },
  {
    id: "2",
    name: "Helen Davies",
    studentId: "davies.m178032",
  },
  {
    id: "3",
    name: "Tolu Adebayo",
    studentId: "adebayo.m170833",
  },
  {
    id: "4",
    name: "Biodun Eke",
    studentId: "eke.m178033",
  },
  {
    id: "5",
    name: "Uche Nwachukwu",
    studentId: "nwachukwu.m170844",
  },
  {
    id: "6",
    name: "Adebisi Femi",
    studentId: "femi.m170844",
  },
  {
    id: "7",
    name: "Oluwole Tunde",
    studentId: "oluwole.m170844",
  },
  {
    id: "8",
    name: "Zara Amani",
    studentId: "amani.m170844",
  },
  {
    id: "9",
    name: "Okocha John",
    studentId: "john.m170844",
  },
];

/**
 * Marking multiple attendance
 * {
 *    date: "2026-05-27",
 *    session: "2024/2025",
 *    class_name: "SSS 2",
 *    data: [
 *      {
 *        school_id: "xxx",
 *        stakeholder_id: "xxx",
 *        status: "preent",
 *        notes: "Student arrived on time!"
 *      },
 *      {
 *        school_id: "xxx",
 *        stakeholder_id: "xxx",
 *        status: "absent",
 *        notes: "Called parents, student is sick!"
 *      }
 *    ]
 * }
 *
 */

export function AttendanceRosterModal({
  open,
  onOpenChange,
}: AttendanceRosterModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedClass, setSelectedClass] = useState("jss3-arts");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  // Pagination
  const {
    displayedData: students,
    hasMore,
    loadMore,
    reset,
  } = usePagination({
    data: allStudents,
    initialItemsPerPage: 5,
    itemsPerPage: 5,
  });

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form and pagination when modal closes
      setSelectedDate(new Date());
      setSelectedClass("jss3-arts");
      setAttendance({});
      reset();
    }
    onOpenChange(isOpen);
  };

  const handleToggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSaveAttendance = () => {
    console.log("Save attendance:", {
      date: selectedDate,
      class: selectedClass,
      attendance,
    });
    handleClose(false);
  };

  const formattedDate = selectedDate
    ? format(selectedDate, "MMM. do, yyyy")
    : "";

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Attendance Roster"
      size="3xl"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSaveAttendance} className="flex-1">
            Save Attendance
          </Button>
        </div>
      }
    >
      <div className="space-y-4 max-h-[400px]">
        <div className="grid grid-cols-2 gap-4">
          <DatePickerIcon
            label="Date"
            date={selectedDate}
            setDate={setSelectedDate}
            placeholder="Select date"
          />

          <SelectField
            label="Class"
            value={selectedClass}
            onValueChange={setSelectedClass}
          >
            <SelectItem value="jss1-math">JSS 1 Mathematics</SelectItem>
            <SelectItem value="jss1-english">JSS 1 English</SelectItem>
            <SelectItem value="jss2-science">JSS 2 Science</SelectItem>
            <SelectItem value="jss3-arts">JSS 3 Arts & Culture</SelectItem>
            <SelectItem value="ss1-physics">SS 1 Physics</SelectItem>
            <SelectItem value="ss2-chemistry">SS 2 Chemistry</SelectItem>
          </SelectField>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Name & Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Click the box to mark present
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {student.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({student.studentId})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={attendance[student.id] || false}
                        onCheckedChange={() =>
                          handleToggleAttendance(student.id)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {hasMore && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </ModalContainer>
  );
}
