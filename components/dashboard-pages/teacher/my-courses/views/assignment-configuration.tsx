import { SelectItem } from "@/components/ui/select";
import { InputField, SelectField } from "@/components/ui/input-field";
import DatePickerIcon from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Subject } from "@/services/subjects/subject-types";
import { useGetSubjectsQuery } from "@/services/subjects/subjects";
import { useEffect, useMemo, useState } from "react";
import {
  QuestionBuilder,
  StepId,
} from "@/app/(dashboard)/teacher/my-courses/create-new-questions/page";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Props {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  question: QuestionBuilder;
  setQuestion: React.Dispatch<React.SetStateAction<QuestionBuilder>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<StepId>>;
}

const typeOps: string[] = ["test", "quiz", "practice", "homework"]; //HOW
const categoryOps: string[] = ["test", "exam", "assignment", "mock"]; //WHAT

export default function AssignmentConfiguration({
  handleChange,
  question,
  setQuestion,
  setCurrentStep,
}: Props) {
  const { data: subjectsResponse, isLoading } = useGetSubjectsQuery({
    _all: true,
  });
  const subjectsList: Subject[] = useMemo(() => {
    const d = (subjectsResponse as { data?: Subject[] })?.data;
    return Array.isArray(d) ? d : [];
  }, [subjectsResponse]);

  const [selDate, setSelDate] = useState<Date>();

  const handleNext = () => {
    if (
      !question.title.trim() ||
      !question.subjectId ||
      !question.totalMarks ||
      !question.dueDate
    )
      return toast.error("All fields are required");

    if (isNaN(Number(question.totalMarks)))
      return toast.error("Total marks has to be number");
    setCurrentStep("access-submission-rules");
  };

  useEffect(() => {
    if (!subjectsList || !question.subjectId || subjectsList.length === 0)
      return;
    const selSubjectId = question.subjectId;
    //fetch the subject
    const subject = subjectsList.filter((item) => item.id === selSubjectId)[0];
    //set target grade
    const targetGrade = subject.applicable_grade?.join(", ") ?? "";
    setQuestion((prev) => ({ ...prev, targetStudents: targetGrade }));
  }, [subjectsList, question.subjectId]);

  useEffect(() => {
    if (!selDate) return;
    const formatted = selDate.toISOString().split("T")[0];
    setQuestion((prev) => ({ ...prev, dueDate: formatted }));
  }, [selDate]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Assignment Configuration
      </h2>
      <div className="space-y-6 w-full mt-5">
        {/* title */}
        <InputField
          label="Title"
          name="title"
          value={question.title}
          required
          onChange={handleChange}
          placeholder="e.g. Algebra Unit Review Quiz"
        />
        {/* assign to course */}
        <SelectField
          label="Assign to Subject"
          value={question.subjectId}
          onValueChange={(value) =>
            setQuestion((prev) => ({ ...prev, subjectId: value }))
          }
          disabled={isLoading}
          placeholder="Select Subject"
        >
          {subjectsList.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectField>
        {/* target student */}
        <InputField
          label="Target Students"
          required
          className="cursor-not-allowed"
          value={question.targetStudents}
          readOnly
        />
        {/* total marks */}
        <InputField
          label="Total Marks"
          required
          value={question.totalMarks}
          onChange={handleChange}
          name="totalMarks"
          placeholder="Number Input (e.g., 25)"
        />
        {/* type */}
        <SelectField
          label="Type *"
          value={question.type}
          onValueChange={(value) => {
            setQuestion((prev) => ({ ...prev, type: value }));
          }}
          placeholder="Select how the exam runs"
        >
          {typeOps.map((option) => (
            <SelectItem className="capitalize" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectField>
        {/* category */}
        <SelectField
          label="Category *"
          value={question.category}
          onValueChange={(value) => {
            setQuestion((prev) => ({ ...prev, category: value }));
          }}
          placeholder="Select what kind of assessment this is"
        >
          {categoryOps.map((option) => (
            <SelectItem className="capitalize" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectField>
        {/* Due Date */}
        <div className="flex gap-x-2 items-center">
          <DatePickerIcon
            label="Due Date"
            date={selDate}
            setDate={(date) => {
              setSelDate(typeof date === "function" ? date(selDate) : date);
            }}
            placeholder="mm/dd/yy"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Time</label>
            <Input
              type="time"
              value={question.scheduled_time}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  scheduled_time: e.target.value,
                }))
              }
              className="border-input cursor-pointer text-sm"
            />
          </div>
        </div>
        {/* action btns */}
        <div className="flex justify-end gap-3 pt-4">
          {/* <Button variant="outline">Back</Button> */}
          <Button className="w-60" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
