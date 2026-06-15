"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StudentHeader } from "@/components/dashboard-pages/admin/students/components/student-header";
import { StudentTabs } from "@/components/dashboard-pages/admin/students/components/student-tabs";
import { PersonalDetailsView } from "@/components/dashboard-pages/admin/students/views/student/personal-details-view";
import { AcademicOverviewView } from "@/components/dashboard-pages/admin/students/views/student/academic-overview-view";
import { DocumentsView } from "@/components/dashboard-pages/admin/students/views/student/documents-view";
import { ReviewersNotesView } from "@/components/dashboard-pages/admin/students/views/student/reviewers-notes-view";

import { useGetStudentByIdQuery } from "@/services/stakeholders/stakeholders";

type TabId = "personal" | "academic" | "documents" | "notes";

export default function StudentDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams =
          params instanceof Promise ? await params : params;
        const id = resolvedParams?.id;
        if (id) {
          setStudentId(id);
        } else {
          console.warn("No ID found in params:", resolvedParams);
        }
        setHasChecked(true);
      } catch (error) {
        console.error("Error resolving params:", error);
        setHasChecked(true);
      }
    };
    resolveParams();
  }, [params]);

  const {
    data: studentData,
    isLoading,
    isError,
  } = useGetStudentByIdQuery(studentId ?? "", {
    skip: !studentId,
  });

  const student = studentData?.data;
  console.log(student);

  const getStatusFromStage = (
    stage: number,
  ): "active" | "inactive" | "suspended" | "graduated" | "withdrawn" => {
    if (stage === 6) return "active";
    if (stage === 0 || stage === 7) return "withdrawn";
    return "active";
  };

  if (!hasChecked || !studentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading student data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading student</div>
          <div className="text-gray-500 text-sm">Student ID: {studentId}</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Student not found</div>
          <div className="text-gray-500 text-sm">ID: {studentId}</div>
        </div>
      </div>
    );
  }

  if (student.type !== "student") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">This is not a student</div>
          <div className="text-gray-500 text-sm">Type: {student.type}</div>
        </div>
      </div>
    );
  }

  const studentName = `${student.user.first_name} ${student.user.last_name}`;
  const studentStatus = getStatusFromStage(student.stage);
  const statusLabel = student.stage_text || `Stage ${student.stage}`;

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalDetailsView stakeholder={student} />;
      case "academic":
        return <AcademicOverviewView stakeholder={student} />;
      case "documents":
        return <DocumentsView stakeholder={student} />;
      case "notes":
        return <ReviewersNotesView stakeholder={student} />;
      default:
        return <PersonalDetailsView stakeholder={student} />;
    }
  };

  return (
    <div className="space-y-6">
      <StudentHeader
        name={studentName}
        studentId={student.admission_number || student.id}
        currentClass={student.class_assigned || "—"}
        status={studentStatus}
        statusLabel={statusLabel}
        profilePicture={student.user.profile_image_url || undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <StudentTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-0 bg-background">
            <CardContent className="p-6">{renderTabContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
