/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  useDeleteUserRequestMutation,
  useUpdateUserRequestMutation,
} from "@/services/user-requests/user-requests";
import { toast } from "sonner";
import { PersonalTasks } from "@/app/(dashboard)/student/personal-task-manager/page";

interface PersonalTaskListProps {
  error: any;
  isFetching: boolean;
  isGettingRequests: boolean;
  isFetchingStudent: boolean;
  personalTasks: PersonalTasks[];
}

export function PersonalTaskList({
  isFetchingStudent,
  error,
  isFetching,
  isGettingRequests,
  personalTasks,
}: PersonalTaskListProps) {
  //update request
  const [updateUserRequest, { isLoading: updatingRequest }] =
    useUpdateUserRequestMutation();
  //delete request
  const [deleteUserRequest, { isLoading: deletingRequest }] =
    useDeleteUserRequestMutation();

  const handleMarkCompleted = async (taskId: string) => {
    try {
      const res = await updateUserRequest({
        id: taskId,
        data: {
          status: "Completed",
        },
      }).unwrap();
      toast.success(res.message ? res.message : "Task updated successfully.");
    } catch {}
  };

  const handleStatusDelete = async (taskId: string) => {
    try {
      const res = await deleteUserRequest(taskId).unwrap();
      console.log(res);
      toast.success(res.message ? res.message : "Task deleted successfully");
    } catch {}
  };

  const columns: TableColumn<PersonalTasks>[] = [
    {
      key: "taskName",
      title: "Task Name",
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    { key: "taskType", title: "Task Type" },
    {
      key: "deadline",
      title: "Deadline",
    },
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
            <div className="flex flex-col gap-y-1 items-start">
              <Button
                variant="link"
                className="h-auto p-0 text-main-blue"
                onClick={() => handleMarkCompleted(row.id ?? "")}
              >
                Mark Completed
              </Button>
              <Button
                variant="link"
                className="h-auto p-0 text-destructive"
                onClick={() => handleStatusDelete(row.id ?? "")}
              >
                Remove Task
              </Button>
            </div>
          );
        }
        return <span className="text-gray-400">—</span>;
      },
    },
  ];

  if (
    isGettingRequests ||
    isFetching ||
    isFetchingStudent ||
    updatingRequest ||
    deletingRequest
  ) {
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

  if (error) {
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
            data={personalTasks ?? []}
            showActionsColumn={false}
            emptyMessage="No personal tasks yet. Create one to get started."
          />
        </div>
      </CardContent>
    </Card>
  );
}
