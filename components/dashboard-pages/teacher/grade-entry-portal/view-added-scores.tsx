"use client";

import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { TableData } from "@/app/(dashboard)/teacher/grade-entry-portal/record-results/page";
import {
  DataTable,
  TableAction,
  TableColumn,
} from "@/components/ui/data-table";

interface SubjectResult {
  subject: string;
  teacher_id: string;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
}

interface Result {
  student_id: string;
  exam_id: string;
  term: string;
  session: string;
  class_name: string;
  grade: string;
  subject_results: SubjectResult[];
  total_score: number | string;
  average_score: number | string;
  position: number | string;
  teacher_remarks: string;
  principal_remarks: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: Result;
  removeSubjectResult: (subject: string) => void;
}

export function ViewAddedScores({
  open,
  onOpenChange,
  result,
  removeSubjectResult,
}: Props) {
  const handleClose = (isOpen: boolean) => {
    onOpenChange(false);
  };

  //DATA TABLE
  const columns: TableColumn<SubjectResult>[] = [
    {
      key: "subject",
      title: "Subject",
      render: (_v, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{row.subject}</span>
        </div>
      ),
    },
    {
      key: "class_score",
      title: "CA Score",
      render: (value, row) => <span>{row.class_score}</span>,
    },
    {
      key: "exam_score",
      title: "Exam Score",
      render: (value, row) => <span>{row.exam_score}</span>,
    },
    {
      key: "total_score",
      title: "Total Score",
      render: (value, row) => <span>{row.total_score}</span>,
    },
    {
      key: "grade",
      title: "Grade",
      render: (value, row) => <span>{row.grade}</span>,
    },
    {
      key: "remarks",
      title: "Remarks",
      render: (value, row) => <span>{row.remarks}</span>,
    },
  ];
  const actions: TableAction<SubjectResult>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "Clear Result",
            onClick: (row) => {
              removeSubjectResult(row.subject);
            },
            variant: "destructive",
          },
        ],
      },
    },
  ];

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title={"Scored Subjects"}
      size="3xl"
      maxHeight="lg"
      footer={
        <div className="grid grid-cols-1 mt-3 gap-3 w-full">
          <Button
            onClick={() => onOpenChange(false)}
            variant={"outline"}
            className="flex-1 opacity-100 disabled:opacity-50"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4 h-full">
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={result.subject_results}
            emptyMessage={"No subject result recorded yet."}
            actions={actions}
            showActionsColumn={true}
            actionsColumnTitle="Action"
          />
        </div>
      </div>
    </ModalContainer>
  );
}
