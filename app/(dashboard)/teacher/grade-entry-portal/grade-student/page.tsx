"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  AssignmentsIcon,
  Book01Icon,
  ResourcesAddIcon,
} from "@hugeicons/core-free-icons";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { useGetClassQuery } from "@/services/schools/schools";
import { Class, School } from "@/services/schools/schools-type";
import { useGetStudentByQueryParamQuery } from "@/services/stakeholders/stakeholders";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { toast } from "sonner";
import { useCreateResultsMutation } from "@/services/results/results";
import { CreateResultParams } from "@/services/results/result-types";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface Subject {
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
  subject_results: Subject[];
  total_score: number | string;
  average_score: number | string;
  position: number | string;
  teacher_remarks: string;
  principal_remarks: string;
}

type StepId = "general-config" | "subject-results" | "remarks";

const steps: Step[] = [
  {
    id: "general-config",
    label: "General Config",
    icon: AssignmentsIcon,
  },
  {
    id: "subject-results",
    label: "Results",
    icon: ResourcesAddIcon,
  },
  {
    id: "remarks",
    label: "Remarks",
    icon: Book01Icon,
  },
];

const initialData = {
  student_id: "",
  exam_id: "",
  term: "",
  session: "",
  class_name: "",
  grade: "",
  subject_results: [] as Subject[],
  total_score: 0,
  average_score: 0,
  position: 0,
  teacher_remarks: "",
  principal_remarks: "",
};

//GET RESULTS
// IF NONE MATCHES, SEND ALL. IF THERE IS A MATCH, RUN EDIT INSTEAD

export default function GradeStudent() {
  const { replace } = useRouter();
  const user = useAppSelector(selectUser);
  const [currentStep, setCurrentStep] = useState<StepId>("general-config");
  const [result, setResult] = useState<Result>(initialData);
  const [subjectResults, setSubjectResults] = useState<Subject>({
    subject: "",
    teacher_id: "",
    class_score: 0,
    exam_score: 0,
    total_score: 0,
    grade: "",
    remarks: "",
  });
  const totalMarks: number =
    Number(subjectResults.class_score) + Number(subjectResults.exam_score);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(
    assignedClasses[0],
  );

  //record/create results
  const [createResult, { isLoading: isCreatingResult }] =
    useCreateResultsMutation();

  //teacher's school
  const currentSchool: School = user?.school ?? ({} as School);

  //get stakeholder
  const { data: currTeacher, isLoading: isFetchingTeacher } =
    useGetStudentByQueryParamQuery(user?.id ?? "", {
      refetchOnMountOrArgChange: true,
      skip: !user?.id,
    });
  const teacher: Stakeholders | undefined = currTeacher?.data[0];

  //get class details
  const {
    data: class_data,
    isLoading: isFetchingClass,
    // isError: isFetchingClassErr,
  } = useGetClassQuery(
    { id: user?.school_id ?? "", class_name: selectedClass },
    { skip: !selectedClass },
  );

  const class_attached: Class = useMemo(() => {
    if (!class_data) return {} as Class;
    setResult((prev) => ({
      ...prev,
      class_name: class_data.data.class_details.class_name,
    }));
    return class_data.data;
  }, [class_data]);

  const assignGrade = (): string => {
    if (currentSchool.grading_scales_config.length > 0) {
      //use set grade to set functionality
      return "N/A";
    }
    const grade_A = Array.from({ length: 26 }, (_, i) => i + 75);
    const grade_B = Array.from({ length: 15 }, (_, i) => i + 60);
    const grade_C = Array.from({ length: 10 }, (_, i) => i + 50);
    const grade_D = Array.from({ length: 10 }, (_, i) => i + 40);
    const grade_E = Array.from({ length: 10 }, (_, i) => i + 30);
    const grade_F = Array.from({ length: 30 }, (_, i) => i);
    if (grade_A.includes(subjectResults.total_score)) return "A";
    if (grade_B.includes(subjectResults.total_score)) return "B";
    if (grade_C.includes(subjectResults.total_score)) return "C";
    if (grade_D.includes(subjectResults.total_score)) return "D";
    if (grade_E.includes(subjectResults.total_score)) return "E";
    if (grade_F.includes(subjectResults.total_score)) return "F";
    return "N/A";
  };

  const handleStepChange = (stepId: string) => {
    if (stepId !== "general-config" && !result.student_id) {
      return toast.warning("Select a student to proceed");
    }
    setCurrentStep(stepId as StepId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subjects = ["class_score", "exam_score", "remarks"];
    const { name, value } = e.target;

    if (subjects.includes(name)) {
      setSubjectResults((prev) => ({ ...prev, [name]: value }));
      return;
    }

    setResult((prev) => ({ ...prev, [name]: value }));
  };

  const registerResult = () => {
    //run validations
    if (!subjectResults.subject) return toast.error("Select subject");
    const subjectCAScore = Number(subjectResults.class_score);
    const subjectExamScore = Number(subjectResults.exam_score);
    const subjectTotalScore = Number(subjectResults.total_score);
    if (
      isNaN(subjectCAScore) ||
      isNaN(subjectExamScore) ||
      isNaN(subjectTotalScore)
    )
      return toast.error("invalid result");
    if (!subjectResults.grade.trim())
      return toast.error("Please check input scores");

    // < ---------- >
    const subject: Subject = {
      subject: subjectResults.subject,
      teacher_id: subjectResults.teacher_id,
      class_score: subjectCAScore,
      exam_score: subjectExamScore,
      total_score: subjectTotalScore,
      grade: subjectResults.grade,
      remarks: subjectResults.remarks,
    };
    //check if result exists
    const prevResult = result.subject_results.find(
      (item) => item.subject === subjectResults.subject,
    );

    if (prevResult) {
      setResult((prevState) => {
        return {
          ...prevState,
          subject_results: prevState.subject_results.map((item) =>
            item.subject === prevResult.subject ? subject : item,
          ),
        };
      });
      toast.success("Result updated successfully");
    } else {
      setResult((prev) => ({
        ...prev,
        subject_results: [...prev.subject_results, subject],
      }));
      toast.success("Result recorded successfully");
    }

    //proceed
    setCurrentStep("remarks");
  };

  const viewAddedScores = () => {
    //show a modal with results table
    console.log("Result: ", result);
  };

  const addNewScores = () => {
    //reset subjectResults
    setSubjectResults({
      subject: "",
      teacher_id: teacher?.id ?? "",
      class_score: 0,
      exam_score: 0,
      total_score: 0,
      grade: "",
      remarks: "",
    });
    //proceed
    setCurrentStep("subject-results");
  };

  const handleScoreSubmission = async () => {
    const {
      student_id,
      exam_id,
      term,
      session,
      class_name,
      grade,
      subject_results,
      total_score,
      average_score,
      position,
      teacher_remarks,
      principal_remarks,
    } = result;
    const totalScore = Number(total_score);
    const averageScore = Number(average_score);
    const positionScore = Number(position);

    const resultPayload: CreateResultParams = {
      student_id,
      // exam_id, //ATTACH BACK LATER
      term,
      session,
      class_name,
      grade,
      subject_results,
      total_score: totalScore,
      average_score: averageScore,
      position: positionScore,
      teacher_remarks,
      principal_remarks,
    };

    try {
      const { data, error } = await createResult(resultPayload);
      if (error) {
        return;
      }
      toast.success(
        data.data.message ? data.data.message : "Result uploaded successfully",
      );
      replace("/teacher/grade-entry-portal");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!teacher) return;
    setAssignedClasses(teacher.assigned_classes);
    setSelectedClass(teacher.assigned_classes[0]);
    setSubjectResults((prev) => ({ ...prev, teacher_id: teacher.id }));
  }, [teacher]);

  useEffect(() => {
    if (!currentSchool) return;
    setResult((prev) => ({
      ...prev,
      session: currentSchool?.term?.session ?? "",
      term: currentSchool?.academic_term ?? "",
    }));
  }, [currentSchool]);

  useEffect(() => {
    if (totalMarks < 0) return;
    setResult((prev) => ({
      ...prev,
      total_score: totalMarks,
    }));
    setSubjectResults((prev) => ({ ...prev, total_score: totalMarks }));
  }, [totalMarks]);

  useEffect(() => {
    if (
      isNaN(Number(subjectResults.class_score)) ||
      isNaN(Number(subjectResults.exam_score))
    )
      return;
    setResult((prev) => ({
      ...prev,
      grade: assignGrade(),
    }));
    setSubjectResults((prev) => ({ ...prev, grade: assignGrade() }));
  }, [subjectResults.total_score]);

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Grade Entry Portal
        </h1>
        <p className="text-gray-600">
          The primary interface for teachers to input and submit subject scores
          (Quiz, CA, Exam) for a student.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="px-2">
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
            <CardContent className="px-6">
              {currentStep === "general-config" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    General Config
                  </h2>

                  {/* SESSION */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="assessmentSelector"
                      className="text-sm font-medium text-gray-700"
                    >
                      Session
                    </Label>
                    <Input
                      type="text"
                      value={result.session}
                      className="cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  {/* TERM */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="assessmentSelector"
                      className="text-sm font-medium text-gray-700"
                    >
                      Term
                    </Label>
                    <Input
                      type="text"
                      value={result.term}
                      className="cursor-not-allowed capitalize"
                      readOnly
                    />
                  </div>

                  {/* EXAM */}
                  <div className="space-y-2 hidden opacity-100">
                    <Label
                      htmlFor="assessmentSelector"
                      className="text-sm font-medium text-gray-700"
                    >
                      Exam
                    </Label>
                    <Input
                      type="text"
                      value={result.exam_id}
                      placeholder="Enter Exam Title"
                      onChange={handleChange}
                    />
                  </div>

                  {/* CLASS NAME */}
                  <div className="space-y-2 w-full">
                    <Label
                      htmlFor="assessmentSelector"
                      className="text-sm font-medium text-gray-700"
                    >
                      Class
                    </Label>
                    <Select
                      value={selectedClass}
                      onValueChange={(value) => setSelectedClass(value)}
                      disabled={isFetchingTeacher}
                    >
                      <SelectTrigger id="" className="w-full">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {assignedClasses.map((cl, index) => {
                          return (
                            <SelectItem
                              key={index}
                              value={cl}
                              className="w-full"
                            >
                              {cl}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* STUDENT */}
                  <div className="space-y-2 w-full">
                    <Label
                      htmlFor="assessmentSelector"
                      className="text-sm font-medium text-gray-700"
                    >
                      Student
                    </Label>
                    <Select
                      value={result.student_id}
                      onValueChange={(value) =>
                        setResult((prev) => ({ ...prev, student_id: value }))
                      }
                      disabled={
                        !class_attached || isFetchingTeacher || isFetchingClass
                      }
                    >
                      <SelectTrigger id="" className="w-full">
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {class_attached?.students?.map((item) => {
                          return (
                            <SelectItem
                              key={item.id}
                              value={item.id as string}
                              className="w-full"
                            >
                              {item.full_name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      disabled={!result.student_id}
                      onClick={() => setCurrentStep("subject-results")}
                      className="w-60"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "subject-results" && (
                <div className="space-y-4">
                  {/* heading */}
                  <h2 className="text-lg font-semibold text-gray-800">
                    Subject Results
                  </h2>

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
                        {class_attached?.subjects?.map((subject) => {
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
                      value={subjectResults.class_score}
                      onChange={handleChange}
                      name="class_score"
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
                      name="exam_score"
                      value={subjectResults.exam_score}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Total Score */}
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between gap-x-2">
                      <Label
                        htmlFor="assessmentSelector"
                        className="text-sm font-medium text-gray-700"
                      >
                        Total Score (numbers only)
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
                      name="remarks"
                      value={subjectResults.remarks}
                      placeholder="Excellent Score"
                      onChange={handleChange}
                    />
                  </div>

                  {/* actn button */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      onClick={registerResult}
                      disabled={
                        !subjectResults.subject ||
                        !subjectResults.class_score ||
                        !subjectResults.exam_score
                      }
                      className="w-60 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Register Result
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "remarks" && (
                <div className="space-y-4">
                  {/* heading */}
                  <h2 className="text-lg font-semibold text-gray-800">
                    Remarks
                  </h2>

                  {/* Teacher's Remarks */}
                  <div className="space-y-2 w-full">
                    <Label
                      htmlFor="teacher's remarks"
                      className="text-sm font-medium text-gray-700"
                    >
                      Teacher's Remarks
                    </Label>
                    <Input
                      type="text"
                      name="teacher_remarks"
                      value={result.teacher_remarks}
                      placeholder="Enter Remark"
                      onChange={handleChange}
                    />
                  </div>

                  {/* Principal's Remarks */}
                  <div className="space-y-2 w-full">
                    <Label
                      htmlFor="principal_remarks"
                      className="text-sm font-medium text-gray-700"
                    >
                      Principal's Remarks
                    </Label>
                    <Input
                      type="text"
                      name="principal_remarks"
                      value={result.principal_remarks}
                      placeholder="Enter Remark"
                      onChange={handleChange}
                    />
                  </div>

                  <Separator />
                  <p className="text-muted-foreground text-sm">
                    ⚠️ Only use this section if you have more subject scores to
                    add for the same student. You will be recorded as the
                    teacher who taught and graded the student.
                  </p>
                  {/* add or read results */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={viewAddedScores}
                      variant={"outline"}
                      className=""
                    >
                      View Added Scores
                    </Button>
                    <Button
                      onClick={addNewScores}
                      variant={"outline"}
                      className=""
                    >
                      Add New Scores
                    </Button>
                  </div>

                  {/* actn button */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      disabled={isCreatingResult}
                      onClick={handleScoreSubmission}
                      className="w-60 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Scores
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
