"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DatabaseLockedIcon,
  ComputerUserIcon,
  Calendar03Icon,
  PayByCheckIcon,
} from "@hugeicons/core-free-icons";
import { DeploySchedulingModal } from "@/components/dashboard-pages/admin/cbt-management/components/schedule-deploy-test-modal";
import { useGetCbtExamsQuery } from "@/services/cbt-exams/cbt-exams";
import { useGetCbtResultsQuery } from "@/services/cbt-results/cbt-results";
import { useGetCbtQuestionsQuery } from "@/services/cbt-questions/cbt-questions";
import { useGetAllStaffQuery } from "@/services/stakeholders/stakeholders";
import type { CbtExam } from "@/services/cbt-exams/cbt-exam-types";

interface RecentTestActivity {
  id: string;
  testName: string;
  dateTime: Date;
  status: "graded" | "scheduled" | "in-progress";
}

function mapExamToRecentActivity(exam: CbtExam): RecentTestActivity {
  const dateStr = exam.schedule_date ?? exam.created_at;
  const timeStr = exam.schedule_time;
  let dateTime: Date;
  try {
    if (dateStr && timeStr) {
      dateTime = new Date(`${dateStr}T${timeStr}`);
    } else if (dateStr) {
      dateTime = parseISO(dateStr);
    } else {
      dateTime = parseISO(exam.created_at);
    }
  } catch {
    dateTime = parseISO(exam.created_at);
  }
  const status: RecentTestActivity["status"] = exam.completed
    ? "graded"
    : dateTime > new Date()
      ? "scheduled"
      : "in-progress";
  return {
    id: exam.id,
    testName: exam.title ?? "",
    dateTime,
    status,
  };
}

function getExamsList(data: unknown): CbtExam[] {
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

const getStatusColor = (status: RecentTestActivity["status"]) => {
  switch (status) {
    case "graded":
      return "text-green-600";
    case "scheduled":
      return "text-blue-600";
    case "in-progress":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

export default function CBTManagementDashboardPage() {
  const router = useRouter();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const { data: examsResponse, isLoading: isLoadingExams } =
    useGetCbtExamsQuery({ _all: true });
  const { data: resultsResponse } = useGetCbtResultsQuery({ _all: true });
  const { data: questionsResponse } = useGetCbtQuestionsQuery({ _all: true });
  const { data: staffResponse } = useGetAllStaffQuery(undefined, {
    skip: !scheduleModalOpen,
  });

  const examsList = useMemo(() => getExamsList(examsResponse), [examsResponse]);
  const recentTestActivity: RecentTestActivity[] = useMemo(
    () =>
      examsList
        .map(mapExamToRecentActivity)
        .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()),
    [examsList],
  );

  const questionsList = useMemo(() => {
    const raw = questionsResponse as { data?: unknown[] } | undefined;
    const arr = raw?.data;
    return Array.isArray(arr)
      ? arr
      : arr &&
          typeof arr === "object" &&
          "data" in arr &&
          Array.isArray((arr as { data: unknown[] }).data)
        ? (arr as { data: unknown[] }).data
        : [];
  }, [questionsResponse]);

  const scheduledCount = useMemo(
    () => examsList.filter((e) => !e.completed).length,
    [examsList],
  );

  const invigilatorOptions = useMemo(() => {
    const staff = staffResponse?.data ?? [];
    const teachers = staff.filter(
      (s) => (s as { type?: string }).type === "teacher",
    );
    return teachers.map((s) => {
      const u = (s as { user?: { first_name?: string; last_name?: string } })
        .user;
      const label =
        u && typeof u === "object"
          ? [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || s.id
          : s.id;
      return { value: s.id, label };
    });
  }, [staffResponse]);

  const venueSuggestions = useMemo(() => {
    const venues = examsList
      .map((e) => e.location_venue)
      .filter((v): v is string => Boolean(v && String(v).trim()));
    return [...new Set(venues)];
  }, [examsList]);

  const columns: TableColumn<RecentTestActivity>[] = [
    {
      key: "testName",
      title: "Test Name",
      className: "font-medium",
    },
    {
      key: "dateTime",
      title: "Date/Time",
      render: (value) => (
        <span className="text-sm">{format(value, "MMM. d, yyyy; h:mma")}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value, row) => (
        <span
          className={cn(
            "text-sm font-medium capitalize",
            getStatusColor(row.status),
          )}
        >
          {value}
        </span>
      ),
    },
  ];

  const actions: TableAction<RecentTestActivity>[] = [
    {
      type: "button",
      config: {
        label: "Monitor Session",
        onClick: (row) => {
          if (row.status === "in-progress") {
            router.push(
              `/admin/cbt-management/monitor-test-sessions?exam_id=${encodeURIComponent(row.id)}`,
            );
          }
        },
        variant: "outline",
        disabled: (row) => row.status !== "in-progress",
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          CBT Management Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          This dashboard is the central control panel for administering,
          monitoring, and analyzing computer-based tests.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Exams Scheduled"
          value={
            isLoadingExams
              ? "—"
              : `${scheduledCount} Test${scheduledCount !== 1 ? "s" : ""}`
          }
          subtitle="Scheduled and in-progress exams (not yet completed)"
          trend="up"
        />
        <MetricCard
          title="Completed Results"
          value={
            resultsResponse &&
            typeof resultsResponse === "object" &&
            "data" in resultsResponse &&
            Array.isArray((resultsResponse as { data: unknown[] }).data)
              ? `${(resultsResponse as { data: unknown[] }).data.length}`
              : "—"
          }
          subtitle="CBT results submitted so far"
          trend="up"
        />
        <MetricCard
          title="Questions in Database"
          value={
            questionsList.length > 0
              ? `${questionsList.length.toLocaleString()} Questions`
              : isLoadingExams
                ? "—"
                : "0 Questions"
          }
          subtitle="Measures the availability of the question bank"
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <QuickActionCard
            title="Create New CBT Exam"
            description="Leads to the test configuration workflow"
            icon={PayByCheckIcon}
            onClick={() => router.push("/admin/cbt-management/new-cbt-exam")}
            className="border-b"
          />
          <QuickActionCard
            title="Question Bank Management"
            description="Direct access to add, edit, or categorize questions"
            icon={DatabaseLockedIcon}
            onClick={() =>
              router.push("/admin/cbt-management/question-bank-management")
            }
            className="border-b"
          />
          <QuickActionCard
            title="Monitor Live Test Sessions"
            description="Links to the real-time proctoring view"
            icon={ComputerUserIcon}
            onClick={() =>
              router.push("/admin/cbt-management/monitor-test-sessions")
            }
            className="border-b"
          />
          <QuickActionCard
            title="Schedule & Deploy Test"
            description="The final step to set the date, time, and class for a test"
            icon={Calendar03Icon}
            onClick={() => setScheduleModalOpen(true)}
          />
        </CardContent>
      </Card>

      {/* Recent Test Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Recent Test Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={recentTestActivity}
              actions={actions}
              isLoading={isLoadingExams}
              emptyMessage="No recent test activity."
              tableClassName="border-collapse"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Deploy Test Modal */}
      {scheduleModalOpen && (
        <DeploySchedulingModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          examOptions={examsList
            .filter((e) => !e.completed)
            .map((e) => ({ value: e.id, label: e.title ?? "" }))}
          venueSuggestions={venueSuggestions}
          invigilatorOptions={invigilatorOptions}
          onScheduleAndActivate={() => {
            setScheduleModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
