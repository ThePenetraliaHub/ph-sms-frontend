"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/general/huge-icon";
import {
  DocumentValidationIcon,
  Settings01Icon,
  AddCircleIcon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { BreaksSpecialPeriodsModal } from "@/components/dashboard-pages/admin/finance/components/breaks-special-periods-modal";

import {
  selectCurrentSchool,
  selectClasses,
  selectSchoolDays,
  selectTerm,
} from "@/store/slices/schoolSlice";
import { useAppSelector } from "@/store/hooks";
import type { Break } from "@/services/schools/schools-type";
import { toast } from "sonner";

type StepId = "scope" | "time-slot";

const steps: Step[] = [
  {
    id: "scope",
    label: "Define Timetable Scope",
    icon: DocumentValidationIcon,
  },
  {
    id: "time-slot",
    label: "Define Time Slot & Structure",
    icon: Settings01Icon,
  },
];

const initialData = {
  schoolId: "",
  timetableName: "",
  applicableSchoolGrade: "",
  academicTerm: "",
  schoolDays: [] as string[],
  numberOfPeriodsPerDay: "",
  defaultPeriodDuration: "",
  applicableSchoolGradeStep2: "",
  breakPeriods: [] as Break[],
};

interface TimetableForm {
  schoolId: string;
  timetableName: string;
  applicableSchoolGrade: string;
  academicTerm: string;
  schoolDays: string[];
  numberOfPeriodsPerDay: string;
  defaultPeriodDuration: string;
  applicableSchoolGradeStep2: string;
  breakPeriods: Break[];
}

function timeRangeTo24h(timeRange: {
  startHour: string;
  startMinute: string;
  startPeriod: "AM" | "PM";
  endHour: string;
  endMinute: string;
  endPeriod: "AM" | "PM";
}) {
  const to24 = (h: string, m: string, period: "AM" | "PM") => {
    let hour = parseInt(h, 10);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${m.padStart(2, "0")}:00`;
  };
  return {
    start_time: to24(
      timeRange.startHour,
      timeRange.startMinute,
      timeRange.startPeriod,
    ),
    end_time: to24(timeRange.endHour, timeRange.endMinute, timeRange.endPeriod),
  };
}

export default function CreateTimetablePage() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState<StepId>("scope");
  const [formData, setFormData] = useState<TimetableForm>(initialData);
  const [breakModalOpen, setBreakModalOpen] = useState(false);

  const currentAcademicTerm = useAppSelector(selectTerm);
  const currentSchool = useAppSelector(selectCurrentSchool);
  const schoolDays = useAppSelector(selectSchoolDays);
  const classes = useAppSelector(selectClasses);
  const isSubmitting = false;
  const updateTimetable = async (_args?: unknown) => ({
    unwrap: async () => {},
  });

  const prefilled = useRef(false);
  useEffect(() => {
    if (!currentSchool || prefilled.current) return;
    prefilled.current = true;
    setFormData((prev) => ({
      ...prev,
      schoolId: currentSchool.id,
      timetableName: currentSchool.timetable_name ?? prev.timetableName,
      applicableSchoolGrade:
        currentSchool.applicable_school_grade ?? prev.applicableSchoolGrade,
      academicTerm: currentSchool.academic_term ?? prev.academicTerm,
      schoolDays: Array.isArray(currentSchool.school_days)
        ? currentSchool.school_days
        : prev.schoolDays,
      numberOfPeriodsPerDay:
        currentSchool.no_of_periods_per_day != null
          ? String(currentSchool.no_of_periods_per_day)
          : prev.numberOfPeriodsPerDay,
      defaultPeriodDuration:
        currentSchool.default_period_duration != null
          ? String(currentSchool.default_period_duration)
          : prev.defaultPeriodDuration,
      breakPeriods: Array.isArray(currentSchool.break_periods)
        ? (currentSchool.break_periods as Break[])
        : prev.breakPeriods,
    }));
  }, [currentSchool]);

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId as StepId);
  };

  const handleNext = () => {
    if (activeStep === "scope") {
      setActiveStep("time-slot");
    }
  };

  const handleBack = () => {
    if (activeStep === "time-slot") {
      setActiveStep("scope");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!formData.schoolId) {
      toast.error("Please select a school.");
      return;
    }
    const noOfPeriods = parseInt(formData.numberOfPeriodsPerDay, 10);
    const defaultDuration = parseInt(formData.defaultPeriodDuration, 10);
    if (isNaN(noOfPeriods) || noOfPeriods <= 0) {
      toast.error("Please enter a valid number of periods per day.");
      return;
    }
    if (isNaN(defaultDuration) || defaultDuration <= 0) {
      toast.error("Please enter a valid default period duration (minutes).");
      return;
    }
    const applicableGrade =
      formData.applicableSchoolGrade || formData.applicableSchoolGradeStep2;
    const academicTerm = formData.academicTerm;
    if (!formData.timetableName?.trim()) {
      toast.error("Please enter a timetable name.");
      return;
    }
    if (formData.schoolDays.length === 0) {
      toast.error("Please select at least one school day.");
      return;
    }

    try {
      await updateTimetable({
        id: formData.schoolId,
        data: {
          timetable_name: formData.timetableName.trim(),
          applicable_school_grade: applicableGrade || undefined,
          academic_term: academicTerm || undefined,
          school_days: formData.schoolDays,
          no_of_periods_per_day: noOfPeriods,
          default_period_duration: defaultDuration,
          break_periods:
            formData.breakPeriods.length > 0
              ? formData.breakPeriods
              : undefined,
        },
      });
      toast.success("Timetable saved successfully.");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to save timetable.";
      toast.error(String(msg));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const updatedDays = prev.schoolDays.includes(day)
        ? prev.schoolDays.filter((d) => d !== day)
        : [...prev.schoolDays, day];
      return { ...prev, schoolDays: updatedDays };
    });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "scope":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Define Timetable Scope
            </h3>

            <InputField
              label="School"
              value={currentSchool?.name ?? ""}
              disabled
            />

            <InputField
              label="Timetable Name"
              placeholder='E.g., "2026/2027 School Schedule"'
              value={formData.timetableName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  timetableName: e.target.value,
                }))
              }
            />

            <SelectField
              label="Applicable School Grade"
              value={formData.applicableSchoolGrade}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  applicableSchoolGrade: value,
                }))
              }
              placeholder="All Classes"
            >
              {classes.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectField>

            <InputField
              label="Academic Term"
              value={currentAcademicTerm?.name ?? ""}
              disabled
              onChange={() => {}}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );

      case "time-slot":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Define Time Slots and Structure
            </h3>

            <div className="space-y-2">
              <Label className="text-sm font-medium">School Days</Label>
              <div className="flex flex-wrap gap-4">
                {schoolDays?.map((day, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      id={day}
                      checked={formData.schoolDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label
                      htmlFor={day}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <InputField
              label="Number of Periods Per Day"
              placeholder="e.g. 8"
              type="number"
              value={formData.numberOfPeriodsPerDay}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  numberOfPeriodsPerDay: e.target.value,
                }))
              }
            />

            <InputField
              label="Default Period Duration (minutes)"
              placeholder="e.g. 45"
              type="number"
              value={formData.defaultPeriodDuration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultPeriodDuration: e.target.value,
                }))
              }
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Applicable School Grade
              </Label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <InputField
                    label=""
                    placeholder="placeholder"
                    value={formData.applicableSchoolGradeStep2}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        applicableSchoolGradeStep2: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 h-9"
                  onClick={() => setBreakModalOpen(true)}
                >
                  <Icon icon={AddCircleIcon} size={16} />
                  Add Break/Period
                </Button>
              </div>
            </div>

            {formData.breakPeriods.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Added Breaks/Periods
                </Label>
                <ul className="space-y-1 text-sm text-gray-600">
                  {formData.breakPeriods.map((bp, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-2"
                    >
                      <span>
                        {bp.title} ({bp.start_time} - {bp.end_time})
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-red-600 hover:text-red-700"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            breakPeriods: prev.breakPeriods.filter(
                              (_, i) => i !== idx,
                            ),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Review & Save Template"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Create New Timetable
        </h2>
        <p className="text-gray-600 mt-1">
          Manage the creation of a schedule template.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <StepNavigation
                steps={steps}
                activeStep={activeStep}
                onStepChange={handleStepChange}
                orientation="vertical"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-0 bg-background">
            <CardContent className="p-6">{renderStepContent()}</CardContent>
          </Card>
        </div>
      </div>

      <BreaksSpecialPeriodsModal
        open={breakModalOpen}
        onOpenChange={setBreakModalOpen}
        onSubmit={(data) => {
          const { start_time, end_time } = timeRangeTo24h(data.timeRange);
          const newBreak: Break = {
            title: data.title,
            type: "break",
            start_time,
            end_time,
          };
          setFormData((prev) => ({
            ...prev,
            breakPeriods: [...prev.breakPeriods, newBreak],
          }));
        }}
      />
    </div>
  );
}
