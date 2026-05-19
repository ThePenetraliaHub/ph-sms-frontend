"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { Search, Filter, MoreVertical } from "lucide-react";
import { Icon } from "@/components/general/huge-icon";
import { toast } from "sonner";
import {
  ElearningExchangeIcon,
  ViewIcon,
  PrinterIcon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import type { AdmissionApplication } from "@/services/shared-types";
import { getStakeholderStageLabel } from "@/services/stakeholders/stakeholders-selector";
import { useUpdateStakeholderMutation } from "@/services/stakeholders/stakeholders";
import { useDeleteUserMutation } from "@/services/users/users";

interface ApplicationTableProps {
  applications: AdmissionApplication[];
  onApplicationsChange: (applications: AdmissionApplication[]) => void;
}

export function ApplicationTable({
  applications,
  onApplicationsChange,
}: ApplicationTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);
  const [updateStakeholder] = useUpdateStakeholderMutation();
  const [removeUser, { isLoading }] = useDeleteUserMutation();

  const deleteUser = async (id: string) => {
    try {
      const res = await removeUser(id).unwrap();
      console.log(res);
    } catch {}
  };

  const handleStatusChange = async (
    applicationId: string,
    newStage: number,
    statusLabel: string,
  ) => {
    try {
      setUpdatingStage(applicationId);

      const result = await updateStakeholder({
        id: applicationId,
        data: {
          stage: newStage,
        } as any,
      }).unwrap();

      if (result.status) {
        const updatedApplications = applications.map((app) =>
          app.id === applicationId
            ? { ...app, stage: newStage, statusLabel }
            : app,
        );
        onApplicationsChange(updatedApplications);

        toast.success(`Status changed to "${statusLabel}" successfully`);
        router.refresh();
      } else {
        throw new Error(
          (result as { error?: string }).error || "Failed to update status",
        );
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Failed to update status. Please try again.";
      toast.error(errorMessage);
    } finally {
      setUpdatingStage(null);
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.admission_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false),
  );

  const getStatusFromStage = (
    stage: number,
  ): "new" | "pending" | "accepted" | "enrolled" => {
    if (stage === 1) return "new";
    if (stage >= 2 && stage <= 4) return "pending";
    if (stage === 5) return "accepted";
    if (stage === 6) return "enrolled";
    return "new";
  };

  const columns: TableColumn<AdmissionApplication>[] = [
    {
      key: "name",
      title: "Applicant Name",
      render: (_, row) => <span className="font-medium">{row.name}</span>,
      className: "border-r",
    },
    {
      key: "classApplyingFor",
      title: "Class Applying For",
      render: (_, row) => <span>{row.classApplyingFor || "—"}</span>,
      className: "border-r",
    },
    {
      key: "dateSubmitted",
      title: "Date/Time Submitted",
      render: (_, row) => (
        <span>
          {row.dateSubmitted}, {row.timeSubmitted}
        </span>
      ),
      className: "border-r",
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => (
        <StatusBadge
          status={getStatusFromStage(row.stage)}
          label={row.statusLabel}
        />
      ),
      className: "border-r",
    },
  ];

  const actions: TableAction<AdmissionApplication>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View details",
            onClick: (row) =>
              router.push(`/admin/admissions/${row.stakeholder_id}`),
            icon: <Icon icon={ViewIcon} size={16} />,
          },
          {
            label: "Change status",
            icon: <Icon icon={ElearningExchangeIcon} size={16} />,
            disabled: (row) => updatingStage === row.id,
            subItems: [
              {
                label: "Inquires/Interest",
                onClick: (row) => {
                  if (updatingStage === row.id || row.stage === 1) return;
                  handleStatusChange(row.id, 1, getStakeholderStageLabel(1));
                },
                disabled: (row) => updatingStage === row.id || row.stage === 1,
              },
              {
                label: "Application Started",
                onClick: (row) => {
                  if (updatingStage === row.id || row.stage === 2) return;
                  handleStatusChange(row.id, 2, getStakeholderStageLabel(2));
                },
                disabled: (row) => updatingStage === row.id || row.stage === 2,
              },
              {
                label: "Submitted Forms",
                onClick: (row) => {
                  if (updatingStage === row.id || row.stage === 3) return;
                  handleStatusChange(row.id, 3, getStakeholderStageLabel(3));
                },
                disabled: (row) => updatingStage === row.id || row.stage === 3,
              },
              {
                label: "Under Review",
                onClick: (row) => {
                  if (updatingStage === row.id || row.stage === 4) return;
                  handleStatusChange(row.id, 4, getStakeholderStageLabel(4));
                },
                disabled: (row) => updatingStage === row.id || row.stage === 4,
              },
              {
                label: "Accepted Offers",
                onClick: (row) => {
                  if (updatingStage === row.id || row.stage === 5) return;
                  handleStatusChange(row.id, 5, getStakeholderStageLabel(5));
                },
                disabled: (row) => updatingStage === row.id || row.stage === 5,
              },
              {
                label: "Enrolled/Confirmed",
                onClick: (row) => {
                  if (updatingStage === row.id || row.stage === 6) return;
                  handleStatusChange(row.id, 6, getStakeholderStageLabel(6));
                },
                disabled: (row) => updatingStage === row.id || row.stage === 6,
              },
            ],
            separator: true,
          },
          {
            label: "Print document",
            onClick: () => {},
            icon: <Icon icon={PrinterIcon} size={16} />,
            separator: true,
          },
          {
            label: "Remove student",
            onClick: (row) => deleteUser(row.stakeholder_id),
            icon: <Icon icon={Delete01Icon} size={16} />,
            separator: true,
          },
        ],
        trigger: (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        ),
        align: "end",
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative w0full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by applicant name, Application ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter by:
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredApplications}
          actions={actions}
          enableRowSelection={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          getRowId={(row) => row.id}
          headerClassName="bg-main-blue/5"
          showActionsColumn={true}
          actionsColumnTitle=""
          actionsColumnClassName="w-12"
        />
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  );
}
