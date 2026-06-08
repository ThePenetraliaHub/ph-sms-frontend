"use client";

import { ModalContainer } from "@/components/ui/modal-container";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { GradingScaleConfig } from "@/services/schools/schools-type";

interface LetterGrade {
  id: string;
  gradeName: string;
  upperPercentage: number;
  lowerPercentage: number;
  gpaValue: number;
  remark: string;
}

interface LetterGradeDefinitionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditGrade?: (gradeId: string) => void;
  grades: GradingScaleConfig[] | undefined;
}

// const mockLetterGrades: LetterGrade[] = [
//   {
//     id: "1",
//     gradeName: "Grade A",
//     upperPercentage: 100,
//     lowerPercentage: 70,
//     gpaValue: 5.0,
//     remark: "Excellent Performance",
//   },
//   {
//     id: "2",
//     gradeName: "Grade B",
//     upperPercentage: 69,
//     lowerPercentage: 60,
//     gpaValue: 4.0,
//     remark: "Very Good Performance",
//   },
//   {
//     id: "3",
//     gradeName: "Grade C",
//     upperPercentage: 59,
//     lowerPercentage: 50,
//     gpaValue: 3.0,
//     remark: "Good Effort",
//   },
//   {
//     id: "4",
//     gradeName: "Grade D",
//     upperPercentage: 49,
//     lowerPercentage: 40,
//     gpaValue: 2.0,
//     remark: "Fair, Needs Improvement",
//   },
//   {
//     id: "5",
//     gradeName: "Grade E",
//     upperPercentage: 39,
//     lowerPercentage: 0,
//     gpaValue: 1.0,
//     remark: "Fail, Poor Performance",
//   },
// ];

export function LetterGradeDefinitionsModal({
  open,
  onOpenChange,
  onEditGrade,
  grades,
}: LetterGradeDefinitionsModalProps) {
  const columns: TableColumn<GradingScaleConfig>[] = [
    {
      key: "grade_name",
      title: "Grade Name",
      className: "font-medium",
    },
    {
      key: "upper_percentage",
      title: "Percentage Boundary (%)",
      render: (value, row) => (
        <span className="text-sm">
          {row.lower_percentage} - {row.upper_percentage}
        </span>
      ),
    },
    {
      key: "grade_point",
      title: "Numerical Grade Point (GPA Value)",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "remark",
      title: "Principal/HOD Remark",
      render: (value) => <span className="text-sm">{value}</span>,
    },
  ];

  const actions: TableAction<GradingScaleConfig>[] = [
    {
      type: "button",
      config: {
        label: "Remove Grade Level",
        variant: "link",
        className: "text-destructive underline underline-offset-3 h-auto",
        onClick: (row) => {
          if (onEditGrade) {
            onEditGrade(row.grade_name);
          }
        },
      },
    },
  ];

  return (
    <ModalContainer
      open={open}
      onOpenChange={onOpenChange}
      title="Letter Grade Definitions"
      size="4xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          This table defines the boundary for each letter grade used on report
          cards.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            <DataTable
              columns={columns}
              data={grades ?? []}
              actions={actions}
              emptyMessage="No letter grades defined."
              tableClassName="border-collapse"
            />
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
