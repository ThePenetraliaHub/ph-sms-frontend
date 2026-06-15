"use client";

import { useEffect, useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { usePagination } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DatePickerIcon from "@/components/ui/date-picker";
import { Student } from "@/app/(dashboard)/teacher/my-class/page";
import { Input } from "@/components/ui/input";
import { AttendanceStatus } from "@/services/attendance/attendance-type";
import { CheckedState } from "@radix-ui/react-checkbox";

interface AttendanceRosterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allStudents: Student[];
  onSave: (data: AttendanceInfo) => void;
  isLoading: boolean;
}

interface AttendanceData {
  stakeholder_id: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceInfo {
  date: string;
  att: AttendanceData[];
}

export function AttendanceRosterModal({
  open,
  onOpenChange,
  allStudents,
  onSave,
  isLoading,
}: AttendanceRosterModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [att, setAtt] = useState<AttendanceData[]>([]);

  // Pagination
  const {
    displayedData: students,
    hasMore,
    loadMore,
    reset,
  } = usePagination({
    data: allStudents ?? [],
    initialItemsPerPage: 5,
    itemsPerPage: 5,
  });

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form and pagination when modal closes
      setSelectedDate(new Date());
      setAtt([]);
      reset();
    }
    onOpenChange(isOpen);
  };

  const handleToggleAttendance = (studentId: string, check: CheckedState) => {
    const updatedArr = att.map((item) => {
      return item.stakeholder_id === studentId
        ? {
            ...item,
            status: check
              ? ("present" as AttendanceStatus)
              : ("absent" as AttendanceStatus),
          }
        : item;
    });
    setAtt(updatedArr);
  };

  const handleAddAttendanceNotes = (value: string, studentId: string) => {
    const updatedArr = att.map((item) => {
      return item.stakeholder_id === studentId
        ? {
            ...item,
            notes: !value.trim() ? undefined : value,
          }
        : item;
    });
    setAtt(updatedArr);
  };

  const handleSaveAttendance = () => {
    const data = {
      date: selectedDate ? selectedDate?.toISOString().split("T")[0] : "",
      att,
    };
    onSave(data);
    setAtt([]);
  };

  useEffect(() => {
    if (allStudents.length === 0) return;
    const initializeAttendance: AttendanceData[] = allStudents.map(
      (student) => {
        return {
          stakeholder_id: student.id,
          status: "absent",
        };
      },
    );
    setAtt(initializeAttendance);
  }, [allStudents]);

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
          <Button
            disabled={isLoading}
            onClick={handleSaveAttendance}
            className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 max-h-[400px]">
        <div className="grid grid-cols-1 gap-4">
          <DatePickerIcon
            label="Date"
            date={selectedDate}
            setDate={setSelectedDate}
            placeholder="Select date"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {students.length === 0 ? (
              <div className="p-5 flex items-center justify-center">
                No students recorded in this class
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Name & Student ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Click to mark present
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {student.full_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            (
                            {`${student.last_name}.${student.gender === "male" ? "m" : "f"}${student.id}`}
                            )
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-50 w-50">
                        <Checkbox
                          // checked={attendance[student.id] || false}
                          onCheckedChange={(check) =>
                            handleToggleAttendance(student.id, check)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          onChange={(e) =>
                            handleAddAttendanceNotes(e.target.value, student.id)
                          }
                          className="min-w-50 lg:min-w-50"
                          type="text"
                          placeholder="Add notes (optional)"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
