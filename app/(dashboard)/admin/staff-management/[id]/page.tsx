"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StaffHeader } from "@/components/dashboard-pages/admin/staff/components/staff-header/staff-header";
import { StaffTabs } from "@/components/dashboard-pages/admin/staff/components/staff-tabs/staff-tabs";
import { PersonalDetailsView } from "@/components/dashboard-pages/admin/staff/views/personal-details-view";
import { AssignmentsScheduleView } from "@/components/dashboard-pages/admin/staff/views/assignments-schedule-view";
import { HRComplianceView } from "@/components/dashboard-pages/admin/staff/views/hr-compliance-view";
import { ActivityLogView } from "@/components/dashboard-pages/admin/staff/views/activity-log-view";
import { useGetStakeholderByIdQuery } from "@/services/stakeholders/stakeholders";
import { format } from "date-fns";

type TabId = "personal" | "assignments" | "hr" | "activity";

export default function StaffDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [staffId, setStaffId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams =
          params instanceof Promise ? await params : params;
        const id = resolvedParams?.id;
        if (id) {
          setStaffId(id);
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
    data: staffDataResponse,
    isLoading,
    isError,
  } = useGetStakeholderByIdQuery(staffId ?? "", {
    skip: !staffId,
  });

  const stakeholder = staffDataResponse?.data;
  console.log(stakeholder); //PROBLEM POINT FROM BACKEND

  if (!hasChecked || !staffId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading staff data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading staff</div>
          <div className="text-gray-500 text-sm">Staff ID: {staffId}</div>
        </div>
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Staff not found</div>
          <div className="text-gray-500 text-sm">ID: {staffId}</div>
        </div>
      </div>
    );
  }

  if (stakeholder.type !== "staff" && stakeholder.type !== "teacher") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">This is not a staff member</div>
          <div className="text-gray-500 text-sm">Type: {stakeholder.type}</div>
        </div>
      </div>
    );
  }

  const fullName = stakeholder.user
    ? `${stakeholder.user.first_name || ""} ${stakeholder.user.middle_name || ""} ${stakeholder.user.last_name || ""}`.trim()
    : "Unknown";

  let contractStatus = "Active";
  if (stakeholder.contract_end_date) {
    try {
      const endDate = new Date(stakeholder.contract_end_date);
      const now = new Date();
      if (endDate < now) {
        contractStatus = `Expired on ${format(endDate, "MMM d, yyyy")}`;
      } else {
        contractStatus = `Expires ${format(endDate, "MMM d, yyyy")}`;
      }
    } catch {
      contractStatus = `Expires ${stakeholder.contract_end_date}`;
    }
  }

  const statusMap: Record<string, "active" | "on-leave" | "inactive"> = {
    active: "active",
    inactive: "inactive",
    "on-leave": "on-leave",
  };
  const status = statusMap[stakeholder.status?.toLowerCase()] || "active";

  const leaveBalance = stakeholder.annual_leave_entitlement
    ? parseInt(stakeholder.annual_leave_entitlement) || 0
    : 0;

  const staff = {
    name: fullName,
    staffId:
      stakeholder.admission_number || stakeholder.id.slice(0, 8).toUpperCase(),
    role: stakeholder.position || "Staff",
    contractStatus: contractStatus,
    leaveBalance: leaveBalance,
    status: status,
    statusLabel: stakeholder.status || "Active",
    profilePicture: stakeholder.user?.profile_image_url || undefined,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalDetailsView stakeholder={stakeholder} />;
      case "assignments":
        return <AssignmentsScheduleView stakeholder={stakeholder} />;
      case "hr":
        return <HRComplianceView stakeholder={stakeholder} />;
      case "activity":
        return <ActivityLogView stakeholder={stakeholder} />;
      default:
        return <PersonalDetailsView stakeholder={stakeholder} />;
    }
  };

  return (
    <div className="space-y-6">
      <StaffHeader
        name={staff.name}
        staffId={staff.staffId}
        role={staff.role}
        contractStatus={staff.contractStatus}
        leaveBalance={staff.leaveBalance}
        status={staff.status}
        statusLabel={staff.statusLabel}
        profilePicture={staff.profilePicture}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <StaffTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
