"use client";

import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { GradeDistributionChart } from "@/components/dashboard-pages/admin/dashboard/grade-distribution-chart";
import { TodaysEventCard } from "@/components/dashboard-pages/admin/dashboard/todays-event-card";
import { NoticeBoardCard } from "@/components/dashboard-pages/admin/dashboard/notice-board-card";
import { RecentActivitiesCard } from "@/components/dashboard-pages/admin/dashboard/recent-activities-card";
import { TransactionsCard } from "@/components/dashboard-pages/admin/dashboard/transactions-card";
import { useGetNotificationsQuery } from "@/services/shared";
import { format, isToday } from "date-fns";
// import { useEffect } from "react";

import {
  useGetAllStudentsQuery,
  useGetAllStaffQuery,
} from "@/services/stakeholders/stakeholders";

export default function AdminDashboard() {
  const user = useAppSelector(selectUser);

  const {
    data: studentsData,
    error: studentsError,
    isLoading: studentsLoading,
  } = useGetAllStudentsQuery();
  const {
    data: staffData,
    error: staffError,
    isLoading: staffLoading,
  } = useGetAllStaffQuery();
  const { data: notificationsData, error: notificationsError } =
    useGetNotificationsQuery({ limit: 5 });

  const totalStudents = studentsData?.data?.length ?? 0;
  const totalStaff = staffData?.data?.length ?? 0;
  const totalFinance = 0;

  interface CalendarEvent {
    startDate?: string;
    endDate?: string;
    title: string;
    description?: string;
    type?: string;
  }

  interface Notification {
    title: string;
    content?: string;
    created_at?: string | null;
  }

  // const todayNotifications =
  //   notificationsData?.data?.filter((notification: Notification) => {
  //     if (!notification.created_at) return;
  //     return isToday(new Date(notification.created_at));
  //   }) || [];

  const today = notificationsData?.data;

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.email ||
      "Admin"
    : "Admin";

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {displayName}. Here is what is happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={totalStudents ?? 0}
          subtitle="Active students"
          trend="up"
          trendColor="text-green-600"
        />
        <MetricCard
          title="Total Staffs"
          value={totalStaff ?? 0}
          subtitle="Total active workforce"
          trend="up"
        />
        <MetricCard
          title="Finance"
          value={`₦${totalFinance.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Total income"
          trend="up"
        />
        <MetricCard
          title="Attendance"
          value={`${0}%`}
          subtitle="Average attendance both staffs & students"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GradeDistributionChart className="lg:col-span-2" />

        <div className="grid grid-rows-2 gap-4">
          <TodaysEventCard
            events={[].map((event: CalendarEvent) => ({
              title: event.title,
              description: event.description || "",
              time:
                event.startDate && event.endDate
                  ? `${format(new Date(event.startDate), "h:mm a")} - ${format(
                      new Date(event.endDate),
                      "h:mm a",
                    )}`
                  : event.startDate
                    ? format(new Date(event.startDate), "h:mm a")
                    : "",
              color: event.type === "event" ? "bg-purple-600" : "bg-blue-600",
            }))}
          />

          <NoticeBoardCard
            notices={today?.map((notification: Notification) => ({
              title: notification.title,
              time: notification.created_at
                ? format(new Date(notification.created_at), "h:mm a")
                : "",
              description: notification.content || "",
            }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivitiesCard />
        <TransactionsCard />
      </div>
    </div>
  );
}
