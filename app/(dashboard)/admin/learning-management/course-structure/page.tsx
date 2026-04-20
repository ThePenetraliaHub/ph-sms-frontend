"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AssignmentsIcon,
  ResourcesAddIcon,
  Csv02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/general/huge-icon";
import { useGetSchoolsQuery } from "@/services/schools/schools";
import { useGetSubjectsQuery } from "@/services/subjects/subjects";
import { useGetAllStaffQuery } from "@/services/stakeholders/stakeholders";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { getApiErrorMessage } from "@/lib/format-api-error";

type StepId = "core-identity" | "digital-structure";

const steps: Step[] = [
  { id: "core-identity", label: "Core Course Identity", icon: AssignmentsIcon },
  {
    id: "digital-structure",
    label: "Digital Structure Definition",
    icon: ResourcesAddIcon,
  },
];

const gradeOptions = [
  { value: "jss-1", label: "JSS 1" },
  { value: "jss-2", label: "JSS 2" },
  { value: "jss-3", label: "JSS 3" },
  { value: "ss-1", label: "SS 1" },
  { value: "ss-2", label: "SS 2" },
  { value: "ss-3", label: "SS 3" },
];

const approvalOptions = [
  { value: "hod_approval", label: "HOD Approval Required" },
  { value: "auto_publish", label: "Auto-Publish" },
];

const initialData = {
  schoolId: "",
  courseTitle: "",
  applicableSubject: "",
  applicableGrade: "",
  leadInstructor: "",
  units: [""] as string[],
  topics: [""] as string[],
  contentApproval: "",
};

interface CourseStructureFormData {
  schoolId: string;
  courseTitle: string;
  applicableSubject: string;
  applicableGrade: string;
  leadInstructor: string;
  units: string[];
  topics: string[];
  contentApproval: string;
}

export default function CourseStructurePage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [currentStep, setCurrentStep] = useState<StepId>("core-identity");
  const [formData, setFormData] =
    useState<CourseStructureFormData>(initialData);

  const { data: subjectsResponse } = useGetSubjectsQuery({ _all: true });
  const { data: schoolsResponse, isLoading: isLoadingSchools } =
    useGetSchoolsQuery({ _all: true });
  const { data: staffResponse } = useGetAllStaffQuery();

  const subjectOptions = useMemo(() => {
    const d = (subjectsResponse as { data?: { id: string; name: string }[] })
      ?.data;
    const arr = Array.isArray(d) ? d : [];
    return arr.map((s) => ({ value: s.id, label: s.name || s.id }));
  }, [subjectsResponse]);

  const schoolOptions = useMemo(() => {
    const d = (schoolsResponse as { data?: { id: string; name: string }[] })
      ?.data;
    const arr = Array.isArray(d) ? d : [];
    return arr.map((s) => ({ value: s.id, label: s.name || s.id }));
  }, [schoolsResponse]);

  const instructorOptions = useMemo(() => {
    const staff =
      (
        staffResponse as {
          data?: {
            id: string;
            type?: string;
            user?: { first_name?: string; last_name?: string };
          }[];
        }
      )?.data ?? [];
    const teachers = staff.filter((s) => s.type === "teacher");
    return teachers.map((s) => {
      const u = s.user;
      const label =
        u && typeof u === "object"
          ? [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || s.id
          : s.id;
      return { value: s.id, label };
    });
  }, [staffResponse]);

  useEffect(() => {
    if (
      user?.school_id &&
      !formData.schoolId &&
      schoolOptions.some((o) => o.value === user.school_id)
    ) {
      setFormData((prev) => ({ ...prev, schoolId: user.school_id ?? "" }));
    }
  }, [user?.school_id, formData.schoolId, schoolOptions]);

  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId as StepId);
  };

  const handleNext = () => {
    if (currentStep === "core-identity") {
      setCurrentStep("digital-structure");
    }
  };

  const handleBack = () => {
    if (currentStep === "digital-structure") {
      setCurrentStep("core-identity");
    }
  };

  const handleCancel = () => {
    router.push("/admin/learning-management");
  };

  const handleCreateCourseShell = async () => {
    const schoolId =
      (formData.schoolId && formData.schoolId.trim()) ||
      user?.school_id ||
      null;
    if (!schoolId) {
      toast.error("Please select a school.");
      return;
    }
    if (!formData.courseTitle?.trim()) {
      toast.error("Course title is required.");
      return;
    }
    const units = formData.units.filter((u) => u.trim());
    const topics = formData.topics.filter((t) => t.trim());
    try {
      // await createCourse({
      //   school_id: schoolId,
      //   title: formData.courseTitle.trim(),
      //   subject_id: formData.applicableSubject?.trim() || null,
      //   applicable_grade: formData.applicableGrade?.trim() || null,
      //   lead_instructor_id: formData.leadInstructor?.trim() || null,
      //   units: units.length ? units : [],
      //   topics: topics.length ? topics : [],
      //   content_approval: formData.contentApproval?.trim() || null,
      // }).unwrap();
      toast.success("Course created successfully.");
      router.push("/admin/learning-management");
    } catch (err) {
      const data =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: unknown }).data
          : undefined;
      toast.error(getApiErrorMessage(data, "Failed to create course."));
    }
  };

  const handleAddUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [...prev.units, ""],
    }));
  };

  const handleAddTopic = () => {
    setFormData((prev) => ({
      ...prev,
      topics: [...prev.topics, ""],
    }));
  };

  const handleUnitChange = (index: number, value: string) => {
    const newUnits = [...formData.units];
    newUnits[index] = value;
    setFormData((prev) => ({
      ...prev,
      units: newUnits,
    }));
  };

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData((prev) => ({
      ...prev,
      topics: newTopics,
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "core-identity":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Core Course Identity
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  This section defines the course's link to the academic system.
                </p>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Icon icon={Csv02Icon} size={16} />
                Import From Curriculum
              </Button>
            </div>

            <div className="space-y-4">
              <SelectField
                label="School"
                value={formData.schoolId}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, schoolId: v }))
                }
                placeholder={
                  isLoadingSchools ? "Loading schools…" : "Select school"
                }
                disabled={isLoadingSchools}
              >
                {schoolOptions.length > 0 ? (
                  schoolOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none__" disabled>
                    {isLoadingSchools ? "Loading…" : "No schools found"}
                  </SelectItem>
                )}
              </SelectField>

              <InputField
                label="Course Title"
                placeholder="e.g., JSS3 Integrated Science"
                value={formData.courseTitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    courseTitle: e.target.value,
                  }))
                }
              />

              <SelectField
                label="Applicable Subject"
                value={formData.applicableSubject}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, applicableSubject: value }))
                }
                placeholder={
                  subjectOptions.length ? "Select subject" : "No subjects found"
                }
              >
                {subjectOptions.length > 0 ? (
                  subjectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none__" disabled>
                    No subjects found
                  </SelectItem>
                )}
              </SelectField>

              <SelectField
                label="Applicable Grade"
                value={formData.applicableGrade}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, applicableGrade: value }))
                }
                placeholder="Dropdown Select: (e.g., SS2)"
              >
                {gradeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectField>

              <SelectField
                label="Lead Instructor"
                value={formData.leadInstructor}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, leadInstructor: value }))
                }
                placeholder={
                  instructorOptions.length
                    ? "Select teacher"
                    : "No teachers found"
                }
              >
                {instructorOptions.length > 0 ? (
                  instructorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none__" disabled>
                    No teachers found
                  </SelectItem>
                )}
              </SelectField>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                className="bg-main-blue text-white hover:bg-main-blue/90"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case "digital-structure":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Digital Structure Definition
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                This section allows the Admin to build the course hierarchy that
                teachers will use to organize their content (documents, videos,
                quizzes).
              </p>
            </div>

            <div className="space-y-6">
              {/* Content Outline */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">
                  Content Outline
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Unit Definition Column */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-800">
                      Unit Definition
                    </label>
                    <div className="space-y-2">
                      {formData.units.map((unit, index) => (
                        <Input
                          key={index}
                          placeholder="E.g., Ecology Basics"
                          value={unit}
                          onChange={(e) =>
                            handleUnitChange(index, e.target.value)
                          }
                          className="h-9"
                        />
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddUnit}
                      >
                        Add Unit
                      </Button>
                    </div>
                  </div>

                  {/* Topic Definition Column */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-800">
                      Topic Definition
                    </label>
                    <div className="space-y-2">
                      {formData.topics.map((topic, index) => (
                        <Input
                          key={index}
                          placeholder="E.g., Food Chains"
                          value={topic}
                          onChange={(e) =>
                            handleTopicChange(index, e.target.value)
                          }
                          className="h-9"
                        />
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddTopic}
                      >
                        Add Topic
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <SelectField
                label="Content Approval"
                value={formData.contentApproval}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, contentApproval: value }))
                }
                placeholder="Dropdown: HOD Approval Required / Auto-Publish"
              >
                {approvalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectField>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                className="bg-main-blue text-white hover:bg-main-blue/90"
                onClick={handleCreateCourseShell}
                disabled={false}
              >
                {"Create Course Shell & Save"}
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
      {/* Header */}
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Course Structure Builder: Create New Shell
        </h2>
        <p className="text-gray-600 mt-1">
          This screen allows to define a new digital course by setting its core
          identity and hierarchical structure (Units, Topics) based on the
          official curriculum.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Step Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="px-2">
              <StepNavigation
                steps={steps}
                activeStep={currentStep}
                onStepChange={handleStepChange}
                orientation="vertical"
              />
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="px-6">{renderStepContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
