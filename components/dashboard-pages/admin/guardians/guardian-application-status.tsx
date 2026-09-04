import { Guardian } from "@/app/(dashboard)/admin/guardians/add/page";
import { Button } from "@/components/ui/button";
import DatePickerIcon from "@/components/ui/date-picker";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  guardian: Guardian;
  setGuardian: Dispatch<SetStateAction<Guardian>>;
  onSubmit: () => Promise<string | number | undefined>;
  isLoading: boolean;
}

export default function GuardianApplicationStatus({
  guardian,
  setGuardian,
  onSubmit,
  isLoading,
}: Props) {
  const [date, setDate] = useState<Date>();

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!date) return;
    const formattedDate = formatLocalDate(date);
    setGuardian((prev) => ({ ...prev, date_joined: formattedDate }));
  }, [date]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Other details</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initialStatus">Initial Status</Label>
          <Select
            value={guardian.status}
            onValueChange={(value) =>
              setGuardian((prev) => ({
                ...prev,
                status: value as "active" | "inactive",
              }))
            }
          >
            <SelectTrigger id="initialStatus" className="w-full">
              <SelectValue placeholder="Select applicant status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="emergencyContact"
          label="Phone 2 (Primary Contact 2)"
          placeholder="e.g. +23412347890"
          value={guardian.primary_contact}
          onChange={(e) =>
            setGuardian((prev) => ({
              ...prev,
              primary_contact: e.target.value,
            }))
          }
        />

        <TextareaField
          id="adminNotes"
          label="Admin Notes"
          placeholder="text"
          className=""
          // value={guardian}
          // onChange={(e) =>
          //   setGuardian((prev) => ({
          //     ...prev,
          //     emergency_contact: e.target.value,
          //   }))
          // }
          rows={4}
        />

        <DatePickerIcon
          label="Date Submitted"
          date={date}
          setDate={setDate}
          placeholder="yyyy-mm-dd"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-60 bg-main-blue disabled:opacity-70 hover:bg-main-blue/90"
        >
          {isLoading ? "Finalizing..." : "Finalize Application"}
        </Button>
      </div>
    </div>
  );
}
