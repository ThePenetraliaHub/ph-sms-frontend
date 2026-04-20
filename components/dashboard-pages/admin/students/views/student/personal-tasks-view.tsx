"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { PersonalTaskList } from "@/components/dashboard-pages/student/dashboard/personal-task-list";
import { TaskCreationModal } from "@/components/dashboard-pages/student/dashboard/task-creation-modal";
import { toast } from "sonner";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";

interface PersonalTasksViewProps {
  stakeholder: Stakeholders;
}

export function PersonalTasksView({ stakeholder }: PersonalTasksViewProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const userId = stakeholder.user_id ?? stakeholder.user?.id;
  if (!userId) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No user linked to this student. Cannot load personal tasks.
      </div>
    );
  }

  const handleCreateTask = async (data: {
    task_name: string;
    task_type: any; // work needed here
    deadline: string | null;
  }) => {
    try {
      // await createTask({
      //   user_id: userId,
      //   task_name: data.task_name,
      //   task_type: data.task_type,
      //   deadline: data.deadline,
      // }).unwrap();
      toast.success("Task created successfully");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to create task";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Icon icon={Add01Icon} size={18} />
          Create Task for Student
        </Button>
      </div>
      <PersonalTaskList studentId={userId} />
      <TaskCreationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateTask}
        isLoading={false}
      />
    </div>
  );
}
