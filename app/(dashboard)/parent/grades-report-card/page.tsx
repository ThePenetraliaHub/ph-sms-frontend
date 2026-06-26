"use client";

import { useState, useMemo } from "react";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { DetailedGradeViewModal } from "@/components/dashboard-pages/student/my-grades/detailed-grade-view-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import { useGetAllExamResultsQuery } from "@/services/results/results";
import type {
  ExamResult,
  SubjectResult,
} from "@/services/results/result-types";
import {
  useGetStakeholderByIdQuery,
  useGetStudentByQueryParamQuery,
} from "@/services/stakeholders/stakeholders";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { toast } from "sonner";

interface SubjectPerformance {
  subject: string;
  assignedTeacher: string;
  termAverageScore: string;
  latestGrade: string;
}

interface ReportCard {
  documentName: string;
  academicPeriod: string;
  status: string;
  id?: string;
}

interface Attendance {
  date: string;
  teacher: string;
  status: "present" | "absent";
  notes?: string;
}

export default function GradesReportCardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { data: currParent, isLoading: isFetchingCurrParent } =
    useGetStudentByQueryParamQuery(user?.id ?? "");

  const { data: resultsData } = useGetAllExamResultsQuery({ _all: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const examResults = resultsData?.data ?? [];

  const allSubjectPerformances = useMemo(() => {
    const bySubject = new Map<
      string,
      { teacher: string; scores: number[]; grades: string[] }
    >();
    const sorted = [...examResults].sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime(),
    );
    for (const er of sorted) {
      for (const sr of er.subject_results ?? []) {
        const sub = (sr as SubjectResult).subject ?? "Unknown";
        if (!bySubject.has(sub)) {
          bySubject.set(sub, {
            teacher: (
              sr as SubjectResult & {
                teacher?: { first_name?: string; last_name?: string };
              }
            ).teacher
              ? `${(sr as SubjectResult & { teacher?: { first_name?: string; last_name?: string } }).teacher?.first_name ?? ""} ${(sr as SubjectResult & { teacher?: { first_name?: string; last_name?: string } }).teacher?.last_name ?? ""}`.trim() ||
                "—"
              : "—",
            scores: [],
            grades: [],
          });
        }
        const entry = bySubject.get(sub)!;
        const total = (sr as SubjectResult).total_score;
        if (typeof total === "number" && !isNaN(total))
          entry.scores.push(total);
        const grade = (sr as SubjectResult).grade;
        if (grade) entry.grades.push(grade);
      }
    }
    return Array.from(bySubject.entries()).map(
      ([subject, { teacher, scores, grades }]) => {
        const avg =
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;
        const pct = Math.round(avg);
        return {
          subject,
          assignedTeacher: teacher,
          termAverageScore: `${pct}%`,
          latestGrade:
            scores[0] != null
              ? `${scores[0]}%`
              : grades[0]
                ? `${grades[0]}`
                : "N/A",
        };
      },
    );
  }, [examResults]);

  const allReportCards = useMemo(() => {
    return examResults.map((er) => ({
      id: er.id,
      documentName: `Term ${er.term ?? "?"} Report Card`,
      academicPeriod: `${er.session ?? ""} Term ${er.term ?? ""}`.trim(),
      status: "Finalized",
    }));
  }, [examResults]);

  const overallAverage = useMemo(() => {
    if (allSubjectPerformances.length === 0) return 0;
    const sum = allSubjectPerformances.reduce(
      (acc, s) => acc + parseFloat(s.termAverageScore.replace("%", "")) || 0,
      0,
    );
    return Math.round(sum / allSubjectPerformances.length);
  }, [allSubjectPerformances]);

  const lowestSubject = useMemo(() => {
    if (allSubjectPerformances.length === 0) return null;
    return allSubjectPerformances.reduce((lowest, current) => {
      const curr = parseFloat(current.termAverageScore.replace("%", "")) || 0;
      const low = parseFloat(lowest.termAverageScore.replace("%", "")) || 0;
      return curr < low ? current : lowest;
    });
  }, [allSubjectPerformances]);

  const {
    displayedData: subjectPerformances,
    hasMore: hasMoreSubjects,
    loadMore: loadMoreSubjects,
  } = usePagination({
    data: allSubjectPerformances,
    initialItemsPerPage: 4,
    itemsPerPage: 4,
  });

  const {
    displayedData: reportCards,
    hasMore: hasMoreReportCards,
    loadMore: loadMoreReportCards,
  } = usePagination({
    data: allReportCards,
    initialItemsPerPage: 2,
    itemsPerPage: 2,
  });

  const handleViewDetails = (subject: string) => {
    setSelectedSubject(subject);
    setModalOpen(true);
  };

  const handleDownloadPDF = (reportCard: ReportCard) => {
    console.log("Download PDF for:", reportCard.documentName);
  };

  const subjectColumns: TableColumn<SubjectPerformance>[] = [
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
            onClick={() => handleViewDetails(row.subject)}
          >
            View Details
          </Button>
        );
      },
    },
  ];

  const reportCardColumns: TableColumn<ReportCard>[] = [
    {
      key: "documentName",
      title: "Document Name",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "academicPeriod",
      title: "Academic Period",
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as string;
        return (
          <span className="text-sm font-medium text-green-600">{status}</span>
        );
      },
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-main-blue"
            onClick={() => handleDownloadPDF(row)}
          >
            Download PDF
          </Button>
        );
      },
    },
  ];

  const attendanceColumns: TableColumn<Attendance>[] = [
    {
      key: "date",
      title: "Date",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "teacher",
      title: "Marked By",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as string;
        return (
          <span className="text-sm font-medium text-green-600">{status}</span>
        );
      },
    },
    {
      key: "notes",
      title: "Notes",
      render: (value) => {
        const status = value as string;
        return (
          <span className="text-sm font-medium text-green-600">{status}</span>
        );
      },
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-main-blue"
            onClick={() => toast.error("Btn clicked!")}
          >
            Download PDF
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Grades & Report Card Overview
        </h1>
        <p className="text-gray-600">
          This screen provides parents with a consolidated view of their
          child&apos;s academic performance, current standing, and access to all
          official reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Current Term Performance"
          value={overallAverage > 0 ? `${overallAverage}%` : "—"}
          trend="up"
        />
        <MetricCard title="Attendance Rate (Term)" value="—" trend="up" />
        <MetricCard
          title="Lowest Term Performance"
          value={
            lowestSubject
              ? `${lowestSubject.subject}: ${lowestSubject.termAverageScore}`
              : "—"
          }
          trend="up"
        />
      </div>

      {/* Subject specifics current averages */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
              Subject-Specific Current Averages
            </CardTitle>
            <p className="text-sm text-gray-600">
              This simplified table shows the running average for each subject,
              allowing the parent to track progress week-to-week without waiting
              for the official report card.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={subjectColumns}
              data={subjectPerformances}
              showActionsColumn={false}
            />
          </div>
          {hasMoreSubjects && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMoreSubjects}>
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* official report card access */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
              Official Report Card Access
            </CardTitle>
            <p className="text-sm text-gray-600">
              This table serves as the archive for all finalized, official
              report cards, which are typically generated at the end of a term
              or year.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={reportCardColumns}
              data={reportCards}
              showActionsColumn={false}
            />
          </div>
          {hasMoreReportCards && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMoreReportCards}>
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* attendance reports */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
              Attendance Reports
            </CardTitle>
            <p className="text-sm text-gray-600">
              This table serves as the archive for the attendance records for
              your wards across terms and sessions.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={attendanceColumns}
              data={[]}
              showActionsColumn={false}
            />
          </div>
          {hasMoreReportCards && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMoreReportCards}>
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSubject && (
        <DetailedGradeViewModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          subject={selectedSubject}
        />
      )}
    </div>
  );
}
