"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CourseCardProps {
  courseCode: string;
  courseName: string;
  teacher: string;
  currentUnit: string;
  latestActivity: string;
  courseId?: string;
}

export function CourseCard({
  courseCode,
  courseName,
  teacher,
  currentUnit,
  latestActivity,
  courseId = "1",
}: CourseCardProps) {
  return (
    <Card className="p-0">
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">{courseCode}</p>

          <Separator className="my-2" />

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {courseName}
          </h3>

          <Separator className="my-2" />
          <p className="text-sm text-gray-600">Teacher: {teacher}</p>
        </div>

        <Separator className="my-2" />

        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Course Unit</p>
            <p className="text-sm font-medium text-gray-800">{currentUnit}</p>
          </div>

          <Separator className="my-2" />

          <div>
            <p className="text-xs text-gray-500 mb-1">Current Status:</p>
            <p className="text-sm font-medium text-gray-800 capitalize">
              approved
            </p>
          </div>

          <Separator className="my-2" />

          <div>
            <p className="text-xs text-gray-500 mb-1">My Latest Activity</p>
            <p className="text-sm text-gray-600">{latestActivity}</p>
          </div>
        </div>

        <Link href={`/student/my-courses/${courseId}`}>
          <Button variant="outline" className="w-full">
            View Course Content
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
