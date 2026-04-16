"use client";

import { useState } from "react";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { usePagination } from "@/hooks/use-pagination";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AttendanceRosterModal } from "@/components/dashboard-pages/teacher/my-class/attendance-roster-modal";

interface Student {
  id: string;
  name: string;
  studentId: string;
  status: "Present" | "Absent";
  lastAssignmentScore: string;
  lastAssignmentName: string;
}

const allStudents: Student[] = [
  {
    id: "1",
    name: "Sola Adebayo",
    studentId: "adebayo.m178031",
    status: "Present",
    lastAssignmentScore: "92%",
    lastAssignmentName: "Unit 4 Quiz",
  },
  {
    id: "2",
    name: "Helen Davies",
    studentId: "davies.m178032",
    status: "Present",
    lastAssignmentScore: "92%",
    lastAssignmentName: "Unit 4 Quiz",
  },
  {
    id: "3",
    name: "Tolu Adebayo",
    studentId: "adebayo.m170833",
    status: "Absent",
    lastAssignmentScore: "92%",
    lastAssignmentName: "Unit 4 Quiz",
  },
  {
    id: "4",
    name: "Biodun Eke",
    studentId: "eke.m178033",
    status: "Present",
    lastAssignmentScore: "92%",
    lastAssignmentName: "Unit 4 Quiz",
  },
  {
    id: "5",
    name: "Uche Nwachukwu",
    studentId: "nwachukwu.m170844",
    status: "Absent",
    lastAssignmentScore: "92%",
    lastAssignmentName: "Unit 4 Quiz",
  },
  {
    id: "6",
    name: "Adebisi Femi",
    studentId: "femi.m170844",
    status: "Present",
    lastAssignmentScore: "88%",
    lastAssignmentName: "Unit 4 Quiz",
  },
  {
    id: "7",
    name: "Oluwole Tunde",
    studentId: "oluwole.m170844",
    status: "Present",
    lastAssignmentScore: "95%",
    lastAssignmentName: "Unit 4 Quiz",
  },
  {
    id: "8",
    name: "Zara Amani",
    studentId: "amani.m170844",
    status: "Present",
    lastAssignmentScore: "90%",
    lastAssignmentName: "Unit 4 Quiz",
  },
];

const getStatusColor = (status: Student["status"]) => {
  switch (status) {
    case "Present":
      return "text-green-600";
    case "Absent":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export default function MyClassPage() {
  const [classFilter, setClassFilter] = useState("jss3");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  const filteredStudents = allStudents.filter((student) => {
    if (statusFilter === "all") return true;
    return student.status.toLowerCase() === statusFilter;
  });

  const {
    displayedData: students,
    hasMore,
    loadMore,
  } = usePagination({
    data: filteredStudents,
    initialItemsPerPage: 5,
    itemsPerPage: 5,
  });

  const columns: TableColumn<Student>[] = [
    {
      key: "name",
      title: "Name & Student ID",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{row.name}</span>
          <span className="text-sm text-gray-500">{row.studentId}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as Student["status"];
        return (
          <span className={cn("text-sm font-medium", getStatusColor(status))}>
            {status}
          </span>
        );
      },
    },
    {
      key: "lastAssignmentScore",
      title: "Last Assignment Score",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-gray-800">{row.lastAssignmentScore}</span>
          <span className="text-sm text-gray-500">
            ({row.lastAssignmentName})
          </span>
        </div>
      ),
    },
  ];

  const actions: TableAction<Student>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View Profile",
            onClick: (row) => {
              console.log("View profile for:", row.id);
            },
          },
          {
            label: "View Grades",
            onClick: (row) => {
              console.log("View grades for:", row.id);
            },
            separator: true,
          },
          {
            label: "Send Message",
            onClick: (row) => {
              console.log("Send message to:", row.id);
            },
          },
        ],
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          My Class Roster
        </h1>
        <p className="text-gray-600">
          This screen provides the teacher with an immediate, actionable
          overview of all students they teach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Students"
          value="180 Students"
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Total Class Covered"
          value="5 Classes"
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Today's Attendance"
          value="178 Present / 2 Absent"
          trend="up"
          trendColor="text-main-blue"
        />
      </div>

      <Button
        variant={"outline"}
        onClick={() => setAttendanceModalOpen(true)}
        className="w-full h-11"
      >
        Mark Attendance
      </Button>

      <div className="bg-background rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Student Roster Table
          </h2>
          <div className="flex items-center gap-3">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jss1">JSS 1</SelectItem>
                <SelectItem value="jss2">JSS 2</SelectItem>
                <SelectItem value="jss3">JSS 3</SelectItem>
                <SelectItem value="ss1">SS 1</SelectItem>
                <SelectItem value="ss2">SS 2</SelectItem>
                <SelectItem value="ss3">SS 3</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={students}
            actions={actions}
            showActionsColumn={true}
            actionsColumnTitle="Action"
          />
        </div>

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>

      <AttendanceRosterModal
        open={attendanceModalOpen}
        onOpenChange={setAttendanceModalOpen}
      />
    </div>
  );
}
