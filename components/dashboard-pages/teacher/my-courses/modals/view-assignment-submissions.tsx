"use client";
import { AssignmentSubmission } from "@/app/(dashboard)/teacher/my-courses/page";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { ModalContainer } from "@/components/ui/modal-container";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setSelectedAssignment: Dispatch<
    SetStateAction<AssignmentSubmission | undefined>
  >;
}

export default function ViewAssignmentSubmissions({
  onOpenChange,
  open,
  setSelectedAssignment,
}: Props) {
  const mockAssignmentSubmissions: AssignmentSubmission[] = [
    {
      id: "1",
      name: "Mid-Term Exam",
      subject: "JSS2 Mathematics",
      submitted: "40/45",
      marks: "25",
    },
    {
      id: "2",
      name: "Unit 4: Quiz",
      subject: "SSS1 Physics",
      submitted: "40/45",
      marks: "20",
    },
    {
      id: "3",
      name: "Project: Energy Sources",
      subject: "JSS 3 Integrated Science",
      submitted: "40/45",
      marks: "40",
    },
    {
      id: "4",
      name: "CA 1: Atomic Structure",
      subject: "SSS2 Chemistry",
      submitted: "40/45",
      marks: "40",
    },
  ];
  const tableData = mockAssignmentSubmissions;
  const isError = true;
  //handle modal close
  const handleCancel = () => {
    onOpenChange(false);
    setSelectedAssignment(undefined);
  };

  const columns: TableColumn<AssignmentSubmission>[] = [
    {
      key: "name",
      title: "Assignment Name",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "subject",
      title: "Subject/Class",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "submitted",
      title: "Submitted",
      render: (value) => (
        <span className="text-gray-700">{value as number}</span>
      ),
    },
    {
      key: "marks",
      title: "Assignment Total Marks",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <div className="flex items-center gap-3">
            <p
              //   href={`/teacher/my-class?course=${row.id}`}
              onClick={() => {
                toast.success(`${row.subject} has been clicked selected!`);
                setSelectedAssignment(row);
                onOpenChange(false);
              }}
              className="text-main-blue hover:underline text-sm font-medium cursor-pointer"
            >
              Score Assignment
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <ModalContainer
      open={open}
      title={"Assignment Submissions"}
      onOpenChange={handleCancel}
      size="3xl"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full hidden">
          <Button className="h-12" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="bg-main-blue h-12 text-white hover:bg-main-blue/90"
            // onClick={handleSubmit}
            // disabled={!isFormValid}
          >
            Upload & Submit
          </Button>
        </div>
      }
    >
      <div
        // onSubmit={handlePasswordUpdate}
        className="space-y-7"
      >
        <CardDescription className="text-center sm:text-left">
          This screen lists all student assignment and quizzes
        </CardDescription>
      </div>
      {/* data table */}
      <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={tableData}
          //   showActionsColumn={false}
          //   itemsPerPage={3}
          emptyMessage={
            isError
              ? "Unable to load courses at the moment."
              : "No courses found."
          }
        />
      </div>
      {/* load more button */}
      <div className="w-full flex justify-center">
        <Button className="w-fit capitalize" variant={"outline"}>
          load more
        </Button>
      </div>
    </ModalContainer>
  );
}
