"use client";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DatePickerIcon from "@/components/ui/date-picker";
import { useState } from "react";

interface FinalizationApprovalFormProps {
  formData: {
    modifier: string;
    dateOfModification: Date | undefined;
    requiresHODApproval: boolean;
  };
  onFormDataChange: (
    data: Partial<FinalizationApprovalFormProps["formData"]>,
  ) => void;
  onBack: () => void;
  onActivate: () => void;
  isLoading: boolean;
}

export function FinalizationApprovalForm({
  formData,
  onFormDataChange,
  onBack,
  onActivate,
  isLoading
}: FinalizationApprovalFormProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Finalization and Approval
      </h3>

      {/* Audit Trail */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-800">Audit Trail</h4>

        <div className="grid lg:grid-cols-2 gap-2">
          <InputField
            label="Modifier"
            value={`Read only: ${formData.modifier}`}
            onChange={() => {}}
            placeholder="Read only: Admin"
            disabled
          />

          <DatePickerIcon
            label="Date of Modification"
            date={formData.dateOfModification}
            setDate={(date) => {
              onFormDataChange({
                dateOfModification:
                  typeof date === "function"
                    ? date(formData.dateOfModification)
                    : date,
              });
            }}
            open={datePickerOpen}
            setOpen={setDatePickerOpen}
            placeholder="mm/dd/yy"
          />
        </div>
      </div>

      {/* Requires HOD Approval */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-800">
          Requires HOD Approval
        </h4>
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-gray-600 flex-1">
            If ON, HOD must review and sign off before the outline is active.
          </p>
          <Checkbox
            checked={formData.requiresHODApproval}
            onCheckedChange={(checked) =>
              onFormDataChange({
                requiresHODApproval: checked === true,
              })
            }
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={isLoading} className="w-60 transition ease-in-out delay-100 disabled:opacity-50" onClick={onActivate}>
          Activate Subject
        </Button>
      </div>
    </div>
  );
}
