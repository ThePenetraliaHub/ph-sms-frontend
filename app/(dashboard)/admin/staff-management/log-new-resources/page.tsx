"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ResourceTabs } from "@/components/dashboard-pages/admin/staff/components/resource-tabs/resource-tabs";
import { LogStaffAssignmentForm } from "@/components/dashboard-pages/admin/staff/forms/log-staff-assignment-form";
import { LogResourceAllocationForm } from "@/components/dashboard-pages/admin/staff/forms/log-resource-allocation-form";

type TabId = "assignment" | "allocation";

export default function LogNewResourcesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("assignment");

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = () => {};

  const renderTabContent = () => {
    switch (activeTab) {
      case "assignment":
        return (
          <LogStaffAssignmentForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        );
      case "allocation":
        return (
          <LogResourceAllocationForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        );
      default:
        return (
          <LogStaffAssignmentForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">Log New Resources</h2>
        <p className="text-gray-600 mt-1">
          This form is used to formally document a staff member&#39;s new duty,
          task, or the allocation of a school asset.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <ResourceTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
