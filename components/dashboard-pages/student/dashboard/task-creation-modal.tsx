"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ModalContainer } from "@/components/ui/modal-container";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import DatePickerIcon from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TaskCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    task_name: string;
    task_type: any;
    deadline: string | null;
  }) => void;
  isLoading?: boolean;
}

export function TaskCreationModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: TaskCreationModalProps) {
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState<any>("study");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = taskName.trim();
    if (!trimmedName) return;
    onSubmit({
      task_name: trimmedName,
      task_type: taskType,
      deadline: deadline ? format(deadline, "yyyy-MM-dd") : null,
    });
    setTaskName("");
    setTaskType("study");
    setDeadline(undefined);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTaskName("");
    setTaskType("study");
    setDeadline(undefined);
    onOpenChange(false);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={onOpenChange}
      title="Task Creation Modal"
      size="md"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="bg-main-blue text-white hover:bg-main-blue/90"
            onClick={handleSubmit}
            disabled={!taskName.trim() || isLoading}
          >
            {isLoading ? "Saving…" : "Save Task"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="taskName"
          label="Task Name"
          placeholder="Text Input (e.g., Review Biology Notes)"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />

        <div className="space-y-2">
          <Label htmlFor="taskType">Task Type</Label>
          <Select value={taskType} onValueChange={(v) => setTaskType(v as any)}>
            <SelectTrigger id="taskType" className="w-full">
              <SelectValue placeholder="Text Input (e.g., Study / Personal)" />
            </SelectTrigger>
            <SelectContent>
              {[].map((opt, index) => (
                <SelectItem key={index} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DatePickerIcon
          label="Due Date"
          date={deadline}
          setDate={setDeadline}
          placeholder="mm/dd/yy"
          open={datePickerOpen}
          setOpen={setDatePickerOpen}
        />
      </form>
    </ModalContainer>
  );
}
