"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { UpcomingQuizCard } from "@/components/dashboard-pages/student/assignments/upcoming-quiz-card";
import { NewGradeCard } from "@/components/dashboard-pages/student/assignments/new-grade-card";
import { TeacherFeedbackModal } from "@/components/dashboard-pages/student/assignments/teacher-feedback-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/general/huge-icon";
import { Search01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { useGetCbtExamsQuery } from "@/services/cbt-exams/cbt-exams";
import type { CbtExam } from "@/services/cbt-exams/cbt-exam-types";
import { format, isAfter, isPast, parseISO } from "date-fns";

import type { Grade } from "@/services/grades/grades-type";

function getCbtExamsList(data: unknown): CbtExam[] {
  if (!data || typeof data !== "object") return [];
  const d = data as {
    data?: CbtExam[] | { data?: CbtExam[] };
    pagination?: unknown;
  };
  if (Array.isArray(d.data)) return d.data;
  if (
    d.data &&
    typeof d.data === "object" &&
    Array.isArray((d.data as { data?: CbtExam[] }).data)
  ) {
    return (d.data as { data: CbtExam[] }).data;
  }
  return [];
}

export default function AssignmentsPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const { data: cbtExamsData } = useGetCbtExamsQuery(
    { _all: true },
    { skip: !user?.id },
  );

  const cbtExams = useMemo(() => getCbtExamsList(cbtExamsData), [cbtExamsData]);

  const nextUpcomingCbtExam = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcoming = cbtExams
      .filter((exam) => {
        if (exam.completed) return false;
        if (!exam.schedule_date) return true;
        const d = parseISO(exam.schedule_date);
        const examDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return examDate.getTime() >= today.getTime();
      })
      .sort((a, b) => {
        if (!a.schedule_date) return 1;
        if (!b.schedule_date) return -1;
        return (
          parseISO(a.schedule_date).getTime() -
          parseISO(b.schedule_date).getTime()
        );
      })[0];
    return upcoming ?? null;
  }, [cbtExams]);

  const handleViewFeedback = (row: any) => {
    // setSelectedAssignment({});
    setFeedbackModalOpen(true);
  };

  const handleAcknowledge = () => {
    setFeedbackModalOpen(false);
  };

  const columns: TableColumn<any>[] = [
    {
      key: "assignmentName",
      title: "Assignment Name",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "subject",
      title: "Subject",
    },
    {
      key: "totalMarks",
      title: "Total Marks",
    },
    {
      key: "dueDateTime",
      title: "Due Date/Time",
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as string;
        const isGraded = status.includes("Graded");
        const isInProgress = status === "In Progress";
        const isOverdue = status === "Overdue";
        const colorClass = isGraded
          ? "text-green-600"
          : isInProgress
            ? "text-blue-600"
            : isOverdue
              ? "text-red-600"
              : "text-orange-600";
        return <span className={`text-sm ${colorClass}`}>{status}</span>;
      },
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        if (row.actionLabel === "View Feedback") {
          return (
            <Button
              variant="link"
              className="h-auto p-0 text-main-blue"
              onClick={() => handleViewFeedback(row)}
            >
              {row.actionLabel}
            </Button>
          );
        }
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-main-blue"
            onClick={() =>
              row.id ? router.push(`/student/quiz/${row.id}`) : undefined
            }
          >
            {row.actionLabel}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Assignments & Quizzes Hub
        </h1>
        <p className="text-gray-600">
          This screen provides a complete, organized view of all pending,
          in-progress, and completed academic tasks for the student.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Assignments/Quizzes Due Today"
          value={""}
          trend="up"
        />
        <MetricCard
          title="Assignments/Quizzes Due Tomorrow"
          value={""}
          trend="up"
        />
        <MetricCard title="Overall Average Score" value={`0`} trend="up" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {true && (
          <UpcomingQuizCard
            quiz={
              nextUpcomingCbtExam && {
                id: nextUpcomingCbtExam.id,
                title: nextUpcomingCbtExam.title ?? "Quiz",
                subject: nextUpcomingCbtExam.subject ?? undefined,
                schedule_date: nextUpcomingCbtExam.schedule_date ?? undefined,
                schedule_time: nextUpcomingCbtExam.schedule_time ?? undefined,
                duration: nextUpcomingCbtExam.duration ?? undefined,
              }
            }
            onAction={() => {
              // if (nextUpcomingCbtExam?.id) {
              //   router.push(`/student/quiz/${nextUpcomingCbtExam.id}`);
              // } else if (upcomingAssignments[0]?.id) {
              //   router.push(`/student/quiz/${upcomingAssignments[0].id}`);
              // }
            }}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Assignments & Quizzes Management Table
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon
                  icon={Search01Icon}
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  type="search"
                  placeholder="Text Input (e.g., Physics, Essay)"
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Icon icon={FilterIcon} size={18} />
                Filter: All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable columns={columns} data={[]} showActionsColumn={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
