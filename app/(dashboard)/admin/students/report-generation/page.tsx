"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportTable } from "@/components/dashboard-pages/admin/students/components/report-table";
import { Icon } from "@/components/general/huge-icon";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { FilterIcon, Csv02Icon } from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  useLazyDownloadResultQuery,
  useGenerateGradeReportsMutation,
  useGetFilteredGradeReportsQuery,
  usePublishGradeReportsMutation,
} from "@/services/results/results";
import { toast } from "sonner";

interface StudentReport {
  id: string;
  name: string;
  schoolId: string;
  academicGrade: string;
  reportStatus: "published" | "unpublished";
  progress?: number;
  dateGenerated: string;
  timeGenerated: string;
}

interface Filter {
  session: string;
  grade: string;
  term: string;
  action: "generate" | "publish" | "fetch";
}

// const initialData: StudentReport[] = [
//   {
//     id: "1",
//     name: "Chinedu Nwokodi",
//     schoolId: "178023",
//     academicGrade: "B+",
//     reportStatus: "published",
//     dateGenerated: "Oct. 10, 2025",
//     timeGenerated: "08:15AM",
//   },
//   {
//     id: "2",
//     name: "Adebisi Deborah",
//     schoolId: "178024",
//     academicGrade: "B-",
//     reportStatus: "unpublished",
//     dateGenerated: "Oct. 10, 2025",
//     timeGenerated: "08:15AM",
//   },
//   {
//     id: "3",
//     name: "Dauda Afhiz",
//     schoolId: "178025",
//     academicGrade: "A+",
//     reportStatus: "published",
//     dateGenerated: "Oct. 10, 2025",
//     timeGenerated: "08:15AM",
//   },
// ];

const TERM_OPTIONS = [
  { value: "first-term", label: "First Term" },
  { value: "second-term", label: "Second Term" },
  { value: "third-term", label: "Third Term" },
];

function ReportGenerationContent() {
  const user = useAppSelector(selectUser);
  const currSchool = user ? user.school : undefined;
  const [studentsReport, setStudentsReport] = useState<StudentReport[]>([]);
  const [filter, setFilter] = useState<Filter>({
    session: currSchool?.term.session ?? "",
    grade: "",
    term: currSchool?.academic_term ?? "",
    action: "generate",
  });
  const [sessions, setSessions] = useState<string[]>([]);

  const { data: fetchGradeReports } = useGetFilteredGradeReportsQuery(
    {
      term: filter.term,
      session: filter.session,
      class_name: filter.grade,
      school_id: currSchool?.id ?? "",
    },
    {
      skip: !currSchool?.id || !filter.grade || !filter.term || !filter.session,
    },
  );

  console.log(fetchGradeReports);

  const [fetchReports, { isLoading: isFetchingReports }] =
    useGenerateGradeReportsMutation();

  const [downloadReport] = useLazyDownloadResultQuery();

  const [publishGrades, { isLoading: isPublishingGrades }] =
    usePublishGradeReportsMutation();

  function getSessionRange(
    session: string,
    backwards = 2,
    forward = 2,
  ): string[] {
    const [startYear] = session.split("/").map(Number);

    const sessions: string[] = [];

    for (let i = -backwards; i <= forward; i++) {
      const year = startYear + i;
      sessions.push(`${year}/${year + 1}`);
    }

    return sessions;
  }

  const generateReport = async () => {
    if (!currSchool?.id) return toast.warning("School not found");
    try {
      const res = await fetchReports({
        term: filter.term,
        session: filter.session,
        class_name: filter.grade,
        school_id: currSchool.id,
      }).unwrap();
      console.log(res);
      toast.success(
        res.message ? res.message : "Report generated successfully",
      );
      const reports: StudentReport[] = res.data.generated_reports.map(
        (report) => {
          return {
            id: report.id,
            schoolId: report.student_id,
            academicGrade: report.academic_grade,
            reportStatus: report.report_status,
            dateGenerated: report.date_generated,
            timeGenerated: report.time_generated,
            name: report.student_name,
          };
        },
      );
      setStudentsReport(reports);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    if (!currSchool) return;
    const csvText = await downloadReport({
      school_id: currSchool.id,
      class_name: filter.grade,
      term: filter.term,
      session: filter.session,
    }).unwrap();

    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "grade_report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const exposeReports = async () => {
    if (!currSchool?.id) return toast.warning("School not found");
    try {
      const res = await publishGrades({
        term: filter.term,
        session: filter.session,
        class_name: filter.grade,
        school_id: currSchool.id,
        action: "publish",
      }).unwrap();
      console.log("Res from Pubblish: ", res);
      // toast.success(
      //   res.message ? res.message : "Report generated successfully",
      // );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!currSchool) return;
    const constructSessions = getSessionRange(currSchool.term.session);
    if (constructSessions.length === 0) return;
    setSessions(constructSessions);
  }, [currSchool]);

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Report Generation Portal
        </h2>
        <p className="text-gray-600 mt-1">
          Manage the generation, distribution, and archival of all student
          academic reports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Filter Results</h2>
            <div className="space-y-4 w-full py-3">
              <div className="grid grid-cols-1 w-full gap-3 sm:grid-cols-3">
                <SelectField
                  label="Academic Session"
                  value={filter.session}
                  onValueChange={(value) =>
                    setFilter((prev) => ({ ...prev, session: value }))
                  }
                  placeholder="Session"
                >
                  {sessions.map((opt, index) => (
                    <SelectItem className="w-full" key={index} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectField>
                <SelectField
                  label="Term"
                  value={filter.term}
                  onValueChange={(value) =>
                    setFilter((prev) => ({ ...prev, term: value }))
                  }
                  placeholder="Term"
                >
                  {TERM_OPTIONS.map((opt, index) => (
                    <SelectItem
                      className="w-full"
                      key={index}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectField>
                <SelectField
                  label="Grade/Class"
                  value={filter.grade}
                  onValueChange={(value) =>
                    setFilter((prev) => ({ ...prev, grade: value }))
                  }
                  placeholder="Grade/Class"
                >
                  {currSchool?.classes.map((opt) => (
                    <SelectItem className="w-full" key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectField>
              </div>
              <div className="grid grid-cols-1 w-full gap-3 items-end sm:grid-cols-2">
                <SelectField
                  label="Action"
                  value={filter.action}
                  onValueChange={(value) =>
                    setFilter((prev) => ({
                      ...prev,
                      action: value as "generate" | "publish" | "fetch",
                    }))
                  }
                  placeholder="Action"
                >
                  {[
                    { label: "Generate Report", value: "generate" },
                    { label: "Publish Bulk Reports", value: "publish" },
                    { label: "Get Grade Reports", value: "fetch" },
                  ].map((opt, index) => (
                    <SelectItem
                      className="w-full"
                      key={index}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectField>
                <Button
                  // onClick={generateReport}
                  onClick={handleDownload}
                  disabled={
                    !filter.session ||
                    !filter.term ||
                    !filter.grade ||
                    isFetchingReports ||
                    isPublishingGrades
                  }
                  className="w-full capitalize disabled:opacity-70 mt-2 sm:mt-0"
                >
                  {filter.action} report
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          {/* header */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <h2 className="text-lg font-semibold">
              All Students {`(${studentsReport.length})`}
            </h2>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 hidden">
                <Icon icon={FilterIcon} size={16} />
                Sort by
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownload}
              >
                <Icon icon={Csv02Icon} size={16} />
                Download Report
              </Button>
            </div>
          </div>
          {/* report */}
          {false ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              Loading reports...
            </p>
          ) : studentsReport.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No report cards found for the selected term and class.
            </p>
          ) : (
            <ReportTable students={studentsReport} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportGenerationPage() {
  return (
    <Suspense fallback={<ReportGenerationFallback />}>
      <ReportGenerationContent />
    </Suspense>
  );
}

function ReportGenerationFallback() {
  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded mt-2" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
