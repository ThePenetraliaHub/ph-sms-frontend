"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dispatch, SetStateAction } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color: "blue" | "purple" | "red" | "green" | "yellow";
}

interface CalendarGridProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const colorClasses = {
  blue: "bg-blue-600/10 border-l-1 border-blue-600",
  purple: "bg-purple-600/10 border-l-1 border-purple-600",
  red: "bg-red-600/10 border-l-1 border-red-600",
  green: "bg-green-50 border-l-1 border-green-600",
  yellow: "bg-yellow-50 border-l-1 border-yellow-600",
};

export function CalendarGrid({
  events,
  currentDate,
  onDateChange,
  setSelectedDate
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const today = new Date();

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              onClick={() => setSelectedDate(day)}
              key={index}
              className={cn(
                "min-h-[100px] cursor-pointer border-r border-b p-2",
                !isCurrentMonth && "bg-gray-50",
                isToday && "bg-red-50",
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  !isCurrentMonth && "text-gray-400",
                  isToday && "text-red-600 font-bold",
                  isCurrentMonth && !isToday && "text-gray-700",
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded truncate",
                      colorClasses[event.color],
                    )}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
