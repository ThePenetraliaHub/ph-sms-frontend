"use client";
import { AssignmentSubmission } from "@/app/(dashboard)/teacher/my-courses/page";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { ModalContainer } from "@/components/ui/modal-container";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssignment: AssignmentSubmission;
}

interface ScoreInput {
  id: string;
  name: string;
  gender: string;
  computeScore: number | string;
}

export default function ScoreInputGrid({
  onOpenChange,
  open,
  selectedAssignment,
}: Props) {
  const mockScoreInputGrid: ScoreInput[] = [
    {
      id: "178031",
      name: "Sola Adebayo",
      gender: "M",
      computeScore: 20,
    },
    {
      id: "178032",
      name: "Helen Davies",
      gender: "F",
      computeScore: 14,
    },
    {
      id: "178033",
      name: "Tolu Adebayo",
      gender: "M",
      computeScore: 17,
    },
    {
      id: "178034",
      name: "Biodun Eke",
      gender: "F",
      computeScore: 18,
    },
  ];
  const tableData = mockScoreInputGrid;
  const isError = true;
  //handle modal close
  const handleCancel = () => {
    onOpenChange(false);
    // setSelectedAssignment(undefined);
  };

  const columns: TableColumn<ScoreInput>[] = [
    {
      key: "name",
      title: "Name & Student ID",
      render: (value, row) => (
        <div>
          <span className="font-medium text-gray-800">{value as string}</span>
          <p className="text-sm">{`${row.name.split(" ")[1].toLowerCase()}.${row.gender.toLowerCase()}${row.id}`}</p>
        </div>
      ),
    },
    {
      key: "computeScore",
      title: "Compute Score",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    //score entry
    {
      key: "action",
      title: "Score Entry",
      render: (value, row) => {
        return (
          <div className="flex items-center gap-3">
            {/* <p
              //   href={`/teacher/my-class?course=${row.id}`}
              onClick={() => {
                toast.success(`${row.name} has been clicked selected!`);
                // setSelectedAssignment(row);
                // onOpenChange(false);
              }}
              className="text-main-blue hover:underline text-sm font-medium cursor-pointer"
            >
              Score Assignment
            </p> */}
            <Input type="text" className="text-sm" />
          </div>
        );
      },
    },
    //teacher's remark
    {
      key: "action",
      title: "Teacher's Remarks",
      render: (value, row) => {
        return (
          <div className="flex items-center gap-3">
            {/* <p
              //   href={`/teacher/my-class?course=${row.id}`}
              onClick={() => {
                toast.success(`${row.name} has been clicked selected!`);
                // setSelectedAssignment(row);
                // onOpenChange(false);
              }}
              className="text-main-blue hover:underline text-sm font-medium cursor-pointer"
            >
              Score Assignment
            </p> */}
            <Input type="text" className="text-sm" />
          </div>
        );
      },
    },
  ];

  return (
    <ModalContainer
      open={open}
      title={"Score Input Grid"}
      onOpenChange={handleCancel}
      size="3xl"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button className="h-12" variant="outline">
            Save as Draft
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
          Selected: {selectedAssignment.name}
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
