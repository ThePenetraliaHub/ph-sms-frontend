/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { AttendanceFilters } from "@/components/dashboard-pages/admin/students/components/attendance-filters";
import { AttendanceTable } from "@/components/dashboard-pages/admin/students/components/attendance-table";

import { useGetAllAttendanceQuery } from "@/services/attendance/attendance";

// type AttendanceStatus = "present" | "absent" | "no-data";

interface StudentAttendance {
  id: string;
  name: string;
  schoolId: string;
  // attendance: Record<number, AttendanceStatus>;
  attendance: {
    day: number;
    status: string;
  };
}

const dates = Array.from({ length: 31 }, (_, i) => i + 1);

// const sampleStudents: StudentAttendance[] = [
//   {
//     id: "1",
//     name: "Chinedu Nwokodi",
//     schoolId: "nwokodi.m178023",
//     attendance: {
//       13: "present",
//       14: "present",
//       15: "present",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "present",
//       23: "present",
//       24: "present",
//       25: "present",
//     },
//   },
//   {
//     id: "2",
//     name: "Adebisi Deborah",
//     schoolId: "adebisi.m178024",
//     attendance: {
//       13: "present",
//       14: "present",
//       15: "absent",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "absent",
//       23: "present",
//       24: "present",
//       25: "present",
//     },
//   },
//   {
//     id: "3",
//     name: "Dauda Ahfiz",
//     schoolId: "ahfiz.m178025",
//     attendance: {
//       13: "present",
//       14: "present",
//       15: "present",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "present",
//       23: "present",
//       24: "present",
//       25: "present",
//     },
//   },
//   {
//     id: "4",
//     name: "Sarah Collins",
//     schoolId: "collins.m178026",
//     attendance: {
//       13: "present",
//       14: "present",
//       15: "present",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "present",
//       23: "present",
//       24: "present",
//       25: "present",
//     },
//   },
//   {
//     id: "5",
//     name: "John Terjiri",
//     schoolId: "terjiri.m178027",
//     attendance: {
//       13: "present",
//       14: "present",
//       15: "present",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "present",
//       23: "present",
//       24: "present",
//       25: "present",
//     },
//   },
//   {
//     id: "6",
//     name: "Chinedu Nwokodi",
//     schoolId: "nwokodi.m178023",
//     attendance: {
//       13: "present",
//       14: "present",
//       15: "present",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "present",
//       23: "present",
//       24: "present",
//       25: "absent",
//     },
//   },
//   {
//     id: "7",
//     name: "Adebisi Deborah",
//     schoolId: "adebisi.m178024",
//     attendance: {
//       13: "absent",
//       14: "present",
//       15: "present",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "present",
//       23: "present",
//       24: "present",
//       25: "present",
//     },
//   },
//   {
//     id: "8",
//     name: "Dauda Ahfiz",
//     schoolId: "ahfiz.m178025",
//     attendance: {
//       13: "present",
//       14: "present",
//       15: "present",
//       16: "present",
//       17: "present",
//       18: "no-data",
//       19: "no-data",
//       20: "present",
//       21: "present",
//       22: "present",
//       23: "present",
//       24: "present",
//       25: "present",
//     },
//   },
// ];

export default function AttendanceTrackingPage() {
  const [month, setMonth] = useState("october-2025");
  const [week, setWeek] = useState("week-7-8");
  const [selectedClass, setSelectedClass] = useState("JSS 1");
  const [formattedAttendance, setFormattedAttendance] = useState<
    StudentAttendance[]
  >([]);

  const { data: attendanceData, isLoading } = useGetAllAttendanceQuery();

  const getDatebyNumber = (date: string): number => {
    if (!date) return 0;
    const day = Number(date.split("-")[2]);
    if (isNaN(day)) {
      return 0;
    }
    return Number(day);
  };

  const handleFilterSubmission = () => {
    console.log("Month", month);
    console.log("Week", week);
    console.log("Class", selectedClass);
  };

  useEffect(() => {
    if (!attendanceData) return;
    const attendance: StudentAttendance[] = attendanceData?.data.map(
      (student) => {
        return {
          id: student.school_id,
          name: `ST ID: ${student.school_id}`,
          schoolId: student.school_id,
          attendance: {
            day: getDatebyNumber(student.date),
            status: student.status,
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
              month={month}
              week={week}
              class={selectedClass}
              onMonthChange={setMonth}
              onWeekChange={setWeek}
              onClassChange={setSelectedClass}
              onSubmit={handleFilterSubmission}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Students"
          value="200"
          subtitle=""
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Overall Attendance"
          value="95.2%"
          subtitle=""
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Total Absentees"
          value="4"
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
