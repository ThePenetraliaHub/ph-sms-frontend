"use client";

import { useState, useMemo } from "react";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { DetailedGradeViewModal } from "@/components/dashboard-pages/student/my-grades/detailed-grade-view-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import {
  useGetAllStudentReportDocumentsQuery,
  useGetStudentSubjectResultsQuery,
} from "@/services/results/results";
import { useGetParentByUserIdQuery } from "@/services/stakeholders/stakeholders";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetStudentAttendanceReportQuery } from "@/services/attendance/attendance";
import { AttendanceRecords } from "@/services/attendance/attendance-type";
import { format } from "date-fns";
import {
  StudentReport,
  StudentSubjectResult,
} from "@/services/results/result-types";

interface Ward {
  id: string;
  full_name: string;
}

export default function GradesReportCardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const { data: currParent, isLoading: isFetchingCurrParent } =
    useGetParentByUserIdQuery(user?.id ?? "");

  //list of attached kids
  const wards: Ward[] = useMemo(() => {
    if (!currParent?.data.children_details) return [] as Ward[];
    const children: Ward[] = currParent.data.children_details.map((child) => ({
      id: child.id,
      full_name: child.full_name ?? "",
    }));
    return children;
  }, [currParent]);

  //subject results
  const {
    data: subjectResults,
    isLoading: isFetchingSubjectResults,
    isError: isSubjectResultsErr,
  } = useGetStudentSubjectResultsQuery(
    { student_id: selectedWardId },
    {
      skip: !selectedWardId,
    },
  );

  const wardSubjectResults: StudentSubjectResult[] = useMemo(() => {
    if (!subjectResults?.data) return [] as StudentSubjectResult[];
    return subjectResults?.data.subject_results;
  }, [subjectResults]);

  //report cards
  const {
    data: studentReports,
    isLoading: isFetchingStudentReports,
    isError: isStudentResultErr,
  } = useGetAllStudentReportDocumentsQuery(
    { student_id: selectedWardId },
    {
      skip: !selectedWardId,
    },
  );

  const wardReports: StudentReport[] = useMemo(() => {
    if (!studentReports?.data) return [] as StudentReport[];
    return studentReports.data.reports;
  }, [studentReports]);

  //attendance reports
  const {
    data: attendanceReport,
    isLoading: isFetchingAttendanceReport,
    isError: attendanceReportErr,
  } = useGetStudentAttendanceReportQuery(
    { student_id: selectedWardId },
    {
      skip: !selectedWardId,
    },
  );

  const wardAttendanceRecords: AttendanceRecords[] = useMemo(() => {
    if (!attendanceReport?.data) return [] as AttendanceRecords[];
    return attendanceReport?.data.records;
  }, [attendanceReport]);

  const isLoading =
    isFetchingAttendanceReport ||
    isFetchingStudentReports ||
    isFetchingSubjectResults;

  // const {
  //   displayedData: subjectPerformances,
  //   hasMore: hasMoreSubjects,
  //   loadMore: loadMoreSubjects,
  // } = usePagination({
  //   data: allSubjectPerformances,
  //   initialItemsPerPage: 4,
  //   itemsPerPage: 4,
  // });

  // const {
  //   displayedData: reportCards,
  //   hasMore: hasMoreReportCards,
  //   loadMore: loadMoreReportCards,
  // } = usePagination({
  //   data: allReportCards,
  //   initialItemsPerPage: 2,
  //   itemsPerPage: 2,
  // });

  const handleViewDetails = (subject: string) => {
    setSelectedSubject(subject);
    setModalOpen(true);
  };

  const handleDownloadPDF = (fileUrl: string) => {
    console.log("Download PDF for:", fileUrl);
  };

  const subjectColumns: TableColumn<StudentSubjectResult>[] = [
    {
      key: "subject_name",
      title: "Subject",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "session",
      title: "Session",
    },
    {
      key: "term",
      title: "Term",
    },
    {
      key: "class_name",
      title: "Class",
    },
    {
      key: "assignedTeacher",
      title: "Teacher",
      render: (value, row) => (
        <span className="font-medium text-gray-800">
          {row.assignedTeacher.name}
        </span>
      ),
    },
    {
      key: "avg_score",
      title: "Avg. Score",
    },
    {
      key: "class_score",
      title: "CA Score",
    },
    {
      key: "exam_score",
      title: "Exam Score",
    },
    {
      key: "latest_grade",
      title: "Latest Grade",
    },
    {
      key: "remarks",
      title: "Remarks",
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-main-blue"
            onClick={() => handleViewDetails(row.subject_name)}
          >
            View Details
          </Button>
        );
      },
    },
  ];

  const reportCardColumns: TableColumn<StudentReport>[] = [
    {
      key: "doc_name",
      title: "Document Name",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "academic_term",
      title: "Academic Term",
    },
    {
      key: "session",
      title: "Academic Session",
    },
    {
      key: "class_name",
      title: "Class",
    },
    {
      key: "status",
      title: "Status",
      render: (value, row) => {
        const status = row.status;
        return (
          <span
            className={`text-sm font-medium ${row.status === "approved" ? "text-green-600" : row.status === "pending" ? "text-yellow-600" : "text-destructive"}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "updated_at",
      title: "Date",
      render: (value) => (
        <span className="font-medium text-gray-800">
          {format(value as string, "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-main-blue"
            onClick={() => handleDownloadPDF(row.file_url)}
          >
            Download PDF
          </Button>
        );
      },
    },
  ];

  const attendanceColumns: TableColumn<AttendanceRecords>[] = [
    {
      key: "date",
      title: "Date",
      render: (value) => (
        <span className="font-medium text-gray-800">
          {format(value as string, "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "session",
      title: "Session",
      render: (value) => {
        return <span className="text-sm font-medium">{value as string}</span>;
      },
    },
    {
      key: "class_name",
      title: "Class",
      render: (value) => {
        return <span className="text-sm font-medium">{value as string}</span>;
      },
    },
    {
      key: "markedBy",
      title: "Teacher",
      render: (value, row) => (
        <span className="font-medium text-gray-800">
          {row.markedBy.name ?? "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Att. Status",
      render: (v, r) => {
        const status = r.status;
        return (
          <span
            className={`text-sm font-medium ${status === "present" ? "text-green-600" : "text-destructive"}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "notes",
      title: "Notes",
      render: (value) => {
        return <span className="text-sm font-medium">{value as string}</span>;
      },
    },
    // {
    //   key: "action",
    //   title: "Action",
    //   render: (value, row) => {
    //     return (
    //       <Button
    //         variant="link"
    //         className="h-auto p-0 text-main-blue"
    //         onClick={() => toast.error("Btn clicked!")}
    //       >
    //         Download PDF
    //       </Button>
    //     );
    //   },
    // },
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

      <Card>
        <CardHeader>
          <div className="space-y-1.5">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Child's Records
            </CardTitle>
            <p className="text-sm text-gray-600">
              Select which child's record to show
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            disabled={isFetchingCurrParent}
            value={selectedWardId}
            onValueChange={setSelectedWardId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => {
                return (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.full_name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Current Term Performance" value={"-"} trend="up" />
        <MetricCard title="Attendance Rate (Term)" value={"-"} trend="up" />
        <MetricCard title="Lowest Term Performance" value={"-"} trend="up" />
      </div>

      {/* main content */}
      {!selectedWardId ? (
        <div className="h-50 w-full text-muted-foreground justify-center flex items-center">
          <p>Select a child to begin.</p>
        </div>
      ) : isLoading ? (
        <div className="h-50 w-full text-muted-foreground justify-center flex items-center">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Subject specifics current averages */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
                  Subject-Specific Current Averages
                </CardTitle>
                <p className="text-sm text-gray-600">
                  This simplified table shows the running average for each
                  subject, allowing the parent to track progress week-to-week
                  without waiting for the official report card.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <DataTable
                  columns={subjectColumns}
                  data={wardSubjectResults}
                  isLoading={isFetchingSubjectResults}
                  emptyMessage={
                    isSubjectResultsErr
                      ? "Failed to fetch subject results"
                      : "No subject results records yet."
                  }
                  showActionsColumn={false}
                />
              </div>
              {/* {hasMoreSubjects && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMoreSubjects}>
                Load More
              </Button>
            </div>
          )} */}
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
                  report cards, which are typically generated at the end of a
                  term or year.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <DataTable
                  columns={reportCardColumns}
                  data={wardReports}
                  isLoading={isFetchingStudentReports}
                  emptyMessage={
                    isStudentResultErr
                      ? "Failed to fetch ward's records."
                      : "No records found."
                  }
                  showActionsColumn={false}
                />
              </div>
              {/* {hasMoreReportCards && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMoreReportCards}>
                Load More
              </Button>
            </div>
          )} */}
            </CardContent>
          </Card>

          {/* attendance reports */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
                  Attendance Reports/Summary
                </CardTitle>
                <p className="text-sm text-gray-600">
                  This table serves as the archive for the attendance records
                  for your wards across terms and sessions.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {/* attendance summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Days Present"
                  value={attendanceReport?.data.summary.present ?? "-"}
                  trend="up"
                />
                <MetricCard
                  title="Days Absent"
                  value={attendanceReport?.data.summary.absent ?? "-"}
                  trend="up"
                />
                <MetricCard
                  title="Days Excused"
                  value={attendanceReport?.data.summary.excused ?? "-"}
                  trend="up"
                />
                <MetricCard
                  title="Days Late"
                  value={attendanceReport?.data.summary.late ?? "-"}
                  trend="up"
                />
                <MetricCard
                  title="Attendance Percentage"
                  value={
                    attendanceReport?.data.summary.attendance_percentage ?? "-"
                  }
                  trend="up"
                />
                <MetricCard
                  title="Total Days"
                  value={attendanceReport?.data.summary.total_days ?? "-"}
                  trend="up"
                />
              </div>
              <div className="border rounded-lg overflow-hidden mt-10">
                <DataTable
                  columns={attendanceColumns}
                  data={wardAttendanceRecords}
                  isLoading={isFetchingAttendanceReport}
                  emptyMessage={
                    attendanceReportErr
                      ? "Failed to fetch attendance records."
                      : "No attendance record yet."
                  }
                  showActionsColumn={false}
                />
              </div>
              {/* {hasMoreReportCards && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMoreReportCards}>
                Load More
              </Button>
            </div>
          )} */}
            </CardContent>
          </Card>
        </div>
      )}

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
