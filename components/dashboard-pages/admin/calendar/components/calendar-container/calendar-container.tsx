"use client";

import { Dispatch, SetStateAction } from "react";
import { CalendarGrid } from "../calendar-grid/calendar-grid";
import { CalendarNavigation } from "../calendar-navigation/calendar-navigation";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color: "blue" | "purple" | "red" | "green" | "yellow";
}

interface CalendarContainerProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
}

export function CalendarContainer({
  events,
  currentDate,
  onDateChange,
  setSelectedDate,
}: CalendarContainerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between w-full relative">
        <div className="w-16" />

        <span className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
          {format(currentDate, "MMMM yyyy")}
        </span>

        <CalendarNavigation
          currentDate={currentDate}
          onDateChange={onDateChange}
        />
      </div>

      <CalendarGrid
        events={events}
        currentDate={currentDate}
        onDateChange={onDateChange}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
}
