"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarContainer,
  EventsSidebar,
} from "@/components/dashboard-pages/admin/calendar/components";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { useGetCalendarEventsQuery } from "@/services/schedules/schedules";
import {
  mapScheduleToCalendarEvent,
  mapScheduleToSidebarEvent,
  filterEventsByRole,
} from "@/utils/calendar-utils";

export default function ParentCalendarPage() {
  const user = useAppSelector(selectUser);
  const [currentDate, setCurrentDate] = useState(new Date());

  const schoolId = user?.school_id ?? "";
  const dateFrom = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(1);
    return d.toISOString().split("T")[0];
  }, [currentDate]);
  const dateTo = useMemo(() => {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    return d.toISOString().split("T")[0];
  }, [currentDate]);

  const { data, isLoading } = useGetCalendarEventsQuery({
    schoolId: schoolId || undefined,
    dateFrom,
    dateTo,
  });

  const rawEvents = data?.data ?? [];
  const filtered = filterEventsByRole(rawEvents, user);
  const calendarEvents = filtered.map(mapScheduleToCalendarEvent);
  const eventsList = filtered.map(mapScheduleToSidebarEvent);

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">School Calendar</h2>
        <p className="text-gray-600 mt-1">
          View school events and key dates relevant to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Loading calendar…
                </div>
              ) : (
                <CalendarContainer
                  events={calendarEvents}
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  setSelectedDate={() => {}}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardContent>
              <EventsSidebar
                events={eventsList}
                monthName={format(currentDate, "MMMM")}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
