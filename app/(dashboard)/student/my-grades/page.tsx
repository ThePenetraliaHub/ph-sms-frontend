"use client";

// import { useState, useMemo } from "react";
import { useState } from "react";
import { useGetStudentByQueryParamQuery } from "@/services/stakeholders/stakeholders";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { DetailedGradeViewModal } from "@/components/dashboard-pages/student/my-grades/detailed-grade-view-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
// import { useGetGradesQuery } from "@/services/shared";
// import type { Grade } from "@/services/grades/grades-type";

//review this block
interface SubjectPerformance {
  subject: string;
  courseId: string;
  assignedTeacher: string;
  termAverageScore: string;
  latestGrade: string;
  remarks: string;
  score: number;
  maxScore: number;
  assignmentName: string;
}

export default function MyGradesPage() {
  const user = useAppSelector(selectUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // const { data: gradesData, isLoading: gradesLoading } = useGetGradesQuery(
  //   user?.id ? { studentId: user.id } : undefined,
  // );

  const {
    data: res,
    isLoading: isfetchingGrades,
    error,
  } = useGetStudentByQueryParamQuery(user?.id ?? "");

  const student = res?.data[0];

  const handleViewDetails = (subject: string, courseId: string) => {
    setSelectedSubject(subject);
    setSelectedCourseId(courseId);
    setModalOpen(true);
  };

  //review this block
  const studentGrades = student?.grade?.map((grade) => {
    return {
      subject: grade.subject,
      courseId: grade.courseId,
      assignedTeacher: grade.assignedTeacher,
      termAverageScore: grade.teamAverageScore,
      latestGrade: grade.latestGrade,
      remarks: grade.remarks,
      score: grade.score,
      maxScore: grade.maxScore,
      assignmentName: grade.assignmentName,
    };
  });

  const columns: TableColumn<SubjectPerformance>[] = [
    {
      key: "subject",
      title: "Subjects",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "assignedTeacher",
      title: "Assigned Teacher",
    },
    {
      key: "termAverageScore",
      title: "Term Average Score",
    },
    {
      key: "latestGrade",
      title: "Latest Grade",
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-main-blue"
            onClick={() => handleViewDetails(row.subject, row.courseId)}
          >
            View Details
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Title and Description */}
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          My Grades & Performance Tracking
        </h1>
        <p className="text-gray-600">
          This screen serves as the student&apos;s personalized academic record,
          showing current scores, historical data, and detailed teacher
          feedback.
        </p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="Overall Average Score" value={`0%`} trend="up" />
        <MetricCard title="Lowest Subject Score" value={""} trend="up" />
      </div>

      {/* Subject Performance Overview */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
              Subject Performance Overview
            </CardTitle>
            <p className="text-sm text-gray-600">
              This table gives the student a quick snapshot of their cumulative
              performance in each subject for the current term.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {isfetchingGrades ? (
              <div className="h-20 w-full flex items-center justify-center text-muted-foreground text-sm">
                Loading grades...
              </div>
            ) : error ? (
              <div className="h-20 w-full flex items-center justify-center text-muted-foreground text-sm">
                Failed to fetch grades
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={
                  studentGrades ? (studentGrades as SubjectPerformance[]) : []
                }
                showActionsColumn={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Grade View Modal */}
      {selectedSubject && selectedCourseId && (
        <DetailedGradeViewModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          subject={selectedSubject}
          assessments={
            studentGrades
              ?.filter((grade) => String(grade.courseId) === selectedCourseId)
              .map((grade) => {
                const name = String(grade.assignmentName ?? "N/A");
                return {
                  assessmentName: name,
                  assessmentType: name.includes("Quiz")
                    ? "Continuous Assessment (Quiz)"
                    : name.includes("CA")
                      ? "Continuous Assessment"
                      : name.includes("Exam")
                        ? "Examination"
                        : "Assignment",
                  totalMarks: Number(grade.maxScore) || 0,
                  studentScore: Number(grade.score) || 0,
                  teacherFeedback: String(
                    grade.remarks ?? "No feedback available",
                  ),
                };
              }) ?? []
          }
        />
      )}
    </div>
  );
}
