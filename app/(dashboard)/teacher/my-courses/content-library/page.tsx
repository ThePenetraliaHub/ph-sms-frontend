"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

interface ResourceRow {
  id: string;
  resourceName: string;
  subject: string;
  class: string;
  fileType: string;
  status: "pending" | "approved" | "draft" | "rejected";
}

function mapStatus(s: string): ResourceRow["status"] {
  if (s === "pending_review") return "pending";
  if (s === "approved") return "approved";
  return "draft";
}

function getStatusColor(status: ResourceRow["status"]) {
  switch (status) {
    case "pending":
      return "text-orange-600";
    case "approved":
      return "text-green-600";
    case "rejected":
      return "text-main-blue";
    default:
      return "text-blue-600";
  }
}

function getStatusLabel(status: ResourceRow["status"]) {
  switch (status) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved / Published";
    case "rejected":
      return "Rejected";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

export default function ContentLibraryPage() {
  const columns: TableColumn<ResourceRow>[] = [
    { key: "resourceName", title: "Resource Name", className: "font-medium" },
    {
      key: "fileType",
      title: "File Type",
      render: (v) => <span className="text-sm">{v}</span>,
    },
    {
      key: "courseLocation",
      title: "Course Location",
      render: (v) => <span className="text-sm">{v}</span>,
    },
    {
      key: "submittedBy",
      title: "Submitted By",
      render: (v) => <span className="text-sm">{v}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => (
        <span className={cn("text-sm font-medium", getStatusColor(row.status))}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
  ];

  const actions: TableAction<ResourceRow>[] = [
    {
      type: "button",
      config: {
        label: "Review Content",
        onClick: () => {},
        variant: "link",
        className: "text-main-blue underline underline-offset-3 h-auto",
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">My Content Library</h2>
        <p className="text-gray-600 mt-1">
          The teacher&apos;s personal archive and management screen for all
          digital resources uploaded to the Learning Management System (LMS).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="Total Files" value={""} trend="up" />
        <MetricCard title="Needs Attention" value={""} trend="up" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Resource Management Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={[]}
              actions={actions}
              isLoading={false}
              emptyMessage="No resources found."
              tableClassName="border-collapse"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
