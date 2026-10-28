"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Event {
  title: string;
  description: string;
  time: string;
  color: string;
}

interface TodaysEventCardProps {
  events?: Event[];
}

const defaultEvents: Event[] = [
  {
    title: "Extra Curriculum Activities",
    description: "Election Manifestos",
    time: "12:00 PM - 1:30 PM",
    color: "bg-purple-600",
  },
  {
    title: "Session Meeting",
    description: "PTA Meeting",
    time: "3:00 PM - 4:45 PM",
    color: "bg-blue-600",
  },
];

export function TodaysEventCard({
  events = defaultEvents,
}: TodaysEventCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Today&apos;s Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <p>No events today.</p>
        ) : (
          events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={`h-2 w-2 rounded-full ${event.color} mt-2 shrink-0`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {event.title}
                </p>
                <p className="text-xs text-gray-600">{event.description}</p>
                <p className="text-xs text-gray-500 mt-1">{event.time}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
