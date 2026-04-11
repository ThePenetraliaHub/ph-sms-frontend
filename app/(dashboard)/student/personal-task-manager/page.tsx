"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { PersonalTaskList } from "@/components/dashboard-pages/student/dashboard/personal-task-list";
import { TaskCreationModal } from "@/components/dashboard-pages/student/dashboard/task-creation-modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useMemo } from "react";

export default function PersonalTaskManagerPage() {
  const user = useAppSelector(selectUser);
  const [modalOpen, setModalOpen] = useState(false);

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
        <MetricCard title="Tasks Due Today" value={`0 Tasks`} trend="up" />
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

      <PersonalTaskList />

      <TaskCreationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={() => {}}
        isLoading={false}
      />
    </div>
  );
}
