"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import {
  TransactionHistoryIcon,
  PayByCheckIcon,
  FileImportIcon,
  Book02Icon,
  Edit01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";

export function GradeEntryQuickActionsCard() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <QuickActionCard
          title="Grade Student"
          description="Enter CA and Exam scores for a particular student in your class."
          icon={Book02Icon}
          onClick={() => router.push("/teacher/grade-entry-portal/grade-student")}
          className="border-b"
        />
        <QuickActionCard
          title="Record Results for Students"
          description="Record the complete result for each student in a class"
          icon={Edit01Icon}
          onClick={() => router.push("/teacher/grade-entry-portal/record-results")}
          className="border-b"
        />
        <QuickActionCard
          title="Score Assignment"
          description="Opens the score entry grid for a selected assignment."
          icon={PayByCheckIcon}
          onClick={() => router.push("/teacher/grade-entry-portal/entry")}
          className="border-b"
        />
        <QuickActionCard
          title="View Submitted History"
          description="Links to a read-only log of all previously submitted assignments."
          icon={TransactionHistoryIcon}
          onClick={() =>
            router.push("/teacher/grade-entry-portal/submitted-grades")
          }
          className="border-b"
        />
        <QuickActionCard
          title="Bulk Import Scores"
          description="Links to the utility for uploading scores via an Excel template."
          icon={FileImportIcon}
          onClick={() => {
            // Navigate to bulk import page
            console.log("Bulk import scores");
          }}
        />
      </CardContent>
    </Card>
  );
}
