"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { StepNavigation } from "@/components/ui/step-navigation";
import { Calendar03Icon, GraduateMaleIcon } from "@hugeicons/core-free-icons";
import { AcademicCalendarForm } from "@/components/dashboard-pages/admin/settings/application-config/academic-calendar-form";
import { GradingScalesForm } from "@/components/dashboard-pages/admin/settings/application-config/grading-scales-form";
import type { AcademicCalendarConfig } from "@/services/schools/schools-type";
import { useGetSchoolByIdQuery } from "@/services/schools/schools";
import { selectUser } from "@/store/slices/authSlice";
import { useAppSelector } from "@/store/hooks";

type StepId = "academic-calendar" | "grading-scales";

const steps = [
  {
    id: "academic-calendar" as const,
    label: "Academic Calendar Config.",
    icon: Calendar03Icon,
  },
  {
    id: "grading-scales" as const,
    label: "Grading Scales Config.",
    icon: GraduateMaleIcon,
  },
];

// const STATIC_CONFIG: SchoolApplicationConfig = {
//   term: {
//     name: "2024/2025",
//     session: "3",
//     start_date: "2024-09-01",
//     end_date: "2025-07-31",
//   },
//   score: { ca: 40, exam: 60, total: 100 },
//   timetable_name: "Standard",
//   applicable_school_grade: null,
//   academic_term: null,
//   school_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//   no_of_periods_per_day: 8,
//   default_period_duration: 45,
//   break_periods: [],
// };

export default function ApplicationConfigPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<StepId>("academic-calendar");
  const user = useAppSelector(selectUser);
  const { data: schoolData, isLoading: isSchoolDataLoading } =
    useGetSchoolByIdQuery(user?.school_id ?? "", {
      skip: !user?.school_id,
    });
  const handleBack = () => router.push("/admin/settings");

  const SCHOOL_CONFIG: AcademicCalendarConfig = useMemo(() => {
    if (!schoolData?.data) return {} as AcademicCalendarConfig;
    return {
      end_date: schoolData?.data.academic_calendar_config?.end_date ?? "",
      start_date: schoolData?.data.academic_calendar_config?.start_date ?? "",
      holidays_or_breaks:
        schoolData?.data.academic_calendar_config?.holidays_or_breaks ??
        undefined,
      name: schoolData?.data.academic_calendar_config?.name ?? "",
      no_of_terms: schoolData?.data.academic_calendar_config?.no_of_terms ?? 0,
    };
  }, [schoolData?.data]); // only recalculates when data changes

  console.log("Fetched school data:", schoolData?.data);

  const handleAddGradeLevel = () => {};

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Application Configuration (Customization)
        </h2>
        <p className="text-gray-600 mt-1">
          Customize the system to match the school&apos;s specific rules and
          academic calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <StepNavigation
                steps={steps}
                activeStep={activeStep}
                onStepChange={(stepId) => setActiveStep(stepId as StepId)}
                orientation="vertical"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardContent className="px-6">
              {activeStep === "academic-calendar" && (
                <div className="space-y-6">
                  <AcademicCalendarForm
                    academicSession={
                      schoolData?.data?.academic_calendar_config?.name ?? ""
                    }
                    schoolId={user?.school_id ?? ""}
                    initialValues={SCHOOL_CONFIG}
                    handleBack={handleBack}
                  />
                </div>
              )}

              {activeStep === "grading-scales" && (
                <div className="space-y-6">
                  <GradingScalesForm
                    isSchoolDataLoading={isSchoolDataLoading}
                    schoolId={user?.school_id ?? ""}
                    handleBack={handleBack}
                    prevGradingScalesConfig={
                      schoolData?.data?.grading_scales_config
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
