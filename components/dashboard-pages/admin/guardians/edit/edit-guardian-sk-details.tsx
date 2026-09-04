import { Guardian } from "@/app/(dashboard)/admin/guardians/[id]/edit/page";
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
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  guardian: Guardian;
  setGuardian: Dispatch<SetStateAction<Guardian>>;
  onSubmit: () => Promise<string | number | undefined>;
  isLoading: boolean;
  //   parent: Stakeholders | undefined;
}

export default function EditGuardianSkDetails({
  guardian,
  setGuardian,
  onSubmit,
  isLoading,
  //   parent,
}: Props) {
  const { replace } = useRouter();
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
      <h2 className="text-xl font-semibold text-gray-800">
        Update Other Information
      </h2>

      <div className="space-y-4">
        {/* status */}
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

        {/* primary contact */}
        <InputField
          id="primaryContact"
          label="Phone 2 (Primary Contact)"
          placeholder="e.g. +23412347890"
          value={guardian.primary_contact}
          onChange={(e) =>
            setGuardian((prev) => ({
              ...prev,
              primary_contact: e.target.value,
            }))
          }
        />

        {/* emergency contact */}
        <InputField
          id="emergencyContact"
          label="Emergency Contact"
          placeholder="e.g. +23412347890"
          value={guardian.emergency_contact}
          onChange={(e) =>
            setGuardian((prev) => ({
              ...prev,
              emergency_contact: e.target.value,
            }))
          }
        />

        {/* occupation */}
        <InputField
          id="occupation"
          label="Occupation"
          placeholder="e.g. Plumber"
          value={guardian.occupation}
          onChange={(e) =>
            setGuardian((prev) => ({
              ...prev,
              occupation: e.target.value,
            }))
          }
        />

        {/* admin notes */}
        <TextareaField
          id="adminNotes"
          label="Admin Notes"
          placeholder="text"
          className=""
          value={guardian.admin_notes}
          onChange={(e) =>
            setGuardian((prev) => ({
              ...prev,
              admin_notes: e.target.value,
            }))
          }
          rows={4}
        />

        {/* date joined */}
        <DatePickerIcon
          label={`Date Submitted - ( Prev - ${format(guardian.date_joined, "MMM dd, yyyy")} )`}
          date={date}
          setDate={setDate}
          placeholder="yyyy-mm-dd"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => replace("/admin/guardians")}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-60 bg-main-blue disabled:opacity-70 hover:bg-main-blue/90"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
