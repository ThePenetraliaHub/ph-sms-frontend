"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import { Separator } from "@/components/ui/separator";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { ApplicationTable } from "@/components/dashboard-pages/admin/admissions/components/application-table";
import type { AdmissionApplication } from "@/services/shared-types";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { getStakeholderStageLabel } from "@/services/stakeholders/stakeholders-selector";
import { useGetStakeholderMetricsQuery } from "@/services/stakeholders/stakeholders";

export default function AdmissionsPage() {
  const router = useRouter();

  const { data: stakeholderMetrics, isLoading } =
    useGetStakeholderMetricsQuery();

  // console.log("Stakeholder Metrics:", stakeholderMetrics?.metrics);

  const metrics = useMemo(
    () => ({
      inquiries: stakeholderMetrics?.metrics?.inquiries ?? 0,
      applicationStarted: stakeholderMetrics?.metrics?.applicationStarted ?? 0,
      submittedForms: stakeholderMetrics?.metrics?.submittedForms ?? 0,
      underReview: stakeholderMetrics?.metrics?.underReview ?? 0,
      acceptedOffers: stakeholderMetrics?.metrics?.acceptedOffers ?? 0,
      enrolled: stakeholderMetrics?.metrics?.enrolled ?? 0,
      total: stakeholderMetrics?.metrics?.total ?? 0,
    }),
    [stakeholderMetrics],
  );

  const mapStakeholderToApplication = (
    stakeholder: Stakeholders,
  ): AdmissionApplication => {
    const date = stakeholder.created_at
      ? new Date(stakeholder.created_at)
      : new Date();
    return {
      id: stakeholder.id,
      stakeholder_id: stakeholder.id,
      name: `${stakeholder.user.first_name ?? ""} ${stakeholder.user.last_name ?? ""}`,
      classApplyingFor: stakeholder.class_assigned,
      dateSubmitted: format(date, "MMM. d, yyyy"),
      timeSubmitted: format(date, "h:mm a"),
      stage: stakeholder.stage,
      statusLabel:
        stakeholder.stage_text || getStakeholderStageLabel(stakeholder.stage),
      admission_number: stakeholder.admission_number,
      created_at: stakeholder.created_at,
    };
  };

  const applications = useMemo(() => {
    if (!stakeholderMetrics?.data) return [];
    return stakeholderMetrics.data.map(mapStakeholderToApplication);
  }, [stakeholderMetrics]);

  interface QuickAction {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
  }

  const quickActions: QuickAction[] = [
    {
      title: "Add New Applicant",
      description: "Manually add an applicant.",
      icon: UserAdd01Icon,
      onClick: () => router.push("admissions/add"),
    },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md mb-6 p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Admissions & Enrollments
        </h2>
        <p className="text-gray-600 mt-1">
          Review inquiries/applications, and onboard new students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Inquiries/Interest (Stage 1)"
            value={metrics.inquiries}
            subtitle={`${metrics.total > 0 ? ((metrics.inquiries / metrics.total) * 100).toFixed(1) : 0}% conversion rate`}
            trend="up"
            trendColor="text-green-600"
          />
          <MetricCard
            title="Application Started (Stage 2)"
            value={metrics.applicationStarted}
            subtitle={`${metrics.total > 0 ? ((metrics.applicationStarted / metrics.total) * 100).toFixed(1) : 0}% Conversion rate from stage 1`}
            trend="up"
          />
          <MetricCard
            title="Submitted Forms (Stage 3)"
            value={metrics.submittedForms}
            subtitle="Forms under review"
            trend="up"
            trendColor="text-green-600"
          />
          <MetricCard
            title="Under Review (In-Process - Stage 4)"
            value={metrics.underReview}
            subtitle="Applications under review"
            trend="up"
          />
          <MetricCard
            title="Accepted Offers (Stage 5)"
            value={metrics.acceptedOffers}
            subtitle={`${metrics.submittedForms > 0 ? ((metrics.acceptedOffers / metrics.submittedForms) * 100).toFixed(1) : 0}% Acceptance rate from submitted`}
            trend="up"
            trendColor="text-green-600"
          />
          <MetricCard
            title="Enrolled/Confirmed (Final stage)"
            value={metrics.enrolled}
            subtitle={`${metrics.acceptedOffers > 0 ? ((metrics.enrolled / metrics.acceptedOffers) * 100).toFixed(1) : 0}% Enrollment Rate from acceptance`}
            trend="up"
            trendColor="text-green-600"
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-1">
              <div className="space-y-0">
                {quickActions.map((action, index) => (
                  <div key={index}>
                    <QuickActionCard
                      title={action.title}
                      description={action.description}
                      icon={action.icon}
                      onClick={action.onClick}
                    />
                    {index < quickActions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Application Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No applications found
            </div>
          ) : (
            <ApplicationTable
              applications={applications}
              onApplicationsChange={(updatedApplications) => {}}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
