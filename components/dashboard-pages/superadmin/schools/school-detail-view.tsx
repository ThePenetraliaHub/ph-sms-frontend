"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetSchoolByIdQuery } from "@/services/schools/schools";
import { Card } from "@/components/ui/card";
import { SchoolDetailHeader } from "@/components/dashboard-pages/superadmin/schools/components/school-detail-header";
import { SchoolDetailSectionNav } from "@/components/dashboard-pages/superadmin/schools/components/school-detail-section-nav";
import { SchoolDetailsPanel } from "@/components/dashboard-pages/superadmin/schools/components/school-details-panel";
import { SchoolAcademicPanel } from "@/components/dashboard-pages/superadmin/schools/components/school-academic-panel";
import { SchoolSubscriptionPanel } from "@/components/dashboard-pages/superadmin/schools/components/school-subscription-panel";
import {
  SCHOOL_DETAIL_SECTIONS,
  type SchoolDetailSectionId,
} from "./school-detail-sections";

interface SchoolDetailViewProps {
  schoolId: string;
}

export function SchoolDetailView({ schoolId }: SchoolDetailViewProps) {
  const router = useRouter();
  const [section, setSection] =
    useState<SchoolDetailSectionId>("school-details");

  const {
    data: schoolResponse,
    isLoading,
    isError,
  } = useGetSchoolByIdQuery(schoolId, {
    skip: !schoolId,
  });

  const school = schoolResponse?.data;

  const handleBack = () => router.push("/superadmin/main");

  if (!schoolId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-muted-foreground">
        <p>Invalid school.</p>
        <button
          type="button"
          onClick={handleBack}
          className="text-main-blue hover:underline"
        >
          Back to schools
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (isError || !school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-muted-foreground">
        <p>School not found.</p>
        <button
          type="button"
          onClick={handleBack}
          className="text-main-blue hover:underline"
        >
          Back to schools
        </button>
      </div>
    );
  }

  const renderPanel = () => {
    switch (section) {
      case "school-details":
        return <SchoolDetailsPanel school={school} />;
      case "academic":
        return <SchoolAcademicPanel school={school} />;
      case "subscription":
        return <SchoolSubscriptionPanel school={school} />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SchoolDetailHeader school={school} />
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <SchoolDetailSectionNav
          sections={SCHOOL_DETAIL_SECTIONS}
          activeSection={section}
          onSectionChange={setSection}
        />
        <Card className="p-6">{renderPanel()}</Card>
      </div>
    </div>
  );
}
