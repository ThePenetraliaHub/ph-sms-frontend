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
import { useGetStudentByQueryParamQuery } from "@/services/stakeholders/stakeholders";
import { useGetUserRequestsQuery } from "@/services/user-requests/user-requests";
import { useGetAllExamResultsQuery } from "@/services/results/results";
import { useGetClassQuery } from "@/services/schools/schools";

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

//assignment name, subject, total marks, due date, status, actn

export default function AssignmentsPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);

  //get stakeholder
  const { data: stakeholder, isLoading: isFetchingStudent } =
    useGetStudentByQueryParamQuery(user?.id ?? "", { skip: !user?.id });

  const my_class = useMemo(() => {
    if (!stakeholder?.data) return;
    return stakeholder.data[0].class_assigned;
  }, [stakeholder]);

  //get sk class-details
  const { data: assigned_class_data, isLoading: isFetchingClass } =
    useGetClassQuery(
      {
        id: user?.school_id ?? "",
        class_name: my_class ?? "",
      },
      { skip: !user?.school_id?.trim() || !my_class?.trim() },
    );

  const myClassExams: CbtExam[] = useMemo(() => {
    if (!assigned_class_data) return [] as CbtExam[];
    return assigned_class_data?.data.cbt_exams;
  }, [assigned_class_data]);

  console.log("My Class Details: ", myClassExams);

  const isLoading = isFetchingClass || isFetchingStudent;

  const columns: TableColumn<CbtExam>[] = [
    {
      key: "title",
      title: "Exam",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "subject",
      title: "Subject",
    },
    {
      key: "total_marks_available",
      title: "Total Marks",
    },
    {
      key: "duration",
      title: "Duration",
    },
    {
      key: "max_attempt",
      title: "Max Attempt",
    },
    {
      key: "schedule_date",
      title: "Scheduled Date",
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
        if (row.id === "View Feedback") {
          return (
            <Button
              variant="link"
              className="h-auto p-0 text-main-blue"
              // onClick={() => handleViewFeedback(row)}
              onClick={() => {}}
            >
              {/* {row.actionLabel} */}
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
            {/* {row.actionLabel} */}
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
            // quiz={
            //   nextUpcomingCbtExam && {
            //     id: nextUpcomingCbtExam.id,
            //     title: nextUpcomingCbtExam.title ?? "Quiz",
            //     subject: nextUpcomingCbtExam.subject ?? undefined,
            //     schedule_date: nextUpcomingCbtExam.schedule_date ?? undefined,
            //     schedule_time: nextUpcomingCbtExam.schedule_time ?? undefined,
            //     duration: nextUpcomingCbtExam.duration ?? undefined,
            //   }
            // }
            quiz={null}
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                  // value={searchQuery}
                  value={""}
                  // onChange={(e) => setSearchQuery(e.target.value)}
                  onChange={() => {}}
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
