"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  AttendanceInfo,
  AttendanceRosterModal,
} from "@/components/dashboard-pages/teacher/my-class/attendance-roster-modal";
import { selectUser } from "@/store/slices/authSlice";
import { useAppSelector } from "@/store/hooks";
import {
  useGetStakeholdersQuery,
  useGetStudentByQueryParamQuery,
} from "@/services/stakeholders/stakeholders";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { useGetClassQuery } from "@/services/schools/schools";
import { useRouter } from "next/navigation";
import { useMarkAsReadMutation } from "@/services/shared";
import { useMarkBulkAttendanceMutation } from "@/services/attendance/attendance";
import { toast } from "sonner";

export interface Student {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  fee_summary: {
    block_result_access: boolean;
    fee_records: any[];
    has_outstanding: boolean;
    total_fees: number;
    total_owed: number;
    total_paid: number;
  };
}

const getStatusColor = (status: Student["status"]) => {
  switch (status) {
    case "active":
      return "text-green-600";
    case "inactive":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export default function MyClassPage() {
  const user = useAppSelector(selectUser);
  const { push } = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  //mark attendance
  const [markAttendance, { isLoading: isMarkingAttendance }] =
    useMarkBulkAttendanceMutation();

  //get stakeholder
  const { data: currTeacher, isLoading: isFetchingTeacher } =
    useGetStudentByQueryParamQuery(user?.id ?? "", {
      refetchOnMountOrArgChange: true,
    });
  const teacher: Stakeholders | undefined = currTeacher?.data[0];

  const [classFilter, setClassFilter] = useState<string>(
    teacher?.assigned_classes[0] ?? "",
  );

  //get teacher's class
  const { data: class_data, isLoading: isFetchingClass } = useGetClassQuery(
    { id: user?.school_id ?? "", class_name: classFilter },
    { skip: !user?.school_id || !classFilter },
  );

  const myClassData = useMemo(() => {
    if (!class_data) return;
    setClassFilter(class_data.data.class_details.class_name);
    return class_data.data;
  }, [class_data]);

  const allStudents: Student[] = myClassData
    ? myClassData?.students.map((student) => {
        return {
          id: student.id ?? "",
          full_name: student.full_name ?? "",
          first_name: student.first_name ?? "",
          last_name: student.last_name ?? "",
          gender: student.gender
            ? (student.gender as "male" | "female")
            : "female",
          status: student.status
            ? (student.status as "active" | "inactive")
            : "active",
          parent_name: student.parent_name ?? "",
          parent_email: student.parent_email ?? "",
          parent_phone: student.parent_phone ?? "",
          fee_summary: student.fee_summary ?? {
            block_result_access: false,
            fee_records: [],
            has_outstanding: false,
            total_fees: 0,
            total_owed: 0,
            total_paid: 0,
          },
        };
      })
    : [];

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
      key: "full_name",
      title: "Name & Student ID",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{row.full_name}</span>
          <span className="text-sm text-gray-500">{`${row.last_name}.${row.gender === "male" ? "m" : "f"}${row.id}`}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as Student["status"];
        return (
          <span
            className={cn(
              "text-sm font-medium capitalize",
              getStatusColor(status),
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "parent_name",
      title: "Parent Information",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-gray-800 font-semibold">
            {row.parent_name
              ? row.parent_name === ""
                ? "None Registered"
                : row.parent_name
              : "None Registered"}
          </span>
          <span className="text-sm text-gray-500">
            Parent Phone:{" "}
            {row.parent_phone
              ? row.parent_phone === ""
                ? "N/A"
                : row.parent_phone
              : "N/A"}
          </span>
          <span className="text-sm text-gray-500">
            Parent Email:{" "}
            {row.parent_email
              ? row.parent_email === ""
                ? "N/AN/A"
                : row.parent_email
              : "N/A"}
          </span>
        </div>
      ),
    },
    //school fees record
    {
      key: "school_fees",
      title: "School Fees Record",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">
            Total Fees: ₦{row.fee_summary.total_fees.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            Total Paid: ₦{row.fee_summary.total_paid.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            Total Owed: ₦{row.fee_summary.total_owed.toFixed(2)}
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
              push(`/teacher/my-class/${row.id}`);
            },
          },
          // {
          //   label: "View Grades",
          //   onClick: (row) => {
          //     console.log("View grades for:", row.id);
          //   },
          //   separator: true,
          // },
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

  const postAttendance = async (data: AttendanceInfo) => {
    if (!user?.school_id) return toast.error("Students not recognized");
    if (!user.school.academic_calendar_config.name)
      return toast.error("Academic term not set, please contact admin");
    if (data.att.length === 0) return toast.error("No students found");
    const attendanceRegister = data.att.map((item) => {
      return { ...item, school_id: user?.school_id ?? "" };
    });
    const attendance_payload = {
      date: data.date,
      session: user.school.academic_calendar_config.name, //you can also use user?.school.term.session
      class_name: classFilter,
      data: attendanceRegister,
    };
    try {
      const res = await markAttendance(attendance_payload).unwrap();
      if (res.status) {
        toast.success(
          res.message
            ? res.message
            : "Attendance register uploaded successfully",
        );
      }
      setAttendanceModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = isFetchingClass || isFetchingTeacher;

  useEffect(() => {
    if (!class_data) return;
    setClassFilter(class_data.data.class_details.class_name);
  }, [class_data]);

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
          value={
            isFetchingClass
              ? "-"
              : myClassData
                ? `${myClassData?.students.length} Students`
                : "-"
          }
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Total Class Covered"
          value={
            isFetchingTeacher
              ? "-"
              : `${teacher?.assigned_classes.length ?? 0} Classes - ${teacher?.assigned_classes.join(", ")}`
          }
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Today's Attendance"
          value="- Present / - Absent"
          trend="up"
          trendColor="text-main-blue"
        />
      </div>

      <Button
        variant={"outline"}
        disabled={isFetchingClass || isFetchingTeacher}
        onClick={() => setAttendanceModalOpen(true)}
        className="w-full h-11 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Mark Attendance
      </Button>

      <div className="bg-background rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Student Roster Table
          </h2>
          <div className="flex items-center gap-3">
            <Select
              value={classFilter}
              onValueChange={(value) => setClassFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {teacher?.assigned_classes.map((class_name, index) => {
                  return (
                    <SelectItem key={index} value={class_name}>
                      {class_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
            emptyMessage={
              isLoading ? "Loading..." : "No student in this class yet"
            }
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
        allStudents={students}
        onSave={(data) => postAttendance(data)}
        isLoading={isMarkingAttendance}
      />
    </div>
  );
}
