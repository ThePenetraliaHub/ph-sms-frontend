"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSubjectsQuery } from "@/services/subjects/subjects";
import { Subject } from "@/services/subjects/subject-types";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { useCreateCbtQuestionMutation } from "@/services/cbt-questions/cbt-questions";
import { CreateCBTQuestionPayload } from "@/services/cbt-questions/cbt-question-types";
import { toast } from "sonner";

export type Category =
  | "general"
  | "revision"
  | "exam"
  | "practice"
  | "quiz"
  | "homework"
  | "test";

interface CreateQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewScoredSubject({
  open,
  onOpenChange,
}: CreateQuestionModalProps) {
  //user data
  const user = useAppSelector(selectUser);
  const [assignedCourse, setAssignedCourse] = useState<string>("");
  const [targetStudent, setTargetStudent] = useState<string>("");
  const [questionModel, setQuestionModel] = useState<string>("");
  const [questionInstruction, setQuestionInstruction] = useState("");
  const [question, setQuestion] = useState<string>("");
  const [answerOptions, setAnswerOptions] = useState<string[]>([""]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [topicCovered, setTopicCovered] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [category, setCategory] = useState<Category>("general");
  const [tags, setTags] = useState<string>("");
  const term: string = user?.school.academic_term ?? "";
  const schoolId: string = user?.school_id ?? "";

  //fetch all subjects
  const {
    data: subjectsResponse,
    isLoading: isLoadingSubjects,
    isError: isLoadingSubjectErr,
  } = useGetSubjectsQuery({
    _all: true,
  });

  const subjectsList: Subject[] = useMemo(() => {
    const d = (subjectsResponse as { data?: Subject[] })?.data;
    return Array.isArray(d) ? d : [];
  }, [subjectsResponse]);

  //create cbt question
  const [createCBTQuestion, { isLoading: isCreatingQuestion }] =
    useCreateCbtQuestionMutation();

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setAssignedCourse("");
      setTargetStudent("");
      setQuestionModel("");
      setQuestionInstruction("");
      setQuestion("");
      setAnswerOptions([""]);
      setCorrectAnswer("");
      setTopicCovered("");
      setExplanation("");
      setCategory("general");
      setTags("");
    }
    onOpenChange(isOpen);
  };

  const handleAddOption = () => {
    setAnswerOptions([...answerOptions, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...answerOptions];
    newOptions[index] = value;
    setAnswerOptions(newOptions);
  };

  const handleSaveAndSubmit = async (
    questionStatus: "draft" | "rejected" | "pending" | "approved",
  ) => {
    if (!schoolId.trim()) return;
    if (!question.trim()) return toast.error("Please include question");
    if (isNaN(Number(topicCovered)) || isNaN(Number(correctAnswer)))
      return toast.error("Correct Ans or Topics Covered can only be numbers");
    // handleClose(false);
    if (
      answerOptions.length <= 1 ||
      !answerOptions[0].trim() ||
      !answerOptions[1].trim()
    )
      return toast.error("Include at least two answer options");

    //call endpoint
    const payload: CreateCBTQuestionPayload = {
      school_id: schoolId,
      question: question,
      subject: assignedCourse,
      correct_answer: Number(correctAnswer),
      status: questionStatus,
      category,
      type: questionModel as
        | "multiple_choice"
        | "fill_in_the_blank"
        | "true/false",
      instruction: questionInstruction,
      answer_options: answerOptions,
      topic_covered: Number(topicCovered),
      explanation,
      tag: tags.trim() ? tags : undefined,
      term,
    };
    try {
      const res = await createCBTQuestion(payload).unwrap();
      toast.success(
        res.message ? res.message : "Question created successfully!",
      );
      handleClose(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!subjectsList || !assignedCourse || subjectsList.length === 0) return;
    const selSubjectName = assignedCourse;
    //fetch the subject
    const subject = subjectsList.filter(
      (item) => item.name === selSubjectName,
    )[0];
    //set target grade
    const targetGrade = subject.applicable_grade?.join(", ") ?? "";
    setTargetStudent(targetGrade);
  }, [subjectsList, assignedCourse]);

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Create New Question"
      size="3xl"
      maxHeight="lg"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => handleSaveAndSubmit("draft")}
            className="flex-1"
          >
            Save as Draft
          </Button>
          <Button
            disabled={isCreatingQuestion}
            onClick={() => handleSaveAndSubmit("approved")}
            className="flex-1 opacity-100 disabled:opacity-50"
          >
            Save & Submit
          </Button>
        </div>
      }
    >
      <div className="space-y-4 h-full">
        <div className="space-y-2">
          <Label
            htmlFor="assignedCourse"
            className="text-sm font-medium text-gray-700"
          >
            Assign to Subject *{" "}
            {isLoadingSubjects
              ? "( 🟠 Loading... )"
              : isLoadingSubjectErr
                ? "( ❌ Subjects load failed )"
                : ""}
          </Label>
          <Select
            disabled={isLoadingSubjects || isLoadingSubjectErr}
            value={assignedCourse}
            onValueChange={(value) => setAssignedCourse(value)}
          >
            <SelectTrigger id="assignedCourse" className="w-full">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {subjectsList.map((subject) => {
                return (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="targetStudent"
              className="text-sm font-medium text-gray-700"
            >
              Target Students *
            </Label>
            <span className="text-xs text-gray-500">Read-only</span>
          </div>
          <Input
            id="targetStudent"
            type="text"
            placeholder="( Based on selected subject above )"
            value={targetStudent}
            readOnly
            className="bg-gray-50 cursor-not-allowed"
          />
        </div>

        {/* question model */}
        <div className="space-y-2">
          <Label
            htmlFor="questionModel"
            className="text-sm font-medium text-gray-700"
          >
            Select Question Model *
          </Label>
          <Select value={questionModel} onValueChange={setQuestionModel}>
            <SelectTrigger id="questionModel" className="w-full">
              <SelectValue placeholder="Dropdown Select: Multiple choice questions / True/False / Fill in the Blank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">
                Multiple Choice Questions
              </SelectItem>
              <SelectItem value="true/false">True/False</SelectItem>
              <SelectItem value="fill_in_the_blank">
                Fill in the Blank
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="questionInstruction"
            className="text-sm font-medium text-gray-700"
          >
            Question Instruction *
          </Label>
          <Textarea
            id="questionInstruction"
            placeholder="placeholder"
            value={questionInstruction}
            onChange={(e) => setQuestionInstruction(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="question"
            className="text-sm font-medium text-gray-700"
          >
            Question *
          </Label>
          <Textarea
            id="question"
            placeholder="placeholder"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="answerOptions"
            className="text-sm font-medium text-gray-700"
          >
            Answer Options *
          </Label>
          <div className="space-y-2">
            {answerOptions.map((option, index) => (
              <Textarea
                key={index}
                id={`answerOption-${index}`}
                placeholder="placeholder"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="min-h-20 resize-none"
              />
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                className="mt-2"
              >
                Add Another Option
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Correct Answer */}
          <div className="space-y-2">
            <Label
              htmlFor="correctAnswer"
              className="text-sm font-medium text-gray-700"
            >
              Correct Answer *
            </Label>
            <Input
              id="correctAnswer"
              type="number"
              placeholder="Number Input"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              min="1"
            />
          </div>

          {/* Topics Covered */}
          <div className="space-y-2">
            <Label
              htmlFor="topicCovered"
              className="text-sm font-medium text-gray-700"
            >
              No. of Topics Covered *
            </Label>
            <Input
              id="topicCovered"
              type="number"
              placeholder="Number Input (e.g., 2)"
              value={topicCovered}
              onChange={(e) => setTopicCovered(e.target.value)}
              min="1"
            />
          </div>
        </div>

        {/* explanation */}
        <div className="space-y-2">
          <Label
            htmlFor="answerOptions"
            className="text-sm font-medium text-gray-700"
          >
            Correct Answer Explanation *
          </Label>
          <Textarea
            id={`explanation`}
            placeholder="placeholder"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="min-h-20 resize-none"
          />
        </div>

        {/* category n tags */}
        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-gray-700"
            >
              Category *
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as Category)}
            >
              <SelectTrigger id="questionModel" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "general",
                  "revision",
                  "exam",
                  "practice",
                  "quiz",
                  "homework",
                  "test",
                ].map((item, index) => {
                  return (
                    <SelectItem className="capitalize" key={index} value={item}>
                      {item}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tag
            </Label>
            <Input
              id="tags"
              type="text"
              placeholder="Enter tags e.g /"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              min="1"
            />
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
