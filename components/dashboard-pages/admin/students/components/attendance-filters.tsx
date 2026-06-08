"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import DatePickerIcon from "@/components/ui/date-picker";

interface AttendanceFiltersProps {
  status: string;
  class: string;
  classes: string[];
  session: string;
  onStatusChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubmit: () => void;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
  selectedDate: Date | undefined;
}

export function AttendanceFilters({
  status,
  class: className,
  setSelectedDate,
  selectedDate,
  classes,
  session,
  onStatusChange,
  onClassChange,
  onSubmit,
}: AttendanceFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-4 w-full">
      <DatePickerIcon
        label=""
        date={selectedDate}
        setDate={setSelectedDate}
        placeholder="Select date"
      />

      <Select value={session}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Session" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={`${session}`}>{session}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          {["absent", "present", "all"].map((status, index) => {
            return (
              <SelectItem key={index} value={status} className="capitalize">
                {status}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Select value={className} onValueChange={onClassChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls, index) => {
            return (
              <SelectItem key={index} value={cls}>
                {cls}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Button onClick={onSubmit}>Apply Filter</Button>
    </div>
  );
}
