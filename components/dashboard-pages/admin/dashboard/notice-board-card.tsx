"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Notice {
  title: string;
  time: string;
  description: string;
}

interface NoticeBoardCardProps {
  notices?: Notice[];
}

const defaultNotices: Notice[] = [
  {
    title: "Election Manifestos",
    time: "10:32 AM",
    description:
      "Today is the D-Day for every of our aspirants. Time is 12:00 PM - 1:30 PM",
  },
];

export function NoticeBoardCard({
  notices = defaultNotices,
}: NoticeBoardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Today on the Notice Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notices.map((notice, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-800">
                  {notice.title}
                </h4>
                <span className="text-xs text-gray-500">{notice.time}</span>
              </div>
              <p className="text-sm text-gray-600">{notice.description}</p>
            </div>
          ))}
          <Link href="/admin/notice-board" className="w-full">
            <Button variant={"outline"} className="w-full">
              View More
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
