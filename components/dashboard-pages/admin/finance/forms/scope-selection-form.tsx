"use client";

import { useState } from "react";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import DatePickerIcon from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectTerm } from "@/store/slices/schoolSlice";

interface ScopeSelectionFormProps {
  schoolClasses: string[];
  formData: {
    startInvoiceNumber: string;
    academicTerm: string;
    gradeClass: string;
    amount: string;
    paymentDeadline: Date | undefined;
    note: string;
  };
  onFormDataChange: (
    data: Partial<ScopeSelectionFormProps["formData"]>,
  ) => void;
  onNext: () => void | Promise<void>;
  onCancel: () => void;
  isPreviewLoading?: boolean;
}

export function ScopeSelectionForm({
  schoolClasses,
  formData,
  onFormDataChange,
  onNext,
  onCancel,
  isPreviewLoading = false,
}: ScopeSelectionFormProps) {
  const [openPaymentDeadline, setOpenPaymentDeadline] =
    useState<boolean>(false);
  const term = useAppSelector(selectTerm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNext();
  };

  const canPreview =
    schoolClasses.length > 0 && formData.academicTerm.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-800">
          Configuration and Scope Selection
        </h3>

        <InputField
          label="Start Invoice Number"
          placeholder="E.g., 2025-T2-0001"
          value={formData.startInvoiceNumber}
          onChange={(e) =>
            onFormDataChange({ startInvoiceNumber: e.target.value })
          }
          required
        />

        <div className="space-y-1">
          <InputField
            label="Academic Term"
            placeholder={
              formData.academicTerm.trim()
                ? undefined
                : "Waiting for school term…"
            }
            value={formData.academicTerm}
            readOnly
            disabled
            title={formData.academicTerm}
          />
          {term?.session ? (
            <p className="text-xs text-muted-foreground">
              Session: {term.session}
            </p>
          ) : null}
        </div>

        <SelectField
          label="Grade/Class"
          value={formData.gradeClass}
          onValueChange={(value) => onFormDataChange({ gradeClass: value })}
          placeholder={
            schoolClasses.length === 0
              ? "No classes on this school record"
              : "Select grade or class"
          }
          required
          disabled={schoolClasses.length === 0}
        >
          {schoolClasses.map((className) => (
            <SelectItem key={className} value={className}>
              {className}
            </SelectItem>
          ))}
        </SelectField>
        {schoolClasses.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No classes uploaded to the school.
          </p>
        )}

        <InputField
          label="Invoice amount (per student, ₦)"
          placeholder="E.g., 50000"
          type="number"
          min={1}
          step={1}
          value={formData.amount}
          onChange={(e) => onFormDataChange({ amount: e.target.value })}
          required
        />

        <DatePickerIcon
          open={openPaymentDeadline}
          setOpen={setOpenPaymentDeadline}
          label="Payment Deadline"
          date={formData.paymentDeadline}
          setDate={(date) => {
            if (typeof date === "function") {
              onFormDataChange({
                paymentDeadline: date(formData.paymentDeadline),
              });
            } else {
              onFormDataChange({ paymentDeadline: date });
            }
          }}
          placeholder="mm/dd/yy"
        />

        <TextareaField
          label="Note on Invoice (optional)"
          placeholder='E.g., "Late payment penalty of 5% applies after due date."'
          value={formData.note}
          onChange={(e) => onFormDataChange({ note: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-60"
          disabled={isPreviewLoading || !canPreview}
        >
          {isPreviewLoading ? "Loading preview…" : "Preview Recipients"}
        </Button>
      </div>
    </form>
  );
}
