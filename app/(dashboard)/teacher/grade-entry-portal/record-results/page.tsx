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
// import {
//   CreateResultParams,
//   SubjectResult,
// } from "@/services/results/result-types";
// import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  DataTable,
  TableAction,
  TableColumn,
} from "@/components/ui/data-table";
import ScoreInputGrid from "@/components/dashboard-pages/teacher/my-courses/modals/score-input-grid";
import { AddSubjectScores } from "@/components/dashboard-pages/teacher/grade-entry-portal/add-subject-scores";
import { ViewScoredSubject } from "@/components/dashboard-pages/teacher/grade-entry-portal/view-scored-subject";
import { register } from "module";

interface Subject {
  subject: string;
  teacher_id: string;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
}

// interface Result {
//   student_id: string;
//   student: string;
//   exam_id: string;
//   term: string;
//   session: string;
//   class_name: string;
//   grade: string;
//   subject_results: Subject[];
//   total_score: number | string;
//   average_score: number | string;
//   position: number | string;
//   teacher_remarks: string;
//   principal_remarks: string;
// }

interface GeneralConfig {
  session: string;
  term: string;
  exam: string;
  class_name: string;
}

export interface TableData {
  student: string;
  subject_results: Subject[];
  student_id: string;
  grade: string;
  total_score: number;
  average_score: number;
  position: number;
  teacher_remarks: string;
  principal_remarks: string;
}

type StepId = "general-config" | "score-input-grid";

const steps: Step[] = [
  {
    id: "general-config",
    label: "General Config",
    icon: AssignmentsIcon,
  },
  {
    id: "score-input-grid",
    label: "Score Input",
    icon: ResourcesAddIcon,
  },
];

export default function GradeStudent() {
  const { replace } = useRouter();
  const user = useAppSelector(selectUser);
  //teacher's school
  const currentSchool: School | undefined = user?.school;
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(
    assignedClasses[0],
  );
  const [currentStep, setCurrentStep] = useState<StepId>("general-config");
  const [config, setConfig] = useState<GeneralConfig>({
    session: currentSchool?.term.session ?? "",
    term: currentSchool?.academic_term ?? "",
    exam: "",
    class_name: "",
  });
  const [tableData, setTableData] = useState<TableData[]>([]);
  console.log("Table Data: ", tableData);
  const [subjectResults, setSubjectResults] = useState<Subject>({
    subject: "",
    teacher_id: "",
    class_score: 0,
    exam_score: 0,
    total_score: 0,
    grade: "",
    remarks: "",
  });
  const [selectedStudent, setSelectedStudent] = useState<TableData>();
  const [addScoresMod, setAddScoresMod] = useState<boolean>(false);
  const [viewScoredMod, setViewScoredMod] = useState<boolean>(false);

  //TOTAL MARKS
  const totalMarks: number =
    Number(subjectResults.class_score) + Number(subjectResults.exam_score);

  //record/create results
  const [createResult, { isLoading: isCreatingResult }] =
    useCreateResultsMutation();

  //get teacher's details
  const { data: currTeacher, isLoading: isFetchingTeacher } =
    useGetStudentByQueryParamQuery(user?.id ?? "", {
      refetchOnMountOrArgChange: true,
      skip: !user?.id,
    });
  const teacher: Stakeholders | undefined = currTeacher?.data[0];

  //get teacher's class details
  const {
    data: class_data,
    isLoading: isFetchingClass,
    isError: isFetchingClassErr,
  } = useGetClassQuery(
    { id: user?.school_id ?? "", class_name: selectedClass },
    { skip: !selectedClass },
  );

  const class_attached: Class | undefined = useMemo(() => {
    if (!class_data) return undefined;
    return class_data.data;
  }, [class_data]);

  //handle teacher remarks change
  const handleTeacherRemarksChange = (studentId: string, value: string) => {
    setTableData((prev) => {
      return prev.map((item) => {
        return item.student_id === studentId
          ? { ...item, teacher_remarks: value }
          : item;
      });
    });
  };

  //handle principal remarks change
  const handlePrincipalRemarksChange = (studentId: string, value: string) => {
    setTableData((prev) => {
      return prev.map((item) => {
        return item.student_id === studentId
          ? { ...item, principal_remarks: value }
          : item;
      });
    });
  };

  //register subject to student
  const registerSubject = () => {
    if (!selectedStudent?.student_id)
      return toast.error("Student not selected");
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

    const prevResult = selectedStudent.subject_results.find(
      (item) => item.subject === subjectResults.subject,
    );

    if (prevResult) {
      setTableData((table_datas) => {
        return table_datas.map((table_data) => {
          return table_data.student_id === selectedStudent.student_id
            ? {
                ...table_data,
                subject_results: table_data.subject_results.map(
                  (previous_subject) =>
                    previous_subject.subject === prevResult.subject
                      ? prevResult
                      : previous_subject,
                ),
              }
            : table_data;
        });
      });
      toast.success("Result updated successfully");
    } else {
      setTableData((prev) => {
        return prev.map((item) => {
          return item.student_id === selectedStudent.student_id
            ? { ...item, subject_results: [...item.subject_results, subject] }
            : item;
        });
      });
      toast.success("Result recorded successfully");
    }

    //reset options
    setSelectedStudent(undefined);
    setAddScoresMod(false);
    setSubjectResults({
      subject: "",
      teacher_id: "",
      class_score: 0,
      exam_score: 0,
      total_score: 0,
      grade: "",
      remarks: "",
    });
  };

  function getTotalPrice(subjects: Subject[]): number {
    console.log("Subjects Calculated: ", subjects);
    return subjects.reduce((total, subject) => total + subject.total_score, 0);
  }

  const assignGrade = (score: number): string => {
    // if (currentSchool.grading_scales_config.length > 0) {
    //   //use set grade to set functionality
    //   return "N/A";
    // }
    const grade_A = Array.from({ length: 26 }, (_, i) => i + 75);
    const grade_B = Array.from({ length: 15 }, (_, i) => i + 60);
    const grade_C = Array.from({ length: 10 }, (_, i) => i + 50);
    const grade_D = Array.from({ length: 10 }, (_, i) => i + 40);
    const grade_E = Array.from({ length: 10 }, (_, i) => i + 30);
    const grade_F = Array.from({ length: 30 }, (_, i) => i);
    if (grade_A.includes(score)) return "A";
    if (grade_B.includes(score)) return "B";
    if (grade_C.includes(score)) return "C";
    if (grade_D.includes(score)) return "D";
    if (grade_E.includes(score)) return "E";
    if (grade_F.includes(score)) return "F";
    return "N/A";
  };

  const handleStepChange = (stepId: string) => {
    if (stepId !== "general-config" && !config.class_name) {
      return toast.warning("Select a class to proceed");
    }
    setCurrentStep(stepId as StepId);
  };

  //DATA TABLE
  const columns: TableColumn<TableData>[] = [
    {
      key: "name",
      title: "Student",
      render: (_v, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{row.student}</span>
          {/* <span className="text-sm text-gray-500">{row.student_id}</span> */}
        </div>
      ),
    },
    {
      key: "grade",
      title: "Grade",
      render: (_v, row) => <span className="text-gray-800">{row.grade}</span>,
    },
    {
      key: "total_score",
      title: "Tot. Score",
      render: (_v, row) => (
        <span className="text-gray-800">{row.total_score as number}</span>
      ),
    },
    {
      key: "average_score",
      title: "Avg. Score",
      render: (_v, row) => (
        <span className="text-gray-800">{row.average_score as number}</span>
      ),
    },
    {
      key: "position",
      title: "Position",
      render: (_v, row) => (
        <span className="text-gray-800">{`${row.position as number}/${tableData.length}`}</span>
      ),
    },
    {
      key: "teacher_remarks",
      title: "Teacher's Remarks",
      render: (value, row) => (
        <Input
          type="text"
          placeholder="placeholder"
          value={row.teacher_remarks}
          onChange={(e) =>
            handleTeacherRemarksChange(row.student_id, e.target.value)
          }
          className="w-full"
        />
      ),
    },
    {
      key: "principal_remarks",
      title: "Principal's Remarks",
      render: (value, row) => (
        <Input
          type="text"
          placeholder="placeholder"
          value={row.principal_remarks}
          onChange={(e) =>
            handlePrincipalRemarksChange(row.student_id, e.target.value)
          }
          className="w-full"
        />
      ),
    },
  ];
  const actions: TableAction<TableData>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "Add Subject Scores",
            onClick: (row) => {
              setSelectedStudent(row);
              setAddScoresMod(true);
            },
          },
          {
            label: "View Scored Subjects",
            onClick: (row) => {
              console.log("View details for:", row.student);
            },
            separator: true,
          },
          {
            label: "Clear Result",
            onClick: (row) => {
              console.log("Edit question:", row.student);
            },
            separator: true,
            variant: "destructive",
          },
        ],
      },
    },
  ];

  useEffect(() => {
    if (!teacher) return;
    setAssignedClasses(teacher.assigned_classes);
    setSelectedClass(teacher.assigned_classes[0]);
    setSubjectResults((prev) => ({ ...prev, teacher_id: teacher.id }));
  }, [teacher]);

  useEffect(() => {
    if (!class_attached) return;
    //set table data - initialize it
    const initializedArr: TableData[] = class_attached.students.map(
      (student) => {
        return {
          student_id: student.id ?? "",
          student: student.full_name,
          subject_results: [],
          total_score: 0,
          average_score: 0,
          position: 0,
          teacher_remarks: "",
          principal_remarks: "",
          grade: assignGrade(0),
        };
      },
    );
    setTableData(initializedArr);
    //set class name for config
    setConfig((prev) => ({
      ...prev,
      class_name: class_attached.class_details.class_name,
    }));
  }, [class_attached]);

  //total score
  useEffect(() => {
    if (totalMarks < 0) return;
    setSubjectResults((prev) => ({ ...prev, total_score: totalMarks }));
    console.log("Calculating total score...");
    setTableData((prev) => {
      return prev.map((prevSt) => {
        return prevSt.student_id === selectedStudent?.student_id
          ? { ...prevSt, total_score: getTotalPrice(prevSt.subject_results) }
          : prevSt;
      });
    });
  }, [totalMarks]);

  //grades
  useEffect(() => {
    if (
      isNaN(Number(subjectResults.class_score)) ||
      isNaN(Number(subjectResults.exam_score))
    )
      return;
    // setResult((prev) => ({
    //   ...prev,
    //   grade: assignGrade(),
    // }));
    setSubjectResults((prev) => ({
      ...prev,
      grade: assignGrade(prev.total_score),
    }));
  }, [subjectResults.total_score]);

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Results Recording Portal
        </h1>
        <p className="text-gray-600">
          The primary interface for teachers to input and submit subject scores
          (Exam, CA) for students in a class.
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
                      //   value={result.session}
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
                      //   value={result.term}
                      className="cursor-not-allowed capitalize"
                      readOnly
                    />
                  </div>

                  {/* EXAM */}
                  <div className="space-y-2 opacity-100">
                    <Label
                      htmlFor="assessmentSelector"
                      className="text-sm font-medium text-gray-700"
                    >
                      Exam
                    </Label>
                    <Input
                      type="text"
                      //   value={result.exam_id}
                      placeholder="E.g. 2022/2023 Promotional Exams"
                      onChange={(e) => {}}
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

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      //   disabled={!result.class_name}
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
                  <h2 className="text-lg font-semibold text-gray-800">
                    Result Builder
                  </h2>

                  <div className="border rounded-lg overflow-hidden">
                    <DataTable
                      columns={columns}
                      data={tableData}
                      // isLoading={isFetchingQuestions || isDeletingCbtQuestion}
                      // emptyMessage={
                      //   isFetchingQuestionsErr
                      //     ? "Failed to fetch questions"
                      //     : "No data available"
                      // }
                      isLoading={false}
                      emptyMessage={"No student in this class"}
                      actions={actions}
                      showActionsColumn={true}
                      actionsColumnTitle="Action"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      //   disabled={!result.class_name}
                      onClick={() => setCurrentStep("score-input-grid")}
                      className="w-60"
                    >
                      Submit Result
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* modals */}
      <AddSubjectScores
        isFetchingClass={isFetchingClass}
        selectedStudent={selectedStudent}
        registerSubject={registerSubject}
        open={addScoresMod}
        studentsClass={class_attached}
        onOpenChange={setAddScoresMod}
        subjectResults={subjectResults}
        setSubjectResults={setSubjectResults}
        setSelectedStudent={setSelectedStudent}
      />
      {/* <ViewScoredSubject /> */}
    </div>
  );
}
