/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { AttendanceFilters } from "@/components/dashboard-pages/admin/students/components/attendance-filters";
import { AttendanceTable } from "@/components/dashboard-pages/admin/students/components/attendance-table";
import {
  useGetAllAttendanceQuery,
  useLazyGetAttendanceQuery,
} from "@/services/attendance/attendance";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";

type AttendanceStatus = "present" | "absent" | "no-data";

interface StudentAttendance {
  id: string;
  name: string;
  schoolId: string;
  attendance: {
    day: number;
    status: AttendanceStatus;
  };
}

const dates = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AttendanceTrackingPage() {
  const user = useAppSelector(selectUser);
  const all_school_classes = user ? user.school.classes : [];
  const session = user ? user.school.term.session : "";
  const [selectedDate, setSelectedDate] = useState<Date>("");
  const [status, setStatus] = useState("all");
  const [selectedClass, setSelectedClass] = useState("JSS 1");
  const [formattedAttendance, setFormattedAttendance] = useState<
    StudentAttendance[]
  >([]);

  const formatDate = (date: Date): string => {
    const rawDate = new Date(date);
    const formattedDate = rawDate.toISOString().split("T")[0];
    return formattedDate ? formattedDate : "";
  };

  const { data: attendanceData, isLoading } = useGetAllAttendanceQuery();
  const [getFilteredAttendance] = useLazyGetAttendanceQuery();

  const getDatebyNumber = (date: string): number => {
    if (!date) return 0;
    const day = Number(date.split("-")[2]);
    if (isNaN(day)) {
      return 0;
    }
    return Number(day);
  };

  const fetchFilteredAttendance = async () => {
    try {
      const res = await getFilteredAttendance({
        class_name: selectedClass,
        status: status as "present" | "absent" | "late" | "excused",
        date: formatDate(selectedDate),
        session: session,
      }).unwrap();
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterSubmission = () => {
    if (!selectedDate) return;
    console.log("Date: ", formatDate(selectedDate));
    console.log("Status: ", status);
    console.log("Class: ", selectedClass);
    console.log("Session: ", session);

    fetchFilteredAttendance();
  };

  useEffect(() => {
    if (!attendanceData) return;
    const attendance: StudentAttendance[] = attendanceData?.data.map(
      (student) => {
        return {
          id: student.stakeholder_id,
          name: student.student_name,
          schoolId: student.school_id,
          attendance: {
            day: getDatebyNumber(student.date),
            status: student.status as AttendanceStatus,
          },
        };
      },
    );
    setFormattedAttendance(attendance);
  }, [attendanceData]);

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Attendance Tracking & Overview
        </h2>
        <p className="text-gray-600 mt-1">
          Attendance rates across different organizational segments.
        </p>
      </div>

      <Card>
        <CardHeader>Class Attendace</CardHeader>
        <CardContent>
          <div className="space-y-6">
            <AttendanceFilters
              classes={all_school_classes}
              session={session}
              status={status}
              class={selectedClass}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onStatusChange={setStatus}
              onClassChange={setSelectedClass}
              onSubmit={handleFilterSubmission}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Students"
          value={formattedAttendance.length}
          subtitle=""
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Overall Attendance"
          value="N/A"
          subtitle=""
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Total Absentees"
          value={"N/A"}
          subtitle=""
          trend="up"
          trendColor="text-main-blue"
        />
      </div>

      <Card>
        <CardHeader className="font-semibold">Attendance List</CardHeader>
        <CardContent>
          {formattedAttendance.length === 0 ? (
            <div className="h-30 w-full flex border border-border items-center justify-center bg-secondary rounded-lg">
              No data available.
            </div>
          ) : (
            <AttendanceTable students={formattedAttendance} dates={dates} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
