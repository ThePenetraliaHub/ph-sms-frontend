"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import {
  AssignmentsIcon,
  ResourcesAddIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { SubjectIdentityScopeForm } from "../../../../../../components/dashboard-pages/admin/academic/curriculum-management/components/subject-identity-scope-form";
import { GradingWeightingForm } from "../../../../../../components/dashboard-pages/admin/academic/curriculum-management/components/grading-weighting-form";
import { CurriculumStructurePacingForm } from "../../../../../../components/dashboard-pages/admin/academic/curriculum-management/components/curriculum-structure-pacing-form";
import { FinalizationApprovalForm } from "../../../../../../components/dashboard-pages/admin/academic/curriculum-management/components/finalization-approval-form";
import { useGetSchoolsQuery } from "@/services/schools/schools";
import {
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from "@/services/subjects/subjects";
import { useGetAllStaffQuery } from "@/services/stakeholders/stakeholders";
import type {
  Subject,
  ContentOutlineItem,
} from "@/services/subjects/subject-types";
import type { School } from "@/services/schools/schools-type";
import { selectUser } from "@/store/slices/authSlice";

type StepId = "identity" | "grading" | "curriculum" | "finalization";

const steps: Step[] = [
  {
    id: "identity",
    label: "Subject Identity & Scope",
    icon: AssignmentsIcon,
  },
  {
    id: "grading",
    label: "Grading & Weighting",
    icon: ResourcesAddIcon,
  },
  {
    id: "curriculum",
    label: "Curriculum Structure, Pacing",
    icon: ResourcesAddIcon,
  },
  {
    id: "finalization",
    label: "Finalization and Approval",
    icon: Settings01Icon,
  },
];

const initialData = {
  subjectId: "",
  mode: "create" as "create" | "edit",
  selectedSubject: "",
  subjectName: "",
  subjectCode: "",
  applicableGrade: "",
  headOfDepartment: "",
  creditUnits: "",
  continuousAssessment: "",
  finalExam: "",
  curriculumStandard: "",
  contentOutline: [{ unit: "", topic: "", plannedPeriods: "" }] as Array<{
    unit: string;
    topic: string;
    plannedPeriods: string;
  }>,
  plannedPacing: "",
  modifier: "Admin",
  dateOfModification: new Date() as Date | undefined,
  requiresHODApproval: false,
};

interface SubjectOutlineForm {
  subjectId: string;
  mode: "create" | "edit";
  selectedSubject: string;
  subjectName: string;
  subjectCode: string;
  applicableGrade: string;
  headOfDepartment: string;
  creditUnits: string;
  continuousAssessment: string;
  finalExam: string;
  curriculumStandard: string;
  contentOutline: Array<{
    unit: string;
    topic: string;
    plannedPeriods: string;
  }>;
  plannedPacing: string;
  modifier: string;
  dateOfModification: Date | undefined;
  requiresHODApproval: boolean;
}

function subjectToForm(subject: Subject): Partial<SubjectOutlineForm> {
  const outline = subject.content_outline_table ?? [];
  return {
    subjectId: subject.id,
    selectedSubject: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code ?? "",
    applicableGrade: subject.applicable_grade ?? "",
    headOfDepartment: subject.head_of_department_id ?? "",
    creditUnits:
      subject.credit_units != null ? String(subject.credit_units) : "",
    continuousAssessment:
      subject.continuous_assessment != null
        ? String(subject.continuous_assessment)
        : "",
    finalExam: subject.final_exam != null ? String(subject.final_exam) : "",
    curriculumStandard: subject.curriculum_standard ?? "",
    contentOutline:
      outline.length > 0
        ? outline.map((o) => ({
            unit: o.unit_definition ?? "",
            topic: o.topic_definition ?? "",
            plannedPeriods: o.planned_pacing ?? "",
          }))
        : [{ unit: "", topic: "", plannedPeriods: "" }],
    plannedPacing: outline[0]?.planned_pacing ?? "",
  };
}

function formToContentOutline(
  outline: SubjectOutlineForm["contentOutline"],
  plannedPacing: string,
): ContentOutlineItem[] {
  return outline
    .filter((o) => o.unit || o.topic)
    .map((o) => ({
      unit_definition: o.unit,
      topic_definition: o.topic,
      planned_pacing: o.plannedPeriods || plannedPacing || "1-week",
    }));
}

const gradeOptions = [
  { value: "jss-1", label: "JSS 1" },
  { value: "jss-2", label: "JSS 2" },
  { value: "jss-3", label: "JSS 3" },
  { value: "ss-1", label: "SS 1" },
  { value: "ss-2", label: "SS 2" },
  { value: "ss-3", label: "SS 3" },
];

const curriculumStandardOptions = [
  { value: "nerdc", label: "National (NERDC)" },
  { value: "igcse", label: "International (IGCSE)" },
  { value: "custom", label: "School Custom" },
];

const pacingOptions = [
  { value: "1-week", label: "1 Week" },
  { value: "2-weeks", label: "2 Weeks" },
  { value: "3-weeks", label: "3 Weeks" },
  { value: "4-weeks", label: "4 Weeks" },
];

function AddEditSubjectOutlineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") ?? "";
  const user = useSelector(selectUser);

  const [activeStep, setActiveStep] = useState<StepId>("identity");
  const [formData, setFormData] = useState<SubjectOutlineForm>(initialData);

  const { data: subjectsResponse } = useGetSubjectsQuery({ _all: true });
  const { data: schoolsResponse } = useGetSchoolsQuery({ _all: true });
  const { data: staffResponse } = useGetAllStaffQuery();

  const { data: subjectResponse } = useGetSubjectByIdQuery(editId, {
    skip: !editId,
  });

  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();

  const subjectsList: Subject[] = useMemo(() => {
    const d = (subjectsResponse as { data?: Subject[] })?.data;
    return Array.isArray(d) ? d : [];
  }, [subjectsResponse]);
  console.log("Subjects", subjectsList)

  const schoolsList: School[] = useMemo(() => {
    const d = (schoolsResponse as { data?: School[] })?.data;
    return Array.isArray(d) ? d : [];
  }, [schoolsResponse]);

  const staffList = staffResponse?.data ?? [];
  const schoolId = user?.school_id ?? schoolsList[0]?.id ?? "";

  const subjectOptions = useMemo(
    () =>
      subjectsList.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [subjectsList],
  );

  console.log("School ID", schoolsList);
  console.log("Subject ID", formData.subjectId);

  const hodOptions = useMemo(
    () =>
      staffList.map((s) => ({
        value: s.id,
        label:
          s.user && typeof s.user === "object" && "first_name" in s.user
            ? `${(s.user as { first_name?: string }).first_name ?? ""} ${(s.user as { last_name?: string }).last_name ?? ""}`.trim() ||
              s.id
            : s.id,
      })),
    [staffList],
  );

  useEffect(() => {
    if (editId && subjectResponse?.data) {
      setFormData((prev) => ({
        ...prev,
        mode: "edit",
        ...subjectToForm(subjectResponse.data as Subject),
      }));
    }
  }, [editId, subjectResponse?.data]);

  useEffect(() => {
    if (editId && !subjectResponse?.data && subjectsList.length > 0) {
      const found = subjectsList.find((s) => s.id === editId);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          mode: "edit",
          ...subjectToForm(found),
        }));
      }
    }
  }, [editId, subjectResponse?.data, subjectsList]);

  useEffect(() => {
    if (
      formData.mode === "edit" &&
      formData.selectedSubject &&
      formData.selectedSubject !== formData.subjectId
    ) {
      const found = subjectsList.find((s) => s.id === formData.selectedSubject);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          ...subjectToForm(found),
        }));
      }
    }
  }, [
    formData.mode,
    formData.selectedSubject,
    formData.subjectId,
    subjectsList,
  ]);

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId as StepId);
  };

  const handleBack = () => {
    if (activeStep === "grading") setActiveStep("identity");
    else if (activeStep === "curriculum") setActiveStep("grading");
    else if (activeStep === "finalization") setActiveStep("curriculum");
  };

  const buildPayload = (status: string) => {
    const creditUnits = parseInt(formData.creditUnits, 10);
    const ca = parseInt(formData.continuousAssessment, 10);
    const fe = parseInt(formData.finalExam, 10);
    const contentOutline = formToContentOutline(
      formData.contentOutline,
      formData.plannedPacing,
    );
    return {
      school_id: formData.subjectId ? undefined : schoolId,
      name: formData.subjectName.trim(),
      code: formData.subjectCode.trim() || undefined,
      applicable_grade: formData.applicableGrade || undefined,
      head_of_department_id: formData.headOfDepartment || null,
      credit_units: isNaN(creditUnits) ? undefined : creditUnits,
      continuous_assessment: isNaN(ca) ? undefined : ca,
      final_exam: isNaN(fe) ? undefined : fe,
      curriculum_standard: formData.curriculumStandard || undefined,
      content_outline_table:
        contentOutline.length > 0 ? contentOutline : undefined,
      status,
    };
  };

  const handleSaveContinue = () => {
    if (activeStep === "identity") setActiveStep("grading");
    else if (activeStep === "grading") setActiveStep("curriculum");
    else if (activeStep === "curriculum") setActiveStep("finalization");
  };

  const handleActivate = async () => {
    if (!formData.subjectName?.trim()) {
      toast.error("Subject name is required.");
      return;
    }
    if (!schoolId && !formData.subjectId) {
      toast.error("School is required.");
      return;
    }
    try {
      if (formData.subjectId) {
        await updateSubject({
          id: formData.subjectId,
          data: { ...buildPayload("approved") },
        }).unwrap();
      } else {
        await createSubject({
          ...buildPayload("approved"),
          school_id: schoolId,
        } as Parameters<typeof createSubject>[0]).unwrap();
      }
      toast.success("Subject outline activated.");
      router.push("/admin/academic/curriculum-management");
    } catch {
      toast.error("Failed to activate.");
    }
  };

  const getSubjectName = () => {
    if (formData.mode === "edit" && formData.selectedSubject) {
      const s = subjectsList.find((x) => x.id === formData.selectedSubject);
      return (s?.name ?? formData.subjectName) || "Subject";
    }
    return formData.subjectName || "Subject";
  };

  const isSaving = isCreating || isUpdating;

  const renderStepContent = () => {
    switch (activeStep) {
      case "identity":
        return (
          <SubjectIdentityScopeForm
            formData={{
              mode: formData.mode,
              selectedSubject: formData.selectedSubject,
              subjectName: formData.subjectName,
              subjectCode: formData.subjectCode,
              applicableGrade: formData.applicableGrade,
              headOfDepartment: formData.headOfDepartment,
            }}
            onFormDataChange={(data) =>
              setFormData((prev) => ({ ...prev, ...data }))
            }
            onSaveContinue={handleSaveContinue}
            gradeOptions={gradeOptions}
            hodOptions={hodOptions}
            subjectOptions={subjectOptions}
          />
        );

      case "grading":
        return (
          <GradingWeightingForm
            formData={{
              creditUnits: formData.creditUnits,
              continuousAssessment: formData.continuousAssessment,
              finalExam: formData.finalExam,
            }}
            onFormDataChange={(data) =>
              setFormData((prev) => ({ ...prev, ...data }))
            }
            onBack={handleBack}
            onSaveContinue={handleSaveContinue}
          />
        );

      case "curriculum":
        return (
          <CurriculumStructurePacingForm
            formData={{
              curriculumStandard: formData.curriculumStandard,
              contentOutline: formData.contentOutline,
              plannedPacing: formData.plannedPacing,
            }}
            onFormDataChange={(data) =>
              setFormData((prev) => ({ ...prev, ...data }))
            }
            onBack={handleBack}
            onSaveContinue={handleSaveContinue}
            curriculumStandardOptions={curriculumStandardOptions}
            pacingOptions={pacingOptions}
            subjectName={getSubjectName()}
          />
        );

      case "finalization":
        return (
          <FinalizationApprovalForm
            formData={{
              modifier: formData.modifier,
              dateOfModification: formData.dateOfModification,
              requiresHODApproval: formData.requiresHODApproval,
            }}
            onFormDataChange={(data) =>
              setFormData((prev) => ({ ...prev, ...data }))
            }
            onBack={handleBack}
            onActivate={handleActivate}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Add/Edit Subject Outline
        </h2>
        <p className="text-gray-600 mt-1">
          This screen allows for set up or modification of the core structure
          and requirements for an individual subject
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
    </div>
  );
}

export default function AddEditSubjectOutlinePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-muted-foreground">Loading…</div>
      }
    >
      <AddEditSubjectOutlineContent />
    </Suspense>
  );
}
