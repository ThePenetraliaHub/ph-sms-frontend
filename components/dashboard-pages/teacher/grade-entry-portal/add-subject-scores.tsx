"use client";

import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class } from "@/services/schools/schools-type";
import { TableData } from "@/app/(dashboard)/teacher/grade-entry-portal/record-results/page";

interface SubjectResult {
  subject: string;
  teacher_id: string;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setSubjectResults: React.Dispatch<React.SetStateAction<SubjectResult>>;
  subjectResults: SubjectResult;
  isFetchingClass: boolean;
  studentsClass: Class | undefined;
  selectedStudent: TableData | undefined;
  registerSubject: () => string | number | undefined;
  setSelectedStudent: React.Dispatch<
    React.SetStateAction<TableData | undefined>
  >;
}

export function AddSubjectScores({
  open,
  onOpenChange,
  setSubjectResults,
  subjectResults,
  isFetchingClass,
  studentsClass,
  selectedStudent,
  registerSubject,
  setSelectedStudent,
}: Props) {
  
  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    setSubjectResults({
      subject: "",
      teacher_id: "",
      class_score: 0,
      exam_score: 0,
      total_score: 0,
      grade: "",
      remarks: "",
    });
    setSelectedStudent(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubjectResults((prev) => ({ ...prev, [name]: value }));
    return;
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title={`Add Subject Scores for ${selectedStudent ? selectedStudent?.student : ""}`}
      size="3xl"
      maxHeight="lg"
      footer={
        <div className="grid grid-cols-1 mt-3 gap-3 w-full">
          <Button
            onClick={registerSubject}
            className="flex-1 opacity-100 disabled:opacity-50"
          >
            Register Result
          </Button>
        </div>
      }
    >
      <div className="space-y-4 h-full">
        {/* Subject */}
        <div className="space-y-2 w-full">
          <Label
            htmlFor="assessmentSelector"
            className="text-sm font-medium text-gray-700"
          >
            Subject
          </Label>
          <Select
            value={subjectResults.subject}
            onValueChange={(value) =>
              setSubjectResults((prev) => ({
                ...prev,
                subject: value,
              }))
            }
            disabled={isFetchingClass}
          >
            <SelectTrigger id="" className="w-full">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent className="">
              {studentsClass?.subjects.map((subject) => {
                return (
                  <SelectItem
                    key={subject.id}
                    value={subject.name}
                    className="w-full"
                  >
                    {subject.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Teacher */}
        <div className="space-y-2 w-full">
          <Label
            htmlFor="assessmentSelector"
            className="text-sm font-medium text-gray-700"
          >
            Teacher
          </Label>
          <Select
            value={subjectResults.teacher_id}
            onValueChange={(value) =>
              setSubjectResults((prev) => ({
                ...prev,
                teacher_id: value,
              }))
            }
            disabled={isFetchingClass}
          >
            <SelectTrigger className="w-full capitalize">
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent className="">
              {studentsClass?.teachers.map((teacher) => {
                return (
                  <SelectItem
                    key={teacher.id}
                    value={teacher.id}
                    className="w-full"
                  >
                    {teacher.full_name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* CA score */}
        <div className="space-y-2 w-full">
          <Label
            htmlFor="assessmentSelector"
            className="text-sm font-medium text-gray-700"
          >
            Continous Assessment Score (numbers only)
          </Label>
          <Input
            type="number"
            name="class_score"
            value={subjectResults.class_score}
            onChange={handleChange}
          />
        </div>

        {/* Exam Score */}
        <div className="space-y-2 w-full">
          <Label
            htmlFor="assessmentSelector"
            className="text-sm font-medium text-gray-700"
          >
            Exam Score (numbers only)
          </Label>
          <Input
            type="number"
            value={subjectResults.exam_score}
            onChange={handleChange}
            name="exam_score"
          />
        </div>

        {/* Total Score */}
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between gap-x-2">
            <Label
              htmlFor="assessmentSelector"
              className="text-sm font-medium text-gray-700"
            >
              Total Score
            </Label>
            <p className="italic text-xs capitalize text-muted-foreground">
              read only
            </p>
          </div>
          <Input
            type="number"
            readOnly
            value={subjectResults.total_score}
            className="cursor-not-allowed"
          />
        </div>

        {/* Grade */}
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between gap-x-2">
            <Label
              htmlFor="assessmentSelector"
              className="text-sm font-medium text-gray-700"
            >
              Grade
            </Label>
            <p className="italic text-xs capitalize text-muted-foreground">
              read only
            </p>
          </div>
          <Input
            type="text"
            readOnly
            value={subjectResults.grade}
            className="cursor-not-allowed"
          />
        </div>

        {/* Remarks */}
        <div className="space-y-2 w-full">
          <Label
            htmlFor="assessmentSelector"
            className="text-sm font-medium text-gray-700"
          >
            Remarks (optional)
          </Label>
          <Input
            type="text"
            value={subjectResults.remarks}
            placeholder="Excellent Score"
            onChange={(e) =>
              setSubjectResults((prev) => ({
                ...prev,
                remarks: e.target.value,
              }))
            }
          />
        </div>
      </div>
    </ModalContainer>
  );
}
