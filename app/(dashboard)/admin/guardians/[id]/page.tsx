"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetStakeholderByIdQuery } from "@/services/stakeholders/stakeholders";
import { GuardianDetailsView } from "@/components/dashboard-pages/admin/guardians/views/guardian-details-view";
import { GuardianTabs } from "@/components/dashboard-pages/admin/guardians/views/guardian-tabs";
import { ViewGuardianHeader } from "@/components/dashboard-pages/admin/guardians/view-guardian-header";

type TabId = "details"; //add in future if necessary

export default function Page({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [parentId, setParentId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams =
          params instanceof Promise ? await params : params;
        const id = resolvedParams?.id;
        if (id) {
          setParentId(id);
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
    data: parent,
    isLoading,
    isError,
  } = useGetStakeholderByIdQuery(parentId ?? "", {
    skip: !parentId,
  });

  const stakeholder = parent?.data;
  // console.log("Guardian SK: ", stakeholder);

  if (!hasChecked || !parentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading guardian data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading guardian</div>
          <div className="text-gray-500 text-sm">Guardian ID: {parentId}</div>
        </div>
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Guardian not found</div>
          <div className="text-gray-500 text-sm">ID: {parentId}</div>
        </div>
      </div>
    );
  }

  if (stakeholder.type !== "parent") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">
            This is not a registered guardian
          </div>
          <div className="text-gray-500 text-sm">Type: {stakeholder.type}</div>
        </div>
      </div>
    );
  }

  const fullName = stakeholder.user
    ? `${stakeholder.user.first_name || ""} ${stakeholder.user.middle_name || ""} ${stakeholder.user.last_name || ""}`.trim()
    : "Unknown";

  const statusMap: Record<string, "active" | "on-leave" | "inactive"> = {
    active: "active",
    inactive: "inactive",
    "on-leave": "on-leave",
  };
  const status = statusMap[stakeholder.status?.toLowerCase()] || "active";

  const guardian = {
    name: fullName,
    staffId:
      stakeholder.admission_number || stakeholder.id.slice(0, 8).toUpperCase(),
    role: stakeholder.user.role || "N/A",
    status: status,
    statusLabel: stakeholder.status || "Active",
    profilePicture: stakeholder.user?.profile_image_url || undefined,
    email: stakeholder.user.email || "N/A",
    noOfWards: stakeholder.children_details?.length ?? 0,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return <GuardianDetailsView stakeholder={stakeholder} />;
      default:
        return <GuardianDetailsView stakeholder={stakeholder} />;
    }
  };

  return (
    <div className="space-y-6">
      <ViewGuardianHeader
        name={guardian.name}
        staffId={guardian.staffId}
        email={guardian.email}
        noOfWards={guardian.noOfWards}
        role={guardian.role}
        status={guardian.status}
        statusLabel={guardian.statusLabel}
        profilePicture={guardian.profilePicture}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <GuardianTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
