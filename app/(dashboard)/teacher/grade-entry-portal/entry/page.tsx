"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentsIcon, ResourcesAddIcon } from "@hugeicons/core-free-icons";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { useGetCbtExamsQuery } from "@/services/cbt-exams/cbt-exams";
import { CbtExam } from "@/services/cbt-exams/cbt-exam-types";
import { format } from "date-fns";
import { useGetClassQuery } from "@/services/schools/schools";
import { Class } from "@/services/schools/schools-type";
import { useGetCbtResultByIdQuery } from "@/services/cbt-results/cbt-results";

interface Student {
  id: string;
  name: string;
  studentId: string;
  computeScore: number;
  scoreEntry: string;
  teacherRemarks: string;
}

//GET ALL EXAMS TEACHER'S CREATED
//GET CBT Results
//OPERATE BASED ON THAT

// const allStudents: Student[] = [
//   {
//     id: "1",
//     name: "Sola Adebayo",
//     studentId: "adebayo.m178031",
//     computeScore: 20,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
//   {
//     id: "2",
//     name: "Helen Davies",
//     studentId: "davies.m178032",
//     computeScore: 14,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
//   {
//     id: "3",
//     name: "Tolu Adebayo",
//     studentId: "adebayo.m170833",
//     computeScore: 17,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
//   {
//     id: "4",
//     name: "Biodun Eke",
//     studentId: "eke.m178033",
//     computeScore: 19,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
//   {
//     id: "5",
//     name: "Uche Nwachukwu",
//     studentId: "nwachukwu.m170844",
//     computeScore: 22,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
//   {
//     id: "6",
//     name: "Adebisi Femi",
//     studentId: "femi.m170844",
//     computeScore: 18,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
//   {
//     id: "7",
//     name: "Oluwole Tunde",
//     studentId: "oluwole.m170844",
//     computeScore: 21,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
//   {
//     id: "8",
//     name: "Zara Amani",
//     studentId: "amani.m170844",
//     computeScore: 19,
//     scoreEntry: "",
//     teacherRemarks: "",
//   },
// ];

type StepId = "assessment-selection" | "score-input-grid";

const steps: Step[] = [
  {
    id: "assessment-selection",
    label: "Assessment Selection",
    icon: AssignmentsIcon,
  },
  {
    id: "score-input-grid",
    label: "Score Input Grid",
    icon: ResourcesAddIcon,
  },
];

export default function GradeEntryPortalEntryPage() {
  const [currentStep, setCurrentStep] = useState<StepId>(
    "assessment-selection",
  );
  const [assessmentSelector, setAssessmentSelector] = useState("");
  const [selectedExam, setSelectedExam] = useState<CbtExam>();
  const [studentsClass, setStudentsClass] = useState<string>();
  const [students, setStudents] = useState<Student[]>([]);
  const user = useAppSelector(selectUser);

  //get all exams
  const {
    data: all_exams,
    isLoading: isFetchingExams,
    isError: isFetchingExamsErr,
  } = useGetCbtExamsQuery();

  //get selected exam results
  const {
    data: exam_result,
    isLoading: isFetchingExamResults,
    isError: examResultsErr,
  } = useGetCbtResultByIdQuery(selectedExam?.id ?? "", {
    skip: !selectedExam,
  });

  console.log("Exam Results: ", exam_result?.data);
  console.log("isFetchingExamResults: ", isFetchingExamResults);
  console.log("Students: ", students);

  //get class details
  const {
    data: class_data,
    isLoading: isFetchingClass,
    isError: isFetchingClassErr,
  } = useGetClassQuery(
    { id: user?.school_id ?? "", class_name: "JSS 2" }, //class_name: studentsClass
    { skip: !studentsClass || !user?.school_id },
  );

  const myExams: CbtExam[] = useMemo(() => {
    if (!all_exams) return [];
    if (!user?.id) return [];
    const created_exams = all_exams.data.filter(
      (exam) => exam.creator_id === user?.id,
    );
    return created_exams;
  }, [all_exams]);

  const class_attached: Class = useMemo(() => {
    if (!class_data) return {} as Class;
    return class_data.data;
  }, [class_data]);

  const {
    displayedData: studentData,
    hasMore,
    loadMore,
  } = usePagination({
    data: students,
    initialItemsPerPage: 5,
    itemsPerPage: 5,
  });

  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId as StepId);
  };

  const handleScoreChange = (studentId: string, value: string) => {
    setStudents((prev) => {
      return prev.map((item) => {
        return item.id === studentId ? { ...item, scoreEntry: value } : item;
      });
    });
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setStudents((prev) => {
      return prev.map((item) => {
        return item.id === studentId
          ? { ...item, teacherRemarks: value }
          : item;
      });
    });
  };

  const handleScoreSubmission = async () => {
    console.log();
  };

  //track exam id changes to fetch class attached using applicable_grade key
  useEffect(() => {
    if (!assessmentSelector) return;
    const pickedExam = myExams.find((exam) => exam.id === assessmentSelector);
    if (pickedExam?.applicable_grades)
      setStudentsClass(pickedExam?.applicable_grades);
    setSelectedExam(pickedExam);
  }, [assessmentSelector]);

  //track class data changes to fetch students
  useEffect(() => {
    if (!class_attached.students) return;
    const studentsInClass: Student[] = class_attached.students.map(
      (student) => {
        return {
          id: student.id ?? "",
          name: student.full_name,
          studentId: student.user_id,
          computeScore: 0, //⚠️
          scoreEntry: "", // TEACHER FILLS
          teacherRemarks: "", // TEACHER FILLS
        };
      },
    );
    setStudents(studentsInClass);
  }, [class_attached]);

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Grade Entry Portal
        </h1>
        <p className="text-gray-600">
          The primary interface for teachers to input and submit raw student
          scores for a single assessment (Quiz, CA, Exam).
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
              {currentStep === "assessment-selection" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Assessment Selection
                  </h2>

                  <div className="space-y-2">
                    <Label
                      htmlFor="assessmentSelector"
                      className="text-sm font-medium text-gray-700"
                    >
                      Assessment Selector{" "}
                      {isFetchingExams
                        ? "( 🟠 Loading exams... )"
                        : isFetchingExamsErr
                          ? "( ❌ Exams Fetch Failed )"
                          : ""}
                    </Label>
                    <Select
                      value={assessmentSelector}
                      onValueChange={setAssessmentSelector}
                      disabled={isFetchingExams || isFetchingExamsErr}
                    >
                      <SelectTrigger id="assessmentSelector" className="w-full">
                        <SelectValue placeholder="Filter by Assessment Name (e.g., Biology Test)" />
                      </SelectTrigger>
                      <SelectContent>
                        {myExams.map((exam) => {
                          return (
                            <SelectItem key={exam.id} value={exam.id}>
                              {exam.subject || exam.assessment_name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="totalMarks"
                        className="text-sm font-medium text-gray-700"
                      >
                        Total Marks Available
                      </Label>
                      <span className="text-xs text-gray-500">Read-only</span>
                    </div>
                    <Input
                      id="totalMarks"
                      type="text"
                      placeholder="Based off from assessment selector"
                      value={selectedExam?.total_marks_available ?? "N/A"}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="submissionDeadline"
                        className="text-sm font-medium text-gray-700"
                      >
                        Scheduled Date & Time
                      </Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Read-only</span>
                      </div>
                    </div>
                    <Input
                      id="submissionDeadline"
                      type="text"
                      value={
                        !selectedExam
                          ? "N/A"
                          : `${format(selectedExam?.schedule_date, "dd MMM, yyyy.")} : ${selectedExam?.schedule_time}`
                      }
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="submissionStatus"
                        className="text-sm font-medium text-gray-700"
                      >
                        Exam Status
                      </Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Read-only</span>
                      </div>
                    </div>
                    <Input
                      id="submissionStatus"
                      type="text"
                      value={selectedExam?.status ?? "N/A"}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Link href="/teacher/grade-entry-portal">
                      <Button variant="outline">Back</Button>
                    </Link>
                    <Button
                      onClick={() => setCurrentStep("score-input-grid")}
                      className="w-60"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "score-input-grid" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Score Input Grid
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      (Based on the Assessment Selected)
                    </p>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <DataTable
                      columns={[
                        {
                          key: "name",
                          title: "Name & Student ID",
                          render: (value, row) => (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">
                                {row.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {row.studentId}
                              </span>
                            </div>
                          ),
                        },
                        {
                          key: "computeScore",
                          title: "Compute Score",
                          render: (value) => (
                            <span className="text-gray-800">
                              {value as number}
                            </span>
                          ),
                        },
                        {
                          key: "scoreEntry",
                          title: "Score Entry",
                          render: (value, row) => (
                            <Input
                              type="number"
                              placeholder="placeholder"
                              // value={constructValue(row.id, "score")}
                              value={row.scoreEntry}
                              onChange={(e) =>
                                handleScoreChange(row.id, e.target.value)
                              }
                              className="w-full"
                            />
                          ),
                        },
                        {
                          key: "teacherRemarks",
                          title: "Teacher Remarks",
                          render: (value, row) => (
                            <Input
                              type="text"
                              placeholder="placeholder"
                              // value={constructValue(row.id, "remark")}
                              value={row.teacherRemarks}
                              onChange={(e) =>
                                handleRemarksChange(row.id, e.target.value)
                              }
                              className="w-full"
                            />
                          ),
                        },
                      ]}
                      data={students}
                      showActionsColumn={false}
                    />
                  </div>

                  {hasMore && (
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={loadMore}>
                        Load More
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Link href="/teacher/grade-entry-portal">
                      <Button variant="outline">Save as Draft</Button>
                    </Link>
                    <Button
                      onClick={() => setCurrentStep("score-input-grid")}
                      className="w-60"
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
