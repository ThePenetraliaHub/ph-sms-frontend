"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import { Search01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { format, isPast, parseISO } from "date-fns";

export default function AdminStudentAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: TableColumn<any>[] = [
    {
      key: "assignmentName",
      title: "Assignment Name",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "subject",
      title: "Subject",
    },
    {
      key: "totalMarks",
      title: "Total Marks",
    },
    {
      key: "dueDateTime",
      title: "Due Date/Time",
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as string;
        const isOverdue = status === "Overdue";
        return (
          <span
            className={`text-sm ${isOverdue ? "text-red-600" : "text-orange-600"}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Student Assignments & Quizzes
        </h2>
        <p className="text-gray-600 mt-1">
          View and monitor assignments and quizzes across students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="Due Today" value={""} trend="up" />
        <MetricCard title="Due Tomorrow" value={""} trend="up" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Assignments & Quizzes
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon
                  icon={Search01Icon}
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  type="search"
                  placeholder="Search (e.g., Physics, Essay)"
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2" type="button">
                <Icon icon={FilterIcon} size={18} />
                Filter: All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable columns={columns} data={[]} showActionsColumn={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
