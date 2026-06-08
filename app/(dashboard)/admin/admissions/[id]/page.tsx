"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ApplicantHeader } from "@/components/dashboard-pages/admin/admissions/components/applicant-header";
import { ApplicantTabs } from "@/components/dashboard-pages/admin/admissions/components/applicant-tabs";
import { PersonalDetailsView } from "@/components/dashboard-pages/admin/admissions/views/personal-details-view";
import { AcademicHistoryView } from "@/components/dashboard-pages/admin/admissions/views/academic-history-view";
import { DocumentsView } from "@/components/dashboard-pages/admin/admissions/views/documents-view";
import { ReviewersNotesView } from "@/components/dashboard-pages/admin/admissions/views/reviewers-notes-view";
import { useGetStakeholderByIdQuery } from "@/services/stakeholders/stakeholders";
import { getStakeholderStageLabel } from "@/services/stakeholders/stakeholders-selector";

type TabId = "personal" | "academic" | "documents" | "notes";

export default function ApplicantDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [stakeholderId, setStakeholderId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams =
          params instanceof Promise ? await params : params;
        const id = resolvedParams?.id;
        if (id) {
          setStakeholderId(id);
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
    data: stakeholderData,
    isLoading,
    isError,
  } = useGetStakeholderByIdQuery(stakeholderId ?? "", {
    skip: !stakeholderId,
  });

  const stakeholder = stakeholderData?.data;

  const getStatusFromStage = (
    stage: number,
  ): "new" | "pending" | "accepted" | "rejected" | "enrolled" => {
    if (stage === 1) return "new";
    if (stage >= 2 && stage <= 4) return "pending";
    if (stage === 5) return "accepted";
    if (stage === 6) return "enrolled";
    return "new";
  };

  if (!hasChecked || !stakeholderId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading stakeholder data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading stakeholder</div>
          <div className="text-gray-500 text-sm">
            Stakeholder ID: {stakeholderId}
          </div>
        </div>
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Stakeholder not found</div>
          <div className="text-gray-500 text-sm">ID: {stakeholderId}</div>
        </div>
      </div>
    );
  }

  if (stakeholder.type !== "student") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">
            This is not a student application
          </div>
          <div className="text-gray-500 text-sm">Type: {stakeholder.type}</div>
        </div>
      </div>
    );
  }

  const date = stakeholder.created_at
    ? new Date(stakeholder.created_at)
    : new Date();
  const applicantHeaderData = {
    name: `${stakeholder.user?.first_name} ${stakeholder.user?.last_name}`,
    status: getStatusFromStage(stakeholder.stage ?? 0),
    statusLabel:
      stakeholder.stage_text ||
      getStakeholderStageLabel(stakeholder.stage ?? 0),
    applicationId: stakeholder.id,
    classApplyingFor: stakeholder.class_assigned || "—",
    dateSubmitted: format(date, "MMM. d, yyyy"),
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalDetailsView stakeholder={stakeholder} />;
      case "academic":
        return <AcademicHistoryView stakeholder={stakeholder} />;
      case "documents":
        return <DocumentsView stakeholder={stakeholder} />;
      case "notes":
        return <ReviewersNotesView stakeholder={stakeholder} />;
      default:
        return <PersonalDetailsView stakeholder={stakeholder} />;
    }
  };

  return (
    <div className="space-y-6">
      <ApplicantHeader
        name={applicantHeaderData.name}
        status={applicantHeaderData.status}
        statusLabel={applicantHeaderData.statusLabel}
        applicationId={applicantHeaderData.applicationId}
        classApplyingFor={applicantHeaderData.classApplyingFor}
        dateSubmitted={applicantHeaderData.dateSubmitted}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <ApplicantTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
