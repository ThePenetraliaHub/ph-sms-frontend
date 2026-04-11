"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

interface PersonalTaskListProps {
  studentId?: string;
}

export function PersonalTaskList({ studentId }: PersonalTaskListProps) {
  const handleMarkCompleted = async () => {};

  const columns: TableColumn<{
    id: string;
    taskName: string;
    taskType: string;
    deadline: string;
    status: string;
    _raw: any;
  }>[] = [
    {
      key: "taskName",
      title: "Task Name",
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    { key: "taskType", title: "Task Type" },
    { key: "deadline", title: "Deadline" },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as string;
        return (
          <span
            className={
              status === "Pending" ? "text-orange-600" : "text-green-600"
            }
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "action",
      title: "Action",
      render: (_value, row) => {
        if (row.status === "Pending") {
          return (
            <Button
              variant="link"
              className="h-auto p-0 text-main-blue"
              onClick={() => handleMarkCompleted()}
            >
              Mark Completed
            </Button>
          );
        }
        return <span className="text-gray-400">—</span>;
      },
    },
  ];

  if (false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            My Personal Task List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground text-sm">
            Loading tasks…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            My Personal Task List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-destructive text-sm">
            Failed to load tasks. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          My Personal Task List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={[]}
            showActionsColumn={false}
            emptyMessage="No personal tasks yet. Create one to get started."
          />
        </div>
      </CardContent>
    </Card>
  );
}
