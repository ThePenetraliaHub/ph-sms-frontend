"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarContainer,
  EventsSidebar,
  CreateEventModal,
} from "@/components/dashboard-pages/admin/calendar/components";
import { Icon } from "@/components/general/huge-icon";
import { AddSquareIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  useGetCalendarEventsQuery,
  useCreateScheduleMutation,
} from "@/services/schedules/schedules";
import {
  mapScheduleToCalendarEvent,
  mapScheduleToSidebarEvent,
  filterEventsByRole,
  formDataToCreatePayload,
} from "@/utils/calendar-utils";
import type { EventFormData } from "@/components/dashboard-pages/admin/calendar/components";

export default function CalendarPage() {
  const user = useAppSelector(selectUser);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  //clicking on any day from the calender
  const [selectedDate, setSelectedDate] = useState<Date>();
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
  const [createSchedule] = useCreateScheduleMutation();

  const rawEvents = data?.data ?? [];
  const filtered = filterEventsByRole(rawEvents, user);
  const calendarEvents = filtered.map(mapScheduleToCalendarEvent);
  const eventsList = filtered.map(mapScheduleToSidebarEvent);

  const handleAddEvent = () => setIsModalOpen(true);

  const handleEventSubmit = async (eventData: EventFormData) => {
    if (!eventData.schoolId) return;
    try {
      const payload = formDataToCreatePayload(eventData);
      await createSchedule(payload).unwrap();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to create event:", e);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    setIsModalOpen(true);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">School Calendar</h2>
        <p className="text-gray-600 mt-1">
          Create/Manage School-wide Notices, Events, and Key Dates.
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
                  setSelectedDate={setSelectedDate}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardContent>
              <Button
                variant="outline"
                onClick={handleAddEvent}
                className="w-full gap-2"
              >
                <Icon icon={AddSquareIcon} size={18} />
                Add New Event
              </Button>
            </CardContent>
          </Card>

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

      <CreateEventModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleEventSubmit}
        defaultSchoolId={schoolId || undefined}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
}
