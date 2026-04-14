"use client";

import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { DetailedGradeViewModal } from "@/components/dashboard-pages/student/my-grades/detailed-grade-view-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useGetGradesQuery } from "@/services/shared";
// import { useGetCoursesQuery } from "@/services/shared";
import type { Grade } from "@/services/grades/grades-type";

interface SubjectPerformance {
  subject: string;
  courseId: string;
  assignedTeacher: string;
  termAverageScore: string;
  latestGrade: string;
}

export default function MyGradesPage() {
  const user = useAppSelector(selectUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: gradesData, isLoading: gradesLoading } = useGetGradesQuery(
    user?.id ? { studentId: user.id } : undefined,
  );
  const { data: coursesData } = useGetCoursesQuery();

  const subjectPerformances = useMemo(() => {
    if (!gradesData?.data || !coursesData?.data) return [];

    const courseMap = new Map(coursesData.data.map((c) => [c.id, c]));
    const gradesByCourse = new Map<string, Grade[]>();

    gradesData.data.forEach((grade) => {
      const cid = typeof grade.courseId === "string" ? grade.courseId : null;
      if (cid) {
        if (!gradesByCourse.has(cid)) {
          gradesByCourse.set(cid, []);
        }
        gradesByCourse.get(cid)!.push(grade);
      }
    });

    return Array.from(gradesByCourse.entries()).map(([courseId, grades]) => {
      const course = courseMap.get(courseId);
      const toTime = (x: unknown): number => {
        if (x == null || typeof x === "object") return 0;
        const d = new Date(x as string | number);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const sortedGrades = grades.sort(
        (a, b) => toTime(b.createdAt) - toTime(a.createdAt),
      );
      const latestGrade = sortedGrades[0];

      const averageScore =
        grades.reduce((sum, g) => {
          const max = Number(g.maxScore);
          const score = Number(g.score);
          if (max > 0 && !isNaN(score)) {
            return sum + (score / max) * 100;
          }
          return sum + (Number(g.percentage) || 0);
        }, 0) / grades.length;

      const latestScore = Number(latestGrade?.score);
      const latestMax = Number(latestGrade?.maxScore);
      const latestGradeText =
        latestMax > 0 && !isNaN(latestScore)
          ? `${Math.round((latestScore / latestMax) * 100)}% ${latestGrade?.assignmentName ? `(${latestGrade.assignmentName})` : ""}`
          : latestGrade?.percentage != null
            ? `${latestGrade.percentage}%`
            : "N/A";

      return {
        subject: course?.name || "Unknown Course",
        courseId,
        assignedTeacher: String(
          latestGrade?.teacherName ?? course?.teacherName ?? "N/A",
        ),
        termAverageScore: `${Math.round(averageScore)}%`,
        latestGrade: latestGradeText,
      };
    });
  }, [gradesData, coursesData]);

  const overallAverage = useMemo(() => {
    if (subjectPerformances.length === 0) return 0;
    const sum = subjectPerformances.reduce(
      (acc, subj) => acc + parseFloat(subj.termAverageScore.replace("%", "")),
      0,
    );
    return Math.round(sum / subjectPerformances.length);
  }, [subjectPerformances]);

  const lowestSubject = useMemo(() => {
    if (subjectPerformances.length === 0) return null;
    return subjectPerformances.reduce((lowest, current) => {
      const currentScore = parseFloat(
        current.termAverageScore.replace("%", ""),
      );
      const lowestScore = parseFloat(lowest.termAverageScore.replace("%", ""));
      return currentScore < lowestScore ? current : lowest;
    });
  }, [subjectPerformances]);

  const handleViewDetails = (subject: string, courseId: string) => {
    setSelectedSubject(subject);
    setSelectedCourseId(courseId);
    setModalOpen(true);
  };

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
        <MetricCard
          title="Overall Average Score"
          value={`${overallAverage}%`}
          trend="up"
        />
        <MetricCard
          title="Lowest Subject Score"
          value={
            lowestSubject
              ? `${lowestSubject.subject}: ${lowestSubject.termAverageScore}`
              : "N/A"
          }
          trend="up"
        />
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
            {gradesLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading grades...
              </div>
            ) : subjectPerformances.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No grades found
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={subjectPerformances}
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
            gradesData?.data
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
