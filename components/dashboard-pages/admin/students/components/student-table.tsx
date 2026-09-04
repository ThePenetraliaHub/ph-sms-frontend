"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Icon } from "@/components/general/huge-icon";
import { cn } from "@/lib/utils";
import {
  ElearningExchangeIcon,
  PencilEdit02Icon,
  UserStatusIcon,
  LockPasswordIcon,
  ViewIcon,
  Csv02Icon,
  PrinterIcon,
  FilterIcon,
  StopCircleIcon,
  User02FreeIcons,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import {
  useChangeResultAccessMutation,
  useCheckResultAccessQuery,
} from "@/services/schools/schools";
import { toast } from "sonner";
import { AssignParent } from "../modals/assign-parent";

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  schoolId: string;
  grade: string;
  attendance: string;
  academicAvg: string;
  outstandingFees: string | number;
  status: "active" | "on-leave" | "suspended" | "graduated" | "withdrawn";
  dateJoined: string;
  gender: string;
  age: string;
  parent_info: {
    full_name: string;
    phone_number: string;
    id: string;
  };
}

interface StudentTableProps {
  studentsData?: { data: any[]; total?: number };
  isLoading?: boolean;
  setFilterModal: Dispatch<SetStateAction<boolean>>;
}

export function StudentTable({
  studentsData,
  isLoading = false,
  setFilterModal,
}: StudentTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selStudId, setSelStudId] = useState<string>();
  const [showAssignParMod, setShowAssignParMod] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student>();

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => id !== rowId) : [...prev, id],
    );
  };

  function calculateAge(dateOfBirth: string): string {
    const dob = new Date(dateOfBirth);
    const now = new Date();

    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }

    return age.toString();
  }

  //check result access
  const {
    data: studentsResultAccess,
    isLoading: isFetchingResAccStat,
    isError: isFetchingResAccStatErr,
  } = useCheckResultAccessQuery(
    { studentId: selStudId ?? "" },
    { skip: !selStudId },
  );

  //change result access status
  const [changeResultAccess, { isLoading: isChangingResultAccess }] =
    useChangeResultAccessMutation();

  const apiStudents =
    studentsData?.data?.map(
      (student: {
        id?: string;
        user?: {
          first_name?: string;
          last_name?: string;
          gender?: string;
          date_of_birth: string | null;
        };
        studentId?: string;
        className?: string;
        class_assigned: string | null;
        date_joined?: string;
        class?: { name?: string };
        fee_summary?: {
          block_result_access: boolean;
          fee_records: any[];
          has_outstanding: boolean;
          total_fees: number;
          total_owed: number;
          total_paid: number;
        };
        parent_info: {
          full_name: string;
          phone_number: string;
          id: string;
        } | null;
        status?: string;
      }) => ({
        id: student?.id ?? "",
        first_name: student?.user?.first_name ?? "",
        last_name: student?.user?.last_name ?? "",
        schoolId: student?.studentId || student?.id || "",
        grade: student?.class_assigned || "N/A",
        attendance: "N/A",
        academicAvg: "N/A",
        outstandingFees: student?.fee_summary?.total_owed ?? "N/A",
        status: (student?.status || "active") as Student["status"],
        dateJoined: student.date_joined
          ? format(student.date_joined, "MMM dd, yyyy")
          : "N/A",
        gender: student?.user?.gender ?? "N/A",
        age: student.user?.date_of_birth
          ? calculateAge(student.user?.date_of_birth)
          : "N/A",
        parent_info: {
          full_name: student.parent_info?.full_name ?? "N/A",
          phone_number: student.parent_info?.phone_number ?? "N/A",
          id: student.parent_info?.id ?? "N/A",
        },
      }),
    ) ?? [];

  const allStudents = apiStudents.length > 0 ? apiStudents : [];

  const filteredStudents = allStudents.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.schoolId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStatusChange = (
    applicationId: string,
    newStatus: "active" | "on-leave" | "suspended" | "graduated" | "withdrawn",
    statusLabel: string,
  ) => {
    // Status changes would typically trigger an API mutation
    const updatedStudents = allStudents.map((app) =>
      app.id === applicationId ? { ...app, status: newStatus } : app,
    );
  };

  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "on-leave":
        return "text-blue-600";
      case "suspended":
        return "text-orange-600";
      case "graduated":
        return "text-gray-600";
      case "withdrawn":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return "Active";
      case "on-leave":
        return "On Leave";
      case "suspended":
        return "Suspended";
      case "graduated":
        return "Graduated";
      case "withdrawn":
        return "Withdrawn";
      default:
        return status;
    }
  };

  const effectResultAccess = async (action: "block" | "auto" | "unblock") => {
    // console.log(studentId);
    if (isFetchingResAccStatErr) return toast.error("Update failed");
    try {
      const res = await changeResultAccess({
        student_id: selStudId ?? "",
        action,
      }).unwrap();
      toast.success(res.message ? res.message : "Result access status updated");
      if (selStudId) setSelStudId(undefined);
    } catch {}
  };

  const columns: TableColumn<Student>[] = [
    {
      key: "name",
      title: "Full Name + School ID",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">
            {row.first_name} {row.last_name}
          </span>
          <span className="text-xs">({row.schoolId})</span>
        </div>
      ),
    },
    {
      key: "grade",
      title: "Grade/Class",
    },
    {
      key: "gender",
      title: "Gender",
      render: (_, row) => <span className="capitalize">{row.gender}</span>,
    },
    {
      key: "age",
      title: "Age",
    },
    {
      key: "parent_info",
      title: "Parent Info",
      render: (_, row) =>
        row.parent_info ? (
          <div className="flex flex-col">
            <p>Name: {row.parent_info.full_name}</p>
            <p>Number: {row.parent_info.phone_number}</p>
          </div>
        ) : (
          <span>N/A</span>
        ),
    },
    {
      key: "outstandingFees",
      title: "Outstanding Fees",
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={cn(
            "text-sm font-medium",
            getStatusColor(value as Student["status"]),
          )}
        >
          {getStatusLabel(value as Student["status"])}
        </span>
      ),
    },
    {
      key: "dateJoined",
      title: "Date Joined",
      className: "text-sm text-gray-600",
    },
  ];

  const actions: TableAction<Student>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View student profile",
            onClick: (row) => router.push(`/admin/students/${row.id}`),
            icon: <Icon icon={ViewIcon} size={16} />,
          },
          {
            separator: true,
            label: "Edit student file",
            onClick: (row) => router.push(`/admin/students/${row.id}/edit`),
            icon: <Icon icon={PencilEdit02Icon} size={16} />,
          },
          {
            separator: true,
            disabled: () => isChangingResultAccess || isFetchingResAccStat,
            label: "Block/Unblock Result",
            onClick: (row) => setSelStudId(row.id),
            icon: <Icon icon={StopCircleIcon} size={16} />,
          },
          {
            separator: true,
            disabled: (row) => (row.parent_info.id !== "N/A" ? true : false),
            label: "Assign Parent",
            onClick: (row) => {
              (setSelectedStudent(row), setShowAssignParMod(true));
            },
            icon: <Icon icon={User02FreeIcons} size={16} />,
          },
          {
            separator: true,
            label: "View Parent Info",
            disabled: (row) => (row.parent_info.id === "N/A" ? true : false),
            onClick: (row) =>
              router.push(`/admin/guardians/${row.parent_info.id}`),
            icon: <Icon icon={ElearningExchangeIcon} size={16} />,
          },
          {
            separator: true,
            label: "Update status",
            onClick: (row) => console.log("Print", row),
            icon: <Icon icon={UserStatusIcon} size={16} />,
            subItems: [
              {
                label: "Active",
                onClick: (row) =>
                  handleStatusChange(row.id, "active", "Active"),
              },
              {
                label: "On Leave",
                onClick: (row) =>
                  handleStatusChange(row.id, "on-leave", "On Leave"),
              },
              {
                label: "Suspended",
                onClick: (row) =>
                  handleStatusChange(row.id, "suspended", "Suspended"),
              },
              {
                label: "Graduated",
                onClick: (row) =>
                  handleStatusChange(row.id, "graduated", "Graduated"),
              },
              {
                label: "Withdrawn",
                onClick: (row) =>
                  handleStatusChange(row.id, "withdrawn", "Withdrawn"),
              },
            ],
          },
          {
            separator: true,
            label: "Reset Password",
            onClick: (row) => console.log("Print", row),
            icon: <Icon icon={LockPasswordIcon} size={16} />,
          },
          {
            separator: true,
            label: "Print school ID",
            onClick: (row) => console.log("Print", row),
            icon: <Icon icon={PrinterIcon} size={16} />,
          },
        ],
      },
    },
  ];

  useEffect(() => {
    if (!studentsResultAccess) return;
    if (!selStudId) return;
    //do something
    const block_result_access: boolean =
      studentsResultAccess.data.block_result_access;
    const outstanding_status: boolean =
      studentsResultAccess.data.has_outstanding;

    const action: "block" | "unblock" = outstanding_status
      ? "block"
      : block_result_access
        ? "unblock"
        : "block";
    effectResultAccess(action);
  }, [studentsResultAccess]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by name, student ID, or parent phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setFilterModal(true)}
          variant="outline"
          className="text-muted-foreground gap-2"
        >
          <Icon icon={FilterIcon} size={20} />
          Filter by:
        </Button>
        <Button variant="outline" className="text-muted-foreground gap-2">
          <Icon icon={Csv02Icon} size={20} />
          Export Data
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredStudents}
          actions={actions}
          isLoading={isLoading}
          headerClassName="bg-main-blue/5"
          onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
          emptyMessage="No students found."
        />
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>

      {/* assign parent modal */}
      <AssignParent
        open={showAssignParMod}
        onOpenChange={setShowAssignParMod}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
      />
    </div>
  );
}
