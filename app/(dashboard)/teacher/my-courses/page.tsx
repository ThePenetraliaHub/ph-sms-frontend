"use client";

import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { useAppSelector } from "@/store/hooks";
import {
  Upload05Icon,
  AssignmentsIcon,
  LibrariesIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import UploadNewResource from "@/components/dashboard-pages/teacher/my-courses/modals/upload-new-resource";
import { useRouter } from "next/navigation";
import ViewAssignmentSubmissions from "@/components/dashboard-pages/teacher/my-courses/modals/view-assignment-submissions";
import ScoreInputGrid from "@/components/dashboard-pages/teacher/my-courses/modals/score-input-grid";
import { selectUser } from "@/store/slices/authSlice";
import { useGetStudentByQueryParamQuery } from "@/services/stakeholders/stakeholders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetClassQuery } from "@/services/schools/schools";
import { Button } from "@/components/ui/button";
import ViewSubject from "@/components/dashboard-pages/teacher/my-courses/modals/view-subject";
import { Subject } from "@/services/subjects/subject-types";

export interface TeacherCourse {
  id: string;
  subject: string;
  class: string;
  studentsEnrolled: number;
  code: string;
  status: string;
  applicableGrade: string[];
  ca_score: number;
  exam_score: number;
  credit_units: number;
  curriculumStandard: string;
  resources: {
    created_at: string;
    file_link: string;
    format: string;
    id: string;
    name: string;
    type: string;
  }[];
  teachers: any[];
}

export type AssignmentSubmission = {
  id: string;
  name: string;
  subject: string;
  submitted: string;
  marks: string;
};

export default function MyCoursesPage() {
  const { push } = useRouter();
  const appError = useAppSelector((state) => state.error.lastError);
  const [openNewResourceModal, setOpenNewResourceModal] =
    useState<boolean>(false);
  const [openViewAssModal, setOpenViewAssModal] = useState<boolean>(false);
  const [openScoreInputModal, setOpenScoreInputModal] =
    useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentSubmission>();

  const [classFilter, setClassFilter] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>();
  const [myCourses, setMyCourses] = useState<TeacherCourse[]>([]);
  const [openViewSubMod, setOpenViewSubMod] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<TeacherCourse>();

  const user = useAppSelector(selectUser);

  const columns: TableColumn<TeacherCourse>[] = [
    {
      key: "subject",
      title: "Subject",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "class",
      title: "Class",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "studentsEnrolled",
      title: "Students Enrolled",
      render: (value) => (
        <span className="text-gray-700">{value as number}</span>
      ),
    },
    {
      key: "code",
      title: "Subject Code",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={`${value === "approved" ? "text-green-600" : value === "rejected" ? "text-red-600" : "text-gray-700"} capitalize`}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <Button
            // href={`/teacher/my-courses/${row.id}`}
            variant={"outline"}
            onClick={() => {
              setSelectedSubject(row);
              setOpenViewSubMod(true);
            }}
            className="text-main text-sm font-medium"
          >
            View More
          </Button>
        );
      },
    },
  ];

  //get stakeholder
  const { data: staffDataResponse, isLoading: isFetchingStakeholder } =
    useGetStudentByQueryParamQuery(user?.id ?? "", {
      skip: !user?.id,
    });
  const stakeholder = staffDataResponse?.data[0];

  //get class details
  const {
    data: class_data,
    isLoading: isFetchingClass,
    isError: isFetchingClassError,
  } = useGetClassQuery(
    { id: user?.school_id ?? "", class_name: selectedClass ?? "" },
    { skip: !user?.school_id || !selectedClass },
  );

  useEffect(() => {
    if (!selectedAssignment) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenScoreInputModal(true);
  }, [selectedAssignment]);

  useEffect(() => {
    if (!stakeholder) return;
    setClassFilter(stakeholder.assigned_classes ?? []);
  }, [stakeholder]);

  useEffect(() => {
    if (!class_data) return;
    const rebranded_courses: TeacherCourse[] = class_data.data.subjects.map(
      (subject) => ({
        id: subject.id ?? "",
        subject: subject.name ?? "",
        class: selectedClass ?? "",
        studentsEnrolled: class_data.data.students.length,
        code: subject.code,
        status: subject.status,
        applicableGrade: subject.applicable_grade,
        ca_score: subject.continuous_assessment,
        exam_score: subject.final_exam,
        credit_units: subject.credit_units,
        curriculumStandard: subject.curriculum_standard,
        resources: subject.resources,
        teachers: subject.teachers,
      }),
    );
    setMyCourses(rebranded_courses);
  }, [class_data]);

  return (
    <div className="space-y-4">
      {appError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {appError.message}
        </div>
      )}
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          LMS: My Courses Dashboard
        </h1>
        <p className="text-gray-600">
          The teacher&apos;s central homepage for managing all their digital
          courses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="My Active Courses"
          value="5 Courses"
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Pending Content Approval"
          value="3 Resources"
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Assessment Submissions"
          value="12"
          trend="up"
          trendColor="text-main-blue"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <QuickActionCard
            title="Upload New Resource"
            description="A modal to upload a file (PDF, Video, PPT) and tag it to a specific course and unit."
            icon={Upload05Icon}
            // onClick={() => console.log("Upload New Resource")}
            onClick={() => setOpenNewResourceModal(true)}
            className="border-b"
          />
          <QuickActionCard
            title="Create New Assignment/Quiz"
            description="Create a new digital task and assign it."
            icon={AssignmentsIcon}
            // onClick={() => console.log("Create New Assignment/Quiz")}
            onClick={() => push("/teacher/my-courses/create-new-questions")}
            className="border-b"
          />
          <QuickActionCard
            title="View My Content Library"
            description="Links to a personal repository of all files the teacher has uploaded, allowing reuse across different courses."
            icon={LibrariesIcon}
            onClick={() => push("/teacher/my-courses/content-library")}
            className="border-b"
          />
          <QuickActionCard
            title="View Assignment Submissions"
            description="This screen lists all student assignments and quizzes that require the teacher's attention."
            icon={AssignmentsIcon}
            onClick={() => setOpenViewAssModal(true)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex justify-between items-center">
            <p>My Courses</p>
            <Select
              value={""}
              disabled={isFetchingClass || isFetchingStakeholder}
              onValueChange={(value) => setSelectedClass(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue
                  placeholder={selectedClass ? selectedClass : "Select Class"}
                />
              </SelectTrigger>
              <SelectContent>
                {classFilter.map((clx, idx) => {
                  return (
                    <SelectItem key={idx} value={clx}>
                      {clx}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFetchingClass ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-muted-foreground">Loading courses...</span>
            </div>
          ) : !selectedClass ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-muted-foreground">
                Kindly select a class.
              </span>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={myCourses}
                showActionsColumn={true}
                emptyMessage={
                  isFetchingClassError
                    ? "Unable to load courses at the moment."
                    : "No courses found."
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* upload new resource modal */}
      <UploadNewResource
        schoolId={user?.school.id ?? ""}
        assigned_classes={stakeholder?.assigned_classes ?? []}
        open={openNewResourceModal}
        onOpenChange={setOpenNewResourceModal}
      />
      {/* view assignment submissions modal */}
      <ViewAssignmentSubmissions
        open={openViewAssModal}
        onOpenChange={setOpenViewAssModal}
        setSelectedAssignment={setSelectedAssignment}
      />

      {/* score input modal */}
      {selectedAssignment && (
        <ScoreInputGrid
          selectedAssignment={selectedAssignment}
          open={openScoreInputModal}
          onOpenChange={setOpenScoreInputModal}
        />
      )}

      {/* view course modal */}
      <ViewSubject
        subject={selectedSubject}
        setSubject={setSelectedSubject}
        open={openViewSubMod}
        onOpenChange={setOpenViewSubMod}
      />
    </div>
  );
}
