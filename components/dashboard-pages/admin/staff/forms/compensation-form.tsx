"use client";

import { InputField, TextareaField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";

interface CompensationFormProps {
  formData: {
    salaryRange: string;
    allowances: string;
    recruitmentBudget: string;
  };
  onFormDataChange: (data: Partial<CompensationFormProps["formData"]>) => void;
  onSubmit: () => void;
  onBack: () => void;
  onCancel: () => void;
  isCreatingJob: boolean;
}

export function CompensationForm({
  formData,
  onFormDataChange,
  onSubmit,
  isCreatingJob,
  onBack,
  onCancel,
}: CompensationFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Compensation & Internal Budget
        </h3>
        <p className="text-sm text-gray-600">
          This sensitive information is for internal use, recruitment analysis,
          and payroll budget approval.
        </p>

        <InputField
          label="Salary/Salary Range"
          placeholder="Budgeted range for the role (e.g. N300,000 - N400,000)"
          value={formData.salaryRange}
          onChange={(e) => onFormDataChange({ salaryRange: e.target.value })}
          required
        />

        <TextareaField
          label="Allowances"
          placeholder="E.g., Housing Allowance, Transport Allowance"
          value={formData.allowances}
          onChange={(e) => onFormDataChange({ allowances: e.target.value })}
          rows={3}
        />

        <InputField
          label="Recruitment Budget (Digits Only)"
          placeholder="Total amount allocated for advertising, agency fees, etc. (e.g. 200000)"
          value={formData.recruitmentBudget}
          onChange={(e) =>
            onFormDataChange({ recruitmentBudget: e.target.value })
          }
          required
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={isCreatingJob}
          className="w-60 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
        >
          {isCreatingJob ? "Submitting" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
