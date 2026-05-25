"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StepNavigation } from "@/components/dashboard-pages/admin/admissions/components/step-navigation";
import { ApplicantDetailsForm } from "@/components/dashboard-pages/admin/admissions/forms/applicant-details-form";
import { AcademicDetailsForm } from "@/components/dashboard-pages/admin/admissions/forms/academic-details-form";
import { DocumentUploadForm } from "@/components/dashboard-pages/admin/admissions/forms/document-upload-form";
import { ApplicationStatusForm } from "@/components/dashboard-pages/admin/admissions/forms/application-status-form";
import {
  getInitialAdmissionFormState,
  buildAdmissionFormData,
} from "@/components/dashboard-pages/admin/admissions/forms/admission-form-state";
import { useAdmissionRegisterMutation } from "@/services/users/users";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { generateSchoolID } from "@/common/helper";

// const STEPS = ["details", "academic", "documents", "status"] as const;
const STEPS = ["details", "academic", "status"] as const;
type StepId = (typeof STEPS)[number];

export default function AddApplicantPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [step, setStep] = useState<StepId>("details");
  const [formState, setFormState] = useState(getInitialAdmissionFormState());
  const [register, { isLoading: isRegistering }] =
    useAdmissionRegisterMutation();

  const go = (dir: 1 | -1) => {
    const i = STEPS.indexOf(step) + dir;
    if (i >= 0 && i < STEPS.length) setStep(STEPS[i]);
  };

  const update = <K extends keyof typeof formState>(
    key: K,
    value: (typeof formState)[K],
  ) => setFormState((s) => ({ ...s, [key]: value }));

  const handleSubmit = async () => {
    const schoolIdFromForm = formState.details.schoolId;
    const fallbackSchoolId = user?.school_id ?? generateSchoolID();
    const schoolId = schoolIdFromForm || fallbackSchoolId;

    if (!schoolId) {
      console.error("School ID is required");
      return;
    }

    try {
      const formData = buildAdmissionFormData(formState, schoolId);
      const res = await register(formData).unwrap();
      console.log(res);
      router.push("/admin/admissions");
    } catch (err) {
      console.error("Admission register failed:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Add Applicant Manually
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <StepNavigation
                activeStep={step}
                onStepChange={(s) => setStep(s)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-0 bg-background">
            <CardContent className="p-6">
              {step === "details" && (
                <ApplicantDetailsForm
                  value={formState.details}
                  onChange={(v) => update("details", v)}
                  onNext={() => go(1)}
                  onCancel={() => router.back()}
                />
              )}
              {step === "academic" && (
                <AcademicDetailsForm
                  value={formState.academic}
                  onChange={(v) => update("academic", v)}
                  onNext={() => go(1)}
                  onCancel={() => router.back()}
                />
              )}
              {/* {step === "documents" && (
                <DocumentUploadForm
                  value={formState.documents}
                  onChange={(v) => update("documents", v)}
                  onNext={() => go(1)}
                  onBack={() => go(-1)}
                  onCancel={() => router.back()}
                />
              )} */}
              {step === "status" && (
                <ApplicationStatusForm
                  value={formState.status}
                  onChange={(v) => update("status", v)}
                  onBack={() => go(-1)}
                  onCancel={() => router.back()}
                  onSubmit={handleSubmit}
                  isSubmitting={isRegistering}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
