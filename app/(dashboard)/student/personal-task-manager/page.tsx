/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { PersonalTaskList } from "@/components/dashboard-pages/student/dashboard/personal-task-list";
import { TaskCreationModal } from "@/components/dashboard-pages/student/dashboard/task-creation-modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { useGetStudentByQueryParamQuery } from "@/services/stakeholders/stakeholders";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import {
  useCreateUserRequestMutation,
  useGetUserRequestsQuery,
} from "@/services/user-requests/user-requests";
import { CreateUserRequestRequest } from "@/services/user-requests/user-request-types";
// import { useMemo } from "react";

export interface PersonalTasks {
  id: string | null;
  taskName: string | null;
  taskType: string | null;
  deadline: string | null;
  status: string | null;
  _raw: any;
}

export default function PersonalTaskManagerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const { data: student, isLoading: isFetchingStudentId } =
    useGetStudentByQueryParamQuery(user?.id ?? "");
  const currStudent: Stakeholders | undefined = student?.data[0];
  //fetch request
  const {
    data: userRequests,
    isLoading: isGettingRequests,
    isFetching,
    error,
  } = useGetUserRequestsQuery();
  const allRequests = userRequests?.data;
  const filtered = allRequests?.filter(
    (request) => request.creator_id === currStudent?.user_id,
  );
  const personalTasks: PersonalTasks[] = filtered
    ? filtered?.map((item) => {
        return {
          id: item.id,
          taskName: item.description,
          taskType: `${item.title.slice(0, 1).toUpperCase()}${item.title.slice(1)}`,
          deadline: item.end_date,
          status: item.status === null ? "Pending" : item.status,
          _raw: "",
        };
      })
    : [];

  const tasksDueCount: number = personalTasks.filter(
    (item) => item.status === "Pending",
  ).length;

  const [createUserRequest, { isLoading }] = useCreateUserRequestMutation();

  const submitTask = async (data: {
    task_name: string;
    task_type: string;
    deadline: string | null;
  }) => {
    if (!user) return;
    if (!data.task_name || !data.task_type || !data.deadline) {
      return toast.error("Invalid field(s)");
    }
    try {
      const payload: CreateUserRequestRequest = {
        school_id: user.school_id ?? "",
        title: data.task_type,
        type: "others",
        description: data.task_name,
        end_date: data.deadline,
      };
      const res = await createUserRequest(payload).unwrap();
      if (res.status) toast.success("Personal Task created successfully");
    } catch (err) {
      console.error("ERROR: ", err);
      return;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Personal Task Manager
        </h1>
        <p className="text-gray-600">
          This feature allows students to create and track non-academic or
          self-assigned study tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Tasks Due"
          value={`${tasksDueCount} Tasks`}
          trend="up"
        />
        <MetricCard
          title="Completion Rate (Last 7 Days)"
          value={`1% Success`}
          trend="up"
        />
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Icon icon={Add01Icon} size={20} />
          Create New Personal Task
        </Button>
      </div>

      <PersonalTaskList
        isGettingRequests={isGettingRequests}
        error={error}
        isFetching={isFetching}
        isFetchingStudent={isFetchingStudentId}
        personalTasks={personalTasks}
      />
      {/* {currStudent?.user_id && (
      )} */}

      <TaskCreationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(data) => submitTask(data)}
        isLoading={isLoading}
      />
    </div>
  );
}
