"use client";

import { AssignmentsIcon, ResourcesAddIcon } from "@hugeicons/core-free-icons";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Step, StepNavigation } from "@/components/ui/step-navigation";
import AssignmentConfiguration from "@/components/dashboard-pages/teacher/my-courses/views/assignment-configuration";
import AccessSubmissionRules from "@/components/dashboard-pages/teacher/my-courses/views/access-submission-rules";
import ContentBuilder, {
  Question,
} from "@/components/dashboard-pages/teacher/my-courses/views/content-builder";
import { useCreateCbtExamMutation } from "@/services/cbt-exams/cbt-exams";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { CbtQuestion } from "@/services/cbt-exams/cbt-exam-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type QuestionModel =
  | "multiple_choice"
  | "true/false"
  | "fill_in_the_blank";

export type StepId =
  | "assignment-configuration"
  | "access-submission-rules"
  | "content-builder";

const steps: Step[] = [
  {
    id: "assignment-configuration",
    label: "Assignment Configuration",
    icon: AssignmentsIcon,
  },
  {
    id: "access-submission-rules",
    label: "Access & Submission Rules",
    icon: ResourcesAddIcon,
  },
  {
    id: "content-builder",
    label: "Content Builder",
    icon: ResourcesAddIcon,
  },
];

export type QuestionBuilder = {
  title: string;
  subjectId: string;
  targetStudents: string;
  type: string;
  category: string;
  question_shuffle: string;
  answer_shuffle: string;
  totalMarks: number;
  dueDate: string;
  scheduled_time: string;
  timeLimit: number;
  submissionAttempts: number;
  showResultsToStudents: string;
  all_questions: Question[];
  applicable_grades: string[];
  applicable_subjects: string[];
  applicable_subjects_ids: string[];
  question_ids: string[];
};

export default function CreateNewQuestionsPage() {
  //view state handler
  const [currentStep, setCurrentStep] = useState<StepId>(
    "assignment-configuration",
  );
  const { replace } = useRouter();
  const user = useAppSelector(selectUser);
  const [question, setQuestion] = useState<QuestionBuilder>({
    title: "",
    subjectId: "",
    targetStudents: "",
    totalMarks: 0,
    dueDate: "",
    timeLimit: 1,
    submissionAttempts: 1,
    showResultsToStudents: "",
    all_questions: [],
    type: "test",
    category: "test",
    question_shuffle: "yes",
    answer_shuffle: "yes",
    applicable_grades: [],
    applicable_subjects: [],
    applicable_subjects_ids: [],
    question_ids: [],
    scheduled_time: "",
  });
  const [createExam, { isLoading: isCreatingExam }] =
    useCreateCbtExamMutation();

  console.log(question);

  //view change handler
  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId as StepId);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const publishExam = async (questionStatus: "published" | "draft") => {
    if (!user?.school_id) return;
    if (!question.subjectId || !question.targetStudents)
      return toast.error("Subject and Target Students are necessary");
    try {
      const res = await createExam({
        school_id: user?.school_id,
        title: question.title,
        category: question.category,
        // subject: question.title,
        subject: question.subjectId, //CHANGE
        // applicable_grades: "JSS 1, JSS 2, JSS 3", //⚠️
        applicable_grades: question.targetStudents,
        // applicable_subjects: "English, Mathematics", //⚠️CHANGE
        // applicable_subjects_ids: [
        //   "01kbjecg7k1srwa20vpjrrc54v",
        //   "01kbjkrzb4ryay019tvbqdrk3h",
        // ], //⚠️
        question_ids: [], //⚠️
        schedule_time: question.scheduled_time,
        schedule_date: question.dueDate,
        duration: question.timeLimit,
        total_questions: question.all_questions.length,
        assessment_type: "standard",
        type: question.type,
        status: questionStatus,
        questions: question.all_questions as CbtQuestion[],
        total_marks_available: 100,
        question_shuffle: question.question_shuffle === "yes" ? true : false,
        answer_shuffle: question.answer_shuffle === "yes" ? true : false,
        max_attempt: question.submissionAttempts,
        display_result: question.showResultsToStudents,
      }).unwrap();
      toast.success(
        res.message ? res.message : "New Quiz Created Successfully",
      );
      replace("/teacher/my-courses");
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case "assignment-configuration":
        return (
          <AssignmentConfiguration
            setCurrentStep={setCurrentStep}
            question={question}
            setQuestion={setQuestion}
            handleChange={handleChange}
          />
        );
      case "access-submission-rules":
        return (
          <AccessSubmissionRules
            question={question}
            setQuestion={setQuestion}
            handleChange={handleChange}
            setCurrentStep={setCurrentStep}
          />
        );
      case "content-builder":
        return (
          <ContentBuilder
            submit={publishExam}
            isLoading={isCreatingExam}
            updateQuestion={setQuestion}
          />
        );
      default:
        return (
          <AssignmentConfiguration
            setCurrentStep={setCurrentStep}
            question={question}
            setQuestion={setQuestion}
            handleChange={handleChange}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-6 py-3">
          <h1 className="text-2xl font-semibold text-[#1B1B1B] mb-2 lg:text-3xl">
            Create New Assignment/Quiz
          </h1>
          <p className="text-sm text-gray-600">
            This screen guides the teacher through setting up a digital
            assessment, including defining its type, scoring, and security
            rules.
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="px-2 xl:sticky">
              <StepNavigation
                steps={steps}
                activeStep={currentStep}
                onStepChange={handleStepChange}
                orientation="vertical"
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="px-6">{renderContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
