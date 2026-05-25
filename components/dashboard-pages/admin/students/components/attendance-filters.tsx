"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/general/huge-icon";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface AttendanceFiltersProps {
  month: string;
  week: string;
  class: string;
  onMonthChange: (value: string) => void;
  onWeekChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onSubmit: () => void;
}

export function AttendanceFilters({
  month,
  week,
  class: className,
  onMonthChange,
  onWeekChange,
  onClassChange,
  onSubmit,
}: AttendanceFiltersProps) {
  const user = useAppSelector(selectUser);
  const [regClasses, setRegClasses] = useState<string[]>(
    user?.school.classes ?? [],
  );
  const fallBackClasses: string[] = [
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3",
  ];

  useEffect(() => {
    if (user?.school.classes) return;
    setRegClasses(fallBackClasses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-4 w-full">
      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className="w-full">
          <Icon icon={Calendar03Icon} size={16} className="shrink-0" />
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="october-2025">October 2025</SelectItem>
          <SelectItem value="november-2025">November 2025</SelectItem>
          <SelectItem value="december-2025">December 2025</SelectItem>
        </SelectContent>
      </Select>

      <Select value={week} onValueChange={onWeekChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select week" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week-7-8">Academic Week 7-8</SelectItem>
          <SelectItem value="week-9-10">Academic Week 9-10</SelectItem>
          <SelectItem value="week-11-12">Academic Week 11-12</SelectItem>
        </SelectContent>
      </Select>

      <Select value={className} onValueChange={onClassChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          {regClasses.map((cls, index) => {
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
