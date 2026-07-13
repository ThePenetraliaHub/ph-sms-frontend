"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinancialMetricCard } from "@/components/dashboard-pages/admin/finance/finance-metrics";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import {
  PencilEdit02Icon,
  Calendar03Icon,
  Link01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useGetSubjectsQuery } from "@/services/subjects/subjects";
import type { Subject } from "@/services/subjects/subject-types";

interface CoverageStatus {
  id: string;
  section: string;
  plannedCoverage: number;
  actualCoverage: number;
  color: string;
}

const quickActions = [
  {
    icon: PencilEdit02Icon,
    title: "Add/Edit Subject Outline",
    description: "Leads to the Subject Setup form",
  },
  {
    icon: Calendar03Icon,
    title: "Review Lesson Plans",
    description: "Links to the submission approval workflow",
  },
  {
    icon: Link01Icon,
    title: "Map Standard to Subject",
    description:
      "Linking subjects to national/international educational standards",
  },
];

const SECTION_KEYS = ["ss", "jss"] as const;
const SECTION_LABELS: Record<string, string> = {
  ss: "Senior School (SS)",
  jss: "Junior School (JSS)",
};
const SECTION_COLORS: Record<string, string> = {
  ss: "bg-orange-500",
  jss: "bg-green-500",
};

// function classifySection(grade: string): (typeof SECTION_KEYS)[number] | null {
//   const g = grade.toLowerCase();
//   if (g.startsWith("ss") || g.includes("ss-")) return "ss";
//   if (g.startsWith("js") || g.includes("jss") || g.includes("js-"))
//     return "jss";
//   return null;
// }

function deriveCoverage(subjects: Subject[]): CoverageStatus[] {
  const bySection: Record<string, { total: number; withOutline: number }> = {
    ss: { total: 0, withOutline: 0 },
    jss: { total: 0, withOutline: 0 },
  };
  for (const s of subjects) {
    const section = s.applicable_grade;
    if (!section) continue;
    const outline = s.content_outline_table ?? [];
    const hasOutline =
      outline.length > 0 &&
      outline.some((o) => o.unit_definition || o.topic_definition);
    bySection[section[0]].total++;
    if (hasOutline) bySection[section[0]].withOutline++;
  }
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
  return SECTION_KEYS.filter((key) => bySection[key].total > 0).map((key) => ({
    id: key,
    section: SECTION_LABELS[key] ?? key,
    plannedCoverage: 100,
    actualCoverage: pct(bySection[key].withOutline, bySection[key].total),
    color: SECTION_COLORS[key] ?? "bg-gray-500",
  }));
}

export default function CurriculumManagementPage() {
  const router = useRouter();
  const { data: subjectsResponse } = useGetSubjectsQuery({ _all: true });
  const subjectsList: Subject[] = useMemo(() => {
    const d = (subjectsResponse as { data?: Subject[] })?.data;
    return Array.isArray(d) ? d : [];
  }, [subjectsResponse]);

  const coverageData = useMemo(
    () => deriveCoverage(subjectsList),
    [subjectsList],
  );
  const totalWithOutline = subjectsList.filter(
    (s) => (s.content_outline_table ?? []).length > 0,
  ).length;
  const coveragePct =
    subjectsList.length > 0
      ? Math.round((totalWithOutline / subjectsList.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Curriculum Management
        </h2>
        <p className="text-gray-600 mt-1">
          Defines and manages all subjects, learning objectives, and content
          pacing.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FinancialMetricCard
          title="Curriculum Coverage"
          value={`${coveragePct}% Complete`}
          subtitle="Subjects with content outlines"
          trend="up"
        />
        <FinancialMetricCard
          title="Learning Objectives Mapped"
          value={`${subjectsList.length} Subjects`}
          subtitle="Total subject outlines"
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coverage Status by Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Coverage Status by Section
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              A concise chart showing the progress of lesson plan completion
            </p>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-main-blue/5">
                    <TableHead className="px-4 py-3">Section</TableHead>
                    <TableHead className="px-4 py-3">
                      Planned Coverage
                    </TableHead>
                    <TableHead className="px-4 py-3 min-w-[300px]">
                      Actual Coverage
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coverageData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-700">
                        {item.section}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-800">
                        {item.plannedCoverage}%
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 relative h-8 bg-gray-100 overflow-hidden rounded">
                            <div
                              className={`h-full flex items-center transition-all duration-300 ${item.color}`}
                              style={{ width: `${item.actualCoverage}%` }}
                            >
                              {item.actualCoverage > 10 && (
                                <span className="text-white text-xs font-medium pl-3">
                                  {item.actualCoverage}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                icon={action.icon}
                description={action.description}
                onClick={() => {
                  if (action.title === "Add/Edit Subject Outline") {
                    router.push(
                      "curriculum-management/add-edit-subject-outline",
                    );
                  }

                  if (action.title === "Map Standard to Subject") {
                    router.push("curriculum-management/map-standard-subject");
                  }

                  if (action.title === "Review Lesson Plans") {
                    router.push("curriculum-management/lesson-plan-review");
                  }
                }}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
