"use client";

import { useState } from "react";
import { InputField, SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import DatePickerIcon from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

interface JobDetailsFormProps {
  formData: {
    vacancyTitle: string;
    department: string;
    employmentType: string;
    applicationDeadline: Date | undefined;
  };
  onFormDataChange: (data: Partial<JobDetailsFormProps["formData"]>) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function JobDetailsForm({
  formData,
  onFormDataChange,
  onNext,
  onCancel,
}: JobDetailsFormProps) {
  const [openApplicationDate, setOpenApplicationDate] =
    useState<boolean>(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Job Details & Identification
        </h3>

        <InputField
          label="Vacancy Title"
          placeholder='E.g., "JSS Science Teacher," "Senior Bursar."'
          value={formData.vacancyTitle}
          onChange={(e) => onFormDataChange({ vacancyTitle: e.target.value })}
          required
        />

        <InputField
          label="Category"
          placeholder="E.g., Finance, Technology, Marketing"
          value={formData.department}
          onChange={(e) => onFormDataChange({ department: e.target.value })}
          required
        />

        <SelectField
          label="Employment Type"
          value={formData.employmentType}
          onValueChange={(value) => onFormDataChange({ employmentType: value })}
          placeholder="Select either part-time, full-time or substitute teacher"
          required
        >
          <SelectItem value="full-time">Full-Time</SelectItem>
          <SelectItem value="part-time">Part-Time</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
          <SelectItem value="temporary">Temporary</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
          <SelectItem value="freelance">Freelance</SelectItem>
          <SelectItem value="permanent">Permanent</SelectItem>
        </SelectField>

        <DatePickerIcon
          open={openApplicationDate}
          setOpen={setOpenApplicationDate}
          label="Application Deadline"
          date={formData.applicationDeadline}
          setDate={(date) => {
            if (typeof date === "function") {
              onFormDataChange({
                applicationDeadline: date(formData.applicationDeadline),
              });
            } else {
              onFormDataChange({ applicationDeadline: date });
            }
          }}
          placeholder="mm/dd/yy"
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="w-60" type="submit">
          Next
        </Button>
      </div>
    </form>
  );
}
