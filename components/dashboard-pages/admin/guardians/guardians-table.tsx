"use client";

import { Dispatch, SetStateAction, useState } from "react";
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
  PencilEdit02Icon,
  LockPasswordIcon,
  ViewIcon,
  Csv02Icon,
  FilterIcon,
  User02FreeIcons,
  Delete01FreeIcons,
} from "@hugeicons/core-free-icons";
import { Parent } from "@/app/(dashboard)/admin/guardians/page";

interface Props {
  parents: Parent[];
  isLoading?: boolean;
  setFilterModal: Dispatch<SetStateAction<boolean>>;
  setOpenAssignWardsMod: Dispatch<SetStateAction<boolean>>;
  setOpenViewWardsMod: Dispatch<SetStateAction<boolean>>;
  setSelectedParent: Dispatch<SetStateAction<Parent | undefined>>;
  setParWardsOnSel: Dispatch<SetStateAction<string[]>>;
}

export function GuardiansTable({
  parents,
  isLoading = false,
  setFilterModal,
  setOpenAssignWardsMod,
  setOpenViewWardsMod,
  setSelectedParent,
  setParWardsOnSel,
}: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStudents = parents.filter(
    (parent) =>
      parent.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: Parent["status"]) => {
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

  const getStatusLabel = (status: Parent["status"]) => {
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

  const columns: TableColumn<Parent>[] = [
    {
      key: "name",
      title: "Full Name",
      render: (_, row) => (
        <span className="font-medium">
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (_, row) => <span className="">{row.email}</span>,
    },
    {
      key: "noOfWards",
      title: "Number of Wards",
      render: (_, row) => (
        <span className="capitalize">{row.wards.length}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={cn(
            "text-sm font-medium",
            getStatusColor(value as Parent["status"]),
          )}
        >
          {getStatusLabel(value as Parent["status"])}
        </span>
      ),
    },
    {
      key: "dateJoined",
      title: "Date Joined",
      className: "text-sm text-gray-600",
    },
  ];

  const actions: TableAction<Parent>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View guardian's profile",
            onClick: (row) => router.push(`/admin/guardians/${row.id}`),
            icon: <Icon icon={ViewIcon} size={16} />,
          },
          {
            separator: true,
            label: "Edit guadian profile",
            onClick: (row) => router.push(`/admin/guardians/${row.id}/edit`),
            icon: <Icon icon={PencilEdit02Icon} size={16} />,
          },
          {
            separator: true,
            label: "Assign Wards",
            onClick: (row) => {
              (setSelectedParent(row),
                setOpenAssignWardsMod(true),
                setParWardsOnSel([...row.wards]));
            },
            icon: <Icon icon={User02FreeIcons} size={16} />,
          },
          {
            separator: true,
            label: "View Wards",
            onClick: (row) => {
              (setSelectedParent(row), setOpenViewWardsMod(true));
            },
            icon: <Icon icon={ViewIcon} size={16} />,
          },
          {
            separator: true,
            label: "Reset Password",
            // onClick: (row) => console.log("Print", row),
            icon: <Icon icon={LockPasswordIcon} size={16} />,
          },
          {
            separator: true,
            label: "Delete Guardian",
            variant: "destructive",
            onClick: (row) => console.log("Print", row),
            icon: <Icon icon={Delete01FreeIcons} size={16} />,
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
            placeholder="Search guardian by name"
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
          emptyMessage="No guardians found."
        />
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>

      {/* assign parent modal */}
      {/* <AssignParent
        open={showAssignParMod}
        onOpenChange={setShowAssignParMod}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
      /> */}
    </div>
  );
}
