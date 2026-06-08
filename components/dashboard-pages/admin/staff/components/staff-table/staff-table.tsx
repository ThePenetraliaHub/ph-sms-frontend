"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Icon } from "@/components/general/huge-icon";
import { cn } from "@/lib/utils";
import {
  ElearningExchangeIcon,
  Edit01Icon,
  Csv02Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { format } from "date-fns";

interface Staff {
  id: string;
  name: string;
  staffId: string;
  role: string;
  department: string;
  contractStatus: string;
  contractExpiry?: string;
  status: "active" | "on-leave" | "inactive";
  statusLabel: string;
  leaveDaysLeft: number;
}

interface StaffTableProps {
  staffData?: Stakeholders[];
  isLoading?: boolean;
}

export function StaffTable({
  staffData = [],
  isLoading = false,
}: StaffTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  console.log(staffData);

  const staff: Staff[] = useMemo(() => {
    if (!staffData || staffData.length === 0) return [];

    return staffData.map((stakeholder) => {
      const fullName = stakeholder.user
        ? `${stakeholder.user.first_name || ""} ${stakeholder.user.middle_name || ""} ${stakeholder.user.last_name || ""}`.trim()
        : "Name Missing";

      let contractExpiry: string | undefined;
      if (stakeholder.contract_end_date) {
        try {
          const date = new Date(stakeholder.contract_end_date);
          contractExpiry = format(date, "MM/yyyy");
        } catch {
          contractExpiry = stakeholder.contract_end_date;
        }
      }

      const contractStatus = stakeholder.contract_end_date
        ? new Date(stakeholder.contract_end_date) > new Date()
          ? "Active"
          : "Expired"
        : "Active";

      const statusMap: Record<string, "active" | "on-leave" | "inactive"> = {
        active: "active",
        inactive: "inactive",
        "on-leave": "on-leave",
      };
      const status = statusMap[stakeholder.status?.toLowerCase()] || "active";

      const leaveDaysLeft = stakeholder.annual_leave_entitlement
        ? parseInt(stakeholder.annual_leave_entitlement) || 0
        : 0;

      const department =
        stakeholder.class_assigned ||
        (stakeholder.assigned_classes && stakeholder.assigned_classes.length > 0
          ? stakeholder.assigned_classes.join(", ")
          : "N/A");

      return {
        id: stakeholder.id,
        name: fullName,
        staffId:
          stakeholder.admission_number ||
          stakeholder.id.slice(0, 8).toUpperCase(),
        role: stakeholder.position || "Staff",
        department: department,
        contractStatus: contractStatus,
        contractExpiry: contractExpiry,
        status: status,
        statusLabel: stakeholder.status || "Active",
        leaveDaysLeft: leaveDaysLeft,
      };
    });
  }, [staffData]);

  const displayStaff = staff.length > 0 ? staff : [];

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const filteredStaff = displayStaff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getContractStatusColor = (expiry?: string) => {
    if (!expiry) return "text-gray-700";
    return expiry.includes("1/2026") ? "text-red-600" : "text-gray-700";
  };

  const columns: TableColumn<Staff>[] = [
    {
      key: "name",
      title: "Full Name + Staff ID",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.name}</span>
          <span className="text-xs">({row.id})</span>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role/Position",
    },
    {
      key: "department",
      title: "Department",
    },
    {
      key: "contractStatus",
      title: "Contract Status",
      render: (_, row) => (
        <div>
          <span className="text-sm">{row.contractStatus}</span>
          {row.contractExpiry && (
            <span
              className={cn(
                "text-sm ml-2",
                getContractStatusColor(row.contractExpiry),
              )}
            >
              (Expires {row.contractExpiry})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => (
        <p
          className={cn(
            row.status === "active" && "text-main-blue",
            row.status === "on-leave" && "text-amber-600",
            row.status === "inactive" && "text-red-600",
          )}
        >
          {row.statusLabel}
        </p>
      ),
    },
    {
      key: "leaveDaysLeft",
      title: "Leave Days Left",
      render: (value) => `${value} Days`,
    },
  ];

  const actions: TableAction<Staff>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View Details",
            onClick: (row) => router.push(`/admin/staff-management/${row.id}`),
            icon: <Icon icon={ElearningExchangeIcon} size={16} />,
          },
          {
            label: "Edit Staff",
            onClick: (row) =>
              router.push(`/admin/staff-management/${row.id}/edit`),
            icon: <Icon icon={Edit01Icon} size={16} />,
          },
          {
            separator: true,
            label: "Print Profile",
            onClick: (row) => console.log("Print", row),
            icon: <Icon icon={PrinterIcon} size={16} />,
          },
        ],
      },
    },
  ];

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
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter by:
        </Button>
        <Button variant={"outline"} className="gap-2">
          <Icon icon={Csv02Icon} size={16} />
          Export Data
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredStaff}
          actions={actions}
          isLoading={isLoading}
          headerClassName="bg-main-blue/5"
          onRowClick={(row) => router.push(`/admin/staff-management/${row.id}`)}
          emptyMessage="No staff members found."
        />
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  );
}
