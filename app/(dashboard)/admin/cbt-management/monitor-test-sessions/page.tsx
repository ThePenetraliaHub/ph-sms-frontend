"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { MonitorLiveTestSessionModal } from "@/components/dashboard-pages/admin/cbt-management/components/monitor-live-test-session-modal";
import { ScriptReviewModal } from "@/components/dashboard-pages/admin/cbt-management/components/script-review-modal";
import { useGetCbtExamsQuery } from "@/services/cbt-exams/cbt-exams";
import {
  useGetCbtResultsQuery,
  useGetCbtResultByIdQuery,
} from "@/services/cbt-results/cbt-results";
import type { CbtExam } from "@/services/cbt-exams/cbt-exam-types";
import type { CbtResult } from "@/services/cbt-results/cbt-result-types";

interface LiveTestSession {
  id: string;
  examTitle: string;
  class: string;
  invigilator: string;
  startTime: Date;
  timeRemaining: string;
  totalStudents: number;
  activeStudents: number;
  submittedStudents: number;
  status: "in-progress" | "completed" | "scheduled";
}

function getExamsList(data: unknown): CbtExam[] {
  if (!data || typeof data !== "object") return [];
  const d = data as { data?: CbtExam[] | { data?: CbtExam[] } };
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

function getResultsList(data: unknown): CbtResult[] {
  if (!data || typeof data !== "object") return [];
  const d = data as { data?: CbtResult[] | { data?: CbtResult[] } };
  if (Array.isArray(d.data)) return d.data;
  if (
    d.data &&
    typeof d.data === "object" &&
    Array.isArray((d.data as { data?: CbtResult[] }).data)
  ) {
    return (d.data as { data: CbtResult[] }).data;
  }
  return [];
}

function formatTimeElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [h, m, s].map((n) => String(n).padStart(2, "0"));
  return `${parts[0]}:${parts[1]}:${parts[2]}`;
}

function getInvigilatorDisplay(exam: CbtExam): string {
  const inv = (
    exam as {
      assigned_invigilators_details?: Array<{
        user?: { first_name?: string; last_name?: string };
      }>;
    }
  ).assigned_invigilators_details;
  if (Array.isArray(inv) && inv.length > 0 && inv[0].user) {
    const u = inv[0].user;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
    return name || "—";
  }
  return "—";
}

function computeTimeRemaining(exam: CbtExam): string {
  const scheduleDate = exam.schedule_date;
  const scheduleTime = exam.schedule_time;
  const duration = exam.duration;
  if (!scheduleDate || !scheduleTime || duration == null) return "—";
  try {
    const start = new Date(`${scheduleDate}T${scheduleTime}`);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    const now = new Date();
    if (now >= end) return "00:00:00";
    const ms = end.getTime() - now.getTime();
    const s = Math.floor(ms / 1000);
    return formatTimeElapsed(s);
  } catch {
    return "—";
  }
}

const getStatusColor = (status: LiveTestSession["status"]) => {
  switch (status) {
    case "in-progress":
      return "text-orange-600";
    case "completed":
      return "text-green-600";
    case "scheduled":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

const getStatusLabel = (status: LiveTestSession["status"]) => {
  switch (status) {
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "scheduled":
      return "Scheduled";
    default:
      return status;
  }
};

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "scheduled", label: "Scheduled" },
];

export default function MonitorTestSessionsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [monitorModalOpen, setMonitorModalOpen] = useState(false);
  const [scriptReviewModalOpen, setScriptReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<LiveTestSession | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: examsResponse, isLoading: isLoadingExams } =
    useGetCbtExamsQuery({ _all: true });
  const { data: resultsResponse, isLoading: isLoadingResults } =
    useGetCbtResultsQuery({ _all: true });
  const { data: selectedResultResponse } = useGetCbtResultByIdQuery(
    selectedResultId ?? "",
    {
      skip: !selectedResultId,
    },
  );

  const examsList = useMemo(() => getExamsList(examsResponse), [examsResponse]);
  const resultsList = useMemo(
    () => getResultsList(resultsResponse),
    [resultsResponse],
  );

  const liveTestSessions: LiveTestSession[] = useMemo(() => {
    return examsList
      .map((exam) => {
        const examResults = resultsList.filter((r) => r.exam_id === exam.id);
        const activeStudents = examResults.filter(
          (r) => !r.completed_at,
        ).length;
        const submittedStudents = examResults.filter(
          (r) => r.completed_at,
        ).length;
        const scheduleDate = exam.schedule_date;
        const scheduleTime = exam.schedule_time;
        let startTime: Date;
        try {
          if (scheduleDate && scheduleTime) {
            startTime = new Date(`${scheduleDate}T${scheduleTime}`);
          } else {
            startTime = parseISO(exam.created_at);
          }
        } catch {
          startTime = parseISO(exam.created_at);
        }
        const isScheduled = startTime > new Date();
        const status: LiveTestSession["status"] = exam.completed
          ? "completed"
          : isScheduled
            ? "scheduled"
            : "in-progress";
        const classDisplay =
          typeof exam.applicable_grades === "string"
            ? exam.applicable_grades
            : Array.isArray(exam.applicable_grades)
              ? (exam.applicable_grades as string[]).join(", ")
              : "—";
        return {
          id: exam.id,
          examTitle: exam.title ?? "",
          class: classDisplay,
          invigilator: getInvigilatorDisplay(exam),
          startTime,
          timeRemaining:
            status === "in-progress"
              ? computeTimeRemaining(exam)
              : status === "completed"
                ? "00:00:00"
                : "—",
          totalStudents: examResults.length,
          activeStudents,
          submittedStudents,
          status,
        };
      })
      .filter((s) => s.totalStudents > 0);
  }, [examsList, resultsList]);

  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return liveTestSessions;
    return liveTestSessions.filter((s) => s.status === statusFilter);
  }, [liveTestSessions, statusFilter]);

  const selectedExam = useMemo(
    () =>
      selectedSession
        ? examsList.find((e) => e.id === selectedSession.id)
        : null,
    [selectedSession, examsList],
  );
  const resultsForSelectedExam = useMemo(
    () =>
      selectedSession
        ? resultsList.filter((r) => r.exam_id === selectedSession.id)
        : [],
    [selectedSession, resultsList],
  );

  const studentsForModal = useMemo(() => {
    return resultsForSelectedExam.map((r) => {
      const fullName = r.stakeholder?.user
        ? [r.stakeholder.user.first_name, r.stakeholder.user.last_name]
            .filter(Boolean)
            .join(" ")
            .trim()
        : r.user
          ? [r.user.first_name, r.user.last_name]
              .filter(Boolean)
              .join(" ")
              .trim()
          : "";
      const schoolId =
        (r.stakeholder &&
          (r.stakeholder as { student_id?: string }).student_id) ||
        r.user?.email ||
        "—";
      const examStartTime = r.created_at
        ? format(parseISO(r.created_at), "h:mm a")
        : "—";
      const timeElapsed = formatTimeElapsed(r.total_time_spent ?? 0);
      const questionsAnswered = Array.isArray(r.answers) ? r.answers.length : 0;
      const totalQuestions = selectedExam?.total_questions ?? 0;
      const status = r.completed_at
        ? ("submitted" as const)
        : ("active" as const);
      return {
        id: r.id,
        fullName: fullName || "—",
        schoolId,
        examStartTime,
        timeElapsed,
        questionsAnswered,
        totalQuestions,
        status,
      };
    });
  }, [resultsForSelectedExam, selectedExam]);

  const selectedResult = selectedResultResponse?.data as CbtResult | undefined;
  const scriptReviewStudent = useMemo(() => {
    if (!selectedResult) return null;
    const fullName = selectedResult.stakeholder?.user
      ? [
          selectedResult.stakeholder.user.first_name,
          selectedResult.stakeholder.user.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
      : selectedResult.user
        ? [selectedResult.user.first_name, selectedResult.user.last_name]
            .filter(Boolean)
            .join(" ")
            .trim()
        : "";
    const schoolId =
      (selectedResult.stakeholder &&
        (selectedResult.stakeholder as { student_id?: string }).student_id) ||
      selectedResult.user?.email ||
      "—";
    const grades = selectedExam?.applicable_grades;
    const currentClass =
      typeof grades === "string"
        ? grades
        : Array.isArray(grades)
          ? (grades as string[]).join(", ")
          : "—";
    return {
      id: selectedResult.id,
      fullName: fullName || "—",
      schoolId,
      currentClass,
      rawScore: selectedResult.score ?? 0,
      totalScore:
        (selectedResult.exam &&
          (selectedResult.exam as { total_marks_available?: number })
            .total_marks_available) ??
        selectedResult.score ??
        0,
    };
  }, [selectedResult, selectedExam]);

  const scriptReviewQuestions = useMemo(() => {
    if (!selectedResult || !selectedResult.exam) return [];
    const exam = selectedResult.exam as {
      questions?: Array<{
        id: string;
        question?: string;
        answer_options?: string[];
        correct_answer?: number;
      }>;
    };
    const questions = exam.questions;
    const answers = Array.isArray(selectedResult.answers)
      ? selectedResult.answers
      : [];
    if (!Array.isArray(questions) || questions.length === 0) {
      return answers.map((a, i) => ({
        id: String(i),
        questionType: "Multiple Choice",
        question: `Question ${i + 1}`,
        correctAnswer: "—",
        studentResponse:
          a.selected_option != null ? String(a.selected_option) : "—",
        scoreEarned: a.is_correct ? "1/1" : "0/1",
        isCorrect: !!a.is_correct,
        topicTag: "—",
      }));
    }
    return answers.map((ans, i) => {
      const q = questions[i] ?? questions[0];
      const opts = q.answer_options ?? [];
      const correctIdx = q.correct_answer ?? 0;
      const correctLabel =
        opts[correctIdx] != null
          ? `${String.fromCharCode(65 + correctIdx)} ${opts[correctIdx]}`
          : "—";
      const studentLabel =
        ans.selected_option != null && opts[ans.selected_option] != null
          ? `${String.fromCharCode(65 + ans.selected_option)} ${opts[ans.selected_option]}`
          : String(ans.selected_option ?? "—");
      return {
        id: q.id,
        questionType: "Multiple Choice",
        question: q.question ?? "",
        correctAnswer: correctLabel,
        studentResponse: studentLabel,
        scoreEarned: ans.is_correct ? "1/1" : "0/1",
        isCorrect: !!ans.is_correct,
        topicTag: "—",
      };
    });
  }, [selectedResult]);

  const columns: TableColumn<LiveTestSession>[] = [
    { key: "examTitle", title: "Subjects", className: "font-medium" },
    {
      key: "class",
      title: "Grade",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "activeStudents",
      title: "Attendance",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "invigilator",
      title: "Invigilator",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "timeRemaining",
      title: "Time Remaining",
      render: (value) => <span className="text-sm">{value}</span>,
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
          {getStatusLabel(row.status)}
        </span>
      ),
    },
  ];

  const actions: TableAction<LiveTestSession>[] = [
    {
      type: "button",
      config: {
        label: "Monitor Session",
        onClick: (row) => {
          setSelectedSession(row);
          setMonitorModalOpen(true);
        },
        variant: "link",
        disabled: (row) => row.status === "scheduled",
        className: "text-main-blue underline underline-offset-3 h-auto",
      },
    },
  ];

  const handleReviewScript = (resultId: string) => {
    setSelectedResultId(resultId);
    setCurrentQuestionIndex(0);
    setScriptReviewModalOpen(true);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < scriptReviewQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const isLoading = isLoadingExams || isLoadingResults;
  const inProgressSessions = liveTestSessions.filter(
    (s) => s.status === "in-progress",
  );
  const totalActiveStudents = inProgressSessions.reduce(
    (sum, s) => sum + s.activeStudents,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Monitor Live Test Sessions
        </h2>
        <p className="text-gray-600 mt-1">
          This screen provides a real-time status of all students currently
          taking a specific Computer-Based test (CBT) exam.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Total Number of Exams Live"
          value={isLoading ? "—" : String(inProgressSessions.length)}
          trend="up"
        />
        <MetricCard
          title="Total Number of Students on System"
          value={isLoading ? "—" : String(totalActiveStudents)}
          trend="up"
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-gray-800 shrink-0">
            Live Test Sessions
          </CardTitle>
          <div className="flex justify-end shrink-0 w-[180px]">
            <SelectField
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Status Filter"
            >
              {statusFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectField>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredSessions}
              actions={actions}
              isLoading={isLoading}
              emptyMessage="No live test sessions found."
              tableClassName="border-collapse"
            />
          </div>
        </CardContent>
      </Card>

      {selectedSession && (
        <MonitorLiveTestSessionModal
          open={monitorModalOpen}
          onOpenChange={setMonitorModalOpen}
          examTitle={selectedSession.examTitle}
          totalStudents={selectedSession.totalStudents}
          invigilator={selectedSession.invigilator}
          timeRemaining={selectedSession.timeRemaining}
          students={studentsForModal}
          onReviewScript={handleReviewScript}
          hasMore={false}
        />
      )}

      {selectedResultId && scriptReviewStudent && (
        <ScriptReviewModal
          open={scriptReviewModalOpen}
          onOpenChange={setScriptReviewModalOpen}
          examTitle={selectedSession?.examTitle ?? "Exam"}
          student={scriptReviewStudent}
          questions={scriptReviewQuestions}
          currentQuestionIndex={currentQuestionIndex}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
        />
      )}
    </div>
  );
}
