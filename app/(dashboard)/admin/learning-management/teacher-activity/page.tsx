"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { ActivityLogModal } from "@/components/dashboard-pages/admin/learning-management/component/activity-log-modal";

export default function TeacherActivityPage() {
  const [activityLogModalOpen, setActivityLogModalOpen] = useState(false);
  // const [selectedStaff, setSelectedStaff] =
  //   useState<TeacherActivityItem | null>(null);

  const columns: TableColumn<any>[] = [
    {
      key: "fullName",
      title: "Full Name + Staff ID",
      render: (value, row) => (
        <div>
          <p className="text-sm font-medium">{value}</p>
          <p className="text-xs text-gray-500">({row.staffId})</p>
        </div>
      ),
    },
    {
      key: "department",
      title: "Department",
      render: (value) => <span className="text-sm">{value || "—"}</span>,
    },
    {
      key: "lmsLogin",
      title: "LMS Login (Last 7 Days)",
      render: (value) => (
        <span className="text-sm">
          {value} {value === 1 ? "time" : "times"}
        </span>
      ),
    },
    {
      key: "complianceStatus",
      title: "Compliance",
      render: (value, row) => (
        <span className="text-sm font-medium">
          {value} ({row.complianceRate})
        </span>
      ),
    },
  ];

  const actions: TableAction<any>[] = [
    {
      type: "button",
      config: {
        label: "View Activity Log",
        onClick: (row) => {
          // setSelectedStaff(row);
          setActivityLogModalOpen(true);
        },
        variant: "link",
        className: "text-main-blue underline underline-offset-3 h-auto",
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Teacher Activity Audit & Compliance
        </h2>
        <p className="text-gray-600 mt-1">
          This screen allows to monitor the LMS usage, content submission, and
          engagement compliance of the entire teaching staff.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Lesson Plan Submission Rate"
          value={"0"}
          subtitle="Percentage of teachers with full compliance"
          trend="up"
        />
        <MetricCard
          title="Average Content Uploads"
          value={"0"}
          subtitle="Average submissions per teacher"
          trend="up"
        />
        <MetricCard
          title="Teachers Tracked"
          value={"0"}
          subtitle="Teaching staff in this school"
          trend="up"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Staff Audit Table
          </CardTitle>
          <p className="text-sm text-gray-600">
            The core tool for individual performance monitoring, sortable by
            compliance rate, department, or activity level.
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={[]}
              actions={actions}
              isLoading={false}
              emptyMessage="No staff activity data found."
              tableClassName="border-collapse"
            />
          </div>
        </CardContent>
      </Card>

      <ActivityLogModal
        open={activityLogModalOpen}
        onOpenChange={setActivityLogModalOpen}
        staffName={""}
        activities={[]}
        isLoading={false}
        isAddingNote={false}
        onAddAdministrativeNote={() => {}}
        onLoadMore={() => {}}
        hasMore={false}
      />
    </div>
  );
}
