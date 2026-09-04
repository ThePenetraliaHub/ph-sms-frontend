"use client";

import { InputField, TextareaField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AcademicDetailsState } from "./admission-form-state";

export function AcademicDetailsForm({
  value,
  onChange,
  onNext,
  onCancel,
}: {
  value: AcademicDetailsState;
  onChange: (next: AcademicDetailsState) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const formData = value;
  const setFormData = onChange;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Academic Details</h2>
      <p className="text-sm text-gray-600">
        Optional. Enter the applicant&apos;s academic history. These fields
        match the Academic History section in the admissions record.
      </p>

      <div className="space-y-6">
        <InputField
          id="currentPreviousSchool"
          label="Current/Previous School"
          placeholder="E.g., ABC Secondary School"
          value={formData.currentPreviousSchool}
          onChange={(e) =>
            setFormData({
              ...formData,
              currentPreviousSchool: e.target.value,
            })
          }
        />

        <div className="space-y-2">
          <Label htmlFor="lastGradeCompleted">Last Grade Completed</Label>
          <Select
            value={formData.lastGradeCompleted || "none"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                lastGradeCompleted: value === "none" ? "" : value,
              })
            }
          >
            <SelectTrigger id="lastGradeCompleted" className="w-full">
              <SelectValue placeholder="Select last completed grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="JSS 1">JSS 1</SelectItem>
              <SelectItem value="JSS 2">JSS 2</SelectItem>
              <SelectItem value="JSS 3">JSS 3</SelectItem>
              <SelectItem value="SSS 1">SSS 1</SelectItem>
              <SelectItem value="SSS 2">SSS 2</SelectItem>
              <SelectItem value="SSS 3">SSS 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="commonExamScore"
          label="Common Entrance Score"
          placeholder="E.g., 250 or N/A"
          value={formData.commonExamScore}
          onChange={(e) =>
            setFormData({
              ...formData,
              commonExamScore: e.target.value,
            })
          }
        />

        <TextareaField
          id="performanceHighlights"
          label="Performance Highlights"
          placeholder="E.g., Distinctions in Mathematics and Science, Sports achievements..."
          value={formData.performanceHighlights}
          onChange={(e) =>
            setFormData({
              ...formData,
              performanceHighlights: e.target.value,
            })
          }
          rows={3}
        />

        <TextareaField
          id="transferReason"
          label="Transfer Reason"
          placeholder="E.g., Relocation, seeking better academic environment..."
          value={formData.transferReason}
          onChange={(e) =>
            setFormData({
              ...formData,
              transferReason: e.target.value,
            })
          }
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onNext}
          className="w-60 bg-main-blue hover:bg-main-blue/90"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
