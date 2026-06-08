"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import { StaffActivityItem } from "@/components/dashboard-pages/admin/staff/components/staff-activity-item/staff-activity-item";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  DocumentValidationIcon,
  UserCheck01Icon,
  FileUploadIcon,
  Alert01Icon,
  UserAdd01Icon,
  UserMinus01Icon,
  TeamviewerIcon,
} from "@hugeicons/core-free-icons";

import { useGetAllStaffQuery } from "@/services/stakeholders/stakeholders";
import { useGetUserRequestsQuery } from "@/services/user-requests/user-requests";
import { useGetNotificationsQuery } from "@/services/shared";
import { useGetJobsQuery } from "@/services/jobs/jobs";

export default function StaffDashboardPage() {
  const router = useRouter();

  const { data: staffData, isLoading } = useGetAllStaffQuery();
  const { data: jobs, isLoading: isFetchingJobs } = useGetJobsQuery();
  const { data: userRequestData, isLoading: isUserRequestLoading } =
    useGetUserRequestsQuery();

  // console.log(staffData);

  interface QuickAction {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
  }

  const quickActions: QuickAction[] = [
    {
      title: "Manage All Staff Directory",
      description: "Complete database table of all staffs",
      icon: DocumentValidationIcon,
      onClick: () => router.push("/admin/staff-management/all"),
    },
    {
      title: "Applicant Tracking",
      description:
        "Tracks candidates currently in the interviewing process for open vacancies.",
      icon: UserCheck01Icon,
      onClick: () => router.push("/admin/staff-management/applicant-tracking"),
    },
    {
      title: "Schedule & Assignments",
      description:
        "Formally document a staff member's new duty, task, or the allocation of a school asset.",
      icon: FileUploadIcon,
      onClick: () => router.push("/admin/staff-management/log-new-resources"),
    },
    {
      title: "Staff Leave Requests Management",
      description:
        "For reviewing, prioritizing, and acting on pending staff leave requests.",
      icon: Alert01Icon,
      onClick: () => router.push("/admin/staff-management/leave"),
    },
  ];

  interface StaffActivity {
    type: "hired" | "absent" | "resignation" | "leave" | "appraisal";
    title: string;
    description: string;
    timestamp: string;
    icon: any;
  }

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Staff Overview Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          Manage staff accounts, assign roles/permissions, staff contact
          directory.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-card py-6 px-3 rounded-md">
          <div className="border-l-3 border-amber-500 pl-3">
            <h3 className="text-lg font-semibold">Workforce Status</h3>
            <p className="text-sm text-gray-600">
              A snapshot of the entire staff body.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Active Staffs"
            value={`${staffData?.data?.length ?? 0} Employees`}
            subtitle=""
            trend="up"
            trendColor="text-main-blue"
          />
          <MetricCard
            title="Staff On Leave"
            value={`${0} Employees`}
            subtitle=""
            trend="up"
            trendColor="text-main-blue"
          />
          <MetricCard
            title="Staff-to-Student Ratio"
            value={`${0}:${1}`}
            subtitle=""
            trend="up"
            trendColor="text-main-blue"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-card py-6 px-3 rounded-md">
          <div className="border-l-3 border-green-500 pl-3">
            <h3 className="text-lg font-semibold">HR & Risk Metrics</h3>
            <p className="text-sm text-gray-600">
              Personnel issues that require immediate administrative or HR
              action.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Leave Requests Pending"
            value={`${0} Requests`}
            trend="up"
            trendColor="text-main-blue"
          />
          <MetricCard
            title="Contract Expiring (Next 90 Days)"
            value={`${0} Employees`}
            subtitle=""
            trend="up"
            trendColor="text-main-blue"
          />
          <MetricCard
            title="Current Vacancies"
            value={`${isFetchingJobs ? "-" : `${jobs?.data.length} Posted Jobs`}`}
            subtitle=""
            trend="up"
            trendColor="text-main-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* {staffData?.data[0]?.notifications.map((activity, index) => (
                <StaffActivityItem
                  key={index}
                  type={activity.type}
                  title={activity?.content}
                  description={activity?.specifics ?? "N/A"}
                  timestamp={activity?.created_at ?? "unknown"}
                />
              ))} */}
              <div className="flex justify-center pt-4">
                <Button variant="outline" size="sm">
                  Load more
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-background py-4">
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
    </div>
  );
}
