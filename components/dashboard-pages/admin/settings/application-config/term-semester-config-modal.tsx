"use client";

import { useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import DatePickerIcon from "@/components/ui/date-picker";

export interface TermDate {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface TermSemesterConfigModalProps {
  open: boolean;
  isUpdating: boolean;
  onOpenChange: (open: boolean) => void;
  numberOfTerms?: number;
  onConfirm?: (terms: TermDate[]) => void;
}

export function TermSemesterConfigModal({
  open,
  onOpenChange,
  numberOfTerms = 3,
  onConfirm,
  isUpdating,
}: TermSemesterConfigModalProps) {
  const [terms, setTerms] = useState<TermDate[]>(
    Array.from({ length: numberOfTerms }, () => ({
      startDate: undefined,
      endDate: undefined,
    })),
  );

  const [datePickerOpen, setDatePickerOpen] = useState<{
    [key: string]: boolean;
  }>({});

  const handleTermDateChange = (
    termIndex: number,
    field: "startDate" | "endDate",
    date: Date | undefined | ((prev: Date | undefined) => Date | undefined),
  ) => {
    const newTerms = [...terms];
    newTerms[termIndex] = {
      ...newTerms[termIndex],
      [field]:
        typeof date === "function" ? date(newTerms[termIndex][field]) : date,
    };
    setTerms(newTerms);
  };

  const getDatePickerSetOpen = (key: string) => {
    return (open: boolean | ((prev: boolean) => boolean)) => {
      setDatePickerOpen((prev) => ({
        ...prev,
        [key]: typeof open === "function" ? open(prev[key] || false) : open,
      }));
    };
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(terms);
    }
    // onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={onOpenChange}
      title="Term/Semester Configuration"
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            disabled={isUpdating}
            className="bg-main-blue text-white hover:bg-main-blue/90 disabled:opacity-50"
            onClick={handleConfirm}
          >
            {isUpdating ? "Updating..." : "Set Dates"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {terms.map((term, index) => (
          <div key={index} className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800">
              Term {index + 1}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <DatePickerIcon
                label="Start Date"
                date={term.startDate}
                setDate={(date) =>
                  handleTermDateChange(index, "startDate", date)
                }
                open={datePickerOpen[`start-${index}`] || false}
                setOpen={getDatePickerSetOpen(`start-${index}`)}
                placeholder="mm/dd/yy"
              />
              <DatePickerIcon
                label="End Date"
                date={term.endDate}
                setDate={(date) => handleTermDateChange(index, "endDate", date)}
                open={datePickerOpen[`end-${index}`] || false}
                setOpen={getDatePickerSetOpen(`end-${index}`)}
                placeholder="mm/dd/yy"
              />
            </div>
          </div>
        ))}
      </div>
    </ModalContainer>
  );
}
