"use client";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { ModalContainer } from "@/components/ui/modal-container";
import { Question } from "../views/content-builder";
import { Subject } from "@/services/subjects/subject-types";
import { TeacherCourse } from "@/app/(dashboard)/teacher/my-courses/page";
import { Dispatch, SetStateAction } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: TeacherCourse | undefined;
  setSubject: Dispatch<SetStateAction<TeacherCourse | undefined>>;
}

export default function ViewSubject({
  onOpenChange,
  open,
  subject,
  setSubject,
}: Props) {
  const tableData = subject ? [subject] : [];

  //handle modal close
  const handleCancel = () => {
    onOpenChange(false);
    setSubject(undefined);
  };

  const columns: TableColumn<TeacherCourse>[] = [
    {
      key: "code",
      title: "Subject Code",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "ca_score",
      title: "Tot. CA Score",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "exam_score",
      title: "Tot. Exam Score",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "credit_units",
      title: "Credit Units",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "applicableGrade",
      title: "Grade",
      render: (value: string[]) => (
        <div className="text-gray-700">
          {
            <ul className="flex flex-col gap-y-1">
              {value.map((item, index) => {
                return (
                  <span className="capitalize" key={index}>
                    {item}
                  </span>
                );
              })}
            </ul>
          }
        </div>
      ),
    },
    {
      key: "resources",
      title: "Resources (click to open)",
      render: (
        value: {
          created_at: string;
          file_link: string;
          format: string;
          id: string;
          name: string;
          type: string;
        }[],
      ) => (
        <div className="text-gray-700">
          {
            <ul className="flex flex-col gap-y-1">
              {value.map((item, index) => {
                return (
                  <a target="_blank" rel="noopener nonreferrer" className="hover:text-main-blue hover:underline transition ease-in-out delay-100 w-fit" href={item.file_link} key={index}>
                    {item.name}
                  </a>
                );
              })}
            </ul>
          }
        </div>
      ),
    },
  ];

  return (
    <ModalContainer
      open={open}
      title={"Questions Added Table"}
      onOpenChange={handleCancel}
      className="max-h-[400px] overflow-y-scroll"
      size="3xl"
      footer={
        <div className="grid grid-cols-1 gap-3 w-full">
          <Button className="h-9" variant="outline" onClick={handleCancel}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-7">
        <CardDescription className="text-center sm:text-left">
          This screen lists all the questions you've manually added.
        </CardDescription>
      </div>
      {/* data table */}
      <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={tableData}
          //   showActionsColumn={false}
          //   itemsPerPage={3}
          emptyMessage={"No questions added yet"}
        />
      </div>
      {/* load more button */}
      {/* <div className="w-full flex justify-center">
        <Button className="w-fit capitalize" variant={"outline"}>
          load more
        </Button>
      </div> */}
    </ModalContainer>
  );
}
