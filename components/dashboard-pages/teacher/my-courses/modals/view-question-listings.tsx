"use client";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { ModalContainer } from "@/components/ui/modal-container";
import { Question } from "../views/content-builder";
import { toast } from "sonner";
import { QuestionBuilder } from "@/app/(dashboard)/teacher/my-courses/create-new-questions/page";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateQuestion: React.Dispatch<React.SetStateAction<QuestionBuilder>>;
  question: QuestionBuilder;
}

export default function ViewQuestionListings({
  onOpenChange,
  open,
  updateQuestion,
  question,
}: Props) {
  const tableData = question.all_questions;

  //handle modal close
  const handleCancel = () => {
    onOpenChange(false);
  };

  //handle questionRemoval
  const removeQuestion = (selectedQuestion: string) => {
    if (!selectedQuestion) return toast.error("Item not found!");
    const filterArr = question.all_questions.filter(
      (item) => item.question !== selectedQuestion,
    );
    updateQuestion((prev) => ({ ...prev, all_questions: filterArr }));
    handleCancel();
    toast.success("Question removed from list");
  };

  const columns: TableColumn<Question>[] = [
    {
      key: "question",
      title: "Question Snippet",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "answer_options",
      title: "Answer Options",
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
      key: "correct_answer",
      title: "Correct Answer",
      render: (value) => (
        <span className="text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "type",
      title: "Type",
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
              onClick={() => removeQuestion(row.question)}
              className="text-destructive hover:underline text-sm font-medium cursor-pointer"
            >
              Remove
            </p>
          </div>
        );
      },
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
