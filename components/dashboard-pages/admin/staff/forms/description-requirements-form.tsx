"use client";

import { TextareaField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";

interface DescriptionRequirementsFormProps {
  formData: {
    publicSummary: string;
    fullJobDescription: string;
    mandatoryRequirements: string;
    preferredQualifications: string;
  };
  onFormDataChange: (
    data: Partial<DescriptionRequirementsFormProps["formData"]>,
  ) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function DescriptionRequirementsForm({
  formData,
  onFormDataChange,
  onNext,
  onBack,
  onCancel,
}: DescriptionRequirementsFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Description & Requirements
        </h3>

        <TextareaField
          label="Public Summary (Snippet)"
          placeholder="E.g., A short, compelling description used for external job board listings."
          value={formData.publicSummary}
          onChange={(e) => onFormDataChange({ publicSummary: e.target.value })}
          rows={4}
          required
        />

        <TextareaField
          label="Full Job Description"
          placeholder="Detailed responsibilities, using formatting tools."
          value={formData.fullJobDescription}
          onChange={(e) =>
            onFormDataChange({ fullJobDescription: e.target.value })
          }
          rows={6}
          required
        />

        <TextareaField
          label="Mandatory Requirements"
          placeholder="E.g., B.Ed. in Subject, 5 Years Experience, TRCN Certification."
          value={formData.mandatoryRequirements}
          onChange={(e) =>
            onFormDataChange({ mandatoryRequirements: e.target.value })
          }
          rows={4}
          required
        />

        <TextareaField
          label="Preferred Qualifications (optional)"
          placeholder='E.g., "Fluency in French a plus."'
          value={formData.preferredQualifications}
          onChange={(e) =>
            onFormDataChange({ preferredQualifications: e.target.value })
          }
          rows={3}
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
