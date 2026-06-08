"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { JobDetailsForm } from "@/components/dashboard-pages/admin/staff/forms/job-details-form";
import { DescriptionRequirementsForm } from "@/components/dashboard-pages/admin/staff/forms/description-requirements-form";
import { CompensationForm } from "@/components/dashboard-pages/admin/staff/forms/compensation-form";
import {
  DocumentValidationIcon,
  Grid02Icon,
  Money03Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { CreateJobPayload, type JobType } from "@/services/jobs/jobs-type";
import { useCreateJobMutation } from "@/services/jobs/jobs";

type StepId = "details" | "description" | "compensation";

const steps: Step[] = [
  {
    id: "details",
    label: "Job Details & Identification",
    icon: DocumentValidationIcon,
  },
  {
    id: "description",
    label: "Description & Requirements",
    icon: Grid02Icon,
  },
  {
    id: "compensation",
    label: "Compensation",
    icon: Money03Icon,
  },
];

export default function PostNewVacancyPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<StepId>("details");
  const [formData, setFormData] = useState({
    vacancyTitle: "",
    department: "",
    employmentType: "",
    applicationDeadline: undefined as Date | undefined,
    publicSummary: "",
    fullJobDescription: "",
    mandatoryRequirements: "",
    preferredQualifications: "",
    salaryRange: "",
    allowances: "",
    recruitmentBudget: "",
  });

  const [createJob, { isLoading: isCreatingJob }] = useCreateJobMutation();

  const user = useAppSelector(selectUser);

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId as StepId);
  };

  const handleNext = () => {
    if (activeStep === "details") {
      setActiveStep("description");
    } else if (activeStep === "description") {
      setActiveStep("compensation");
    }
  };

  const handleBack = () => {
    if (activeStep === "compensation") {
      setActiveStep("description");
    } else if (activeStep === "description") {
      setActiveStep("details");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const postNewJob = async (newJob: CreateJobPayload) => {
    try {
      const res = await createJob({
        ...newJob,
      }).unwrap();
      //notify
      if (res.status)
        toast.success(res.message ? res.message : "Job posted successfully");
      //resetForm
      setFormData({
        vacancyTitle: "",
        department: "",
        employmentType: "",
        applicationDeadline: undefined as Date | undefined,
        publicSummary: "",
        fullJobDescription: "",
        mandatoryRequirements: "",
        preferredQualifications: "",
        salaryRange: "",
        allowances: "",
        recruitmentBudget: "",
      });
      //route to all jobs
      setActiveStep("details");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create job");
    }
  };

  const handleSubmit = () => {
    const expiryDate = formData.applicationDeadline
      ?.toISOString()
      .split("T")[0];

    //vacancy title, grade, type, salary, budget, public summary, description, requirements
    if (
      !formData.vacancyTitle.trim() ||
      !formData.department.trim() ||
      !formData.employmentType.trim() ||
      !formData.publicSummary.trim() ||
      !formData.fullJobDescription.trim() ||
      !formData.mandatoryRequirements.trim() ||
      !formData.salaryRange.trim() ||
      !formData.recruitmentBudget.trim()
    ) {
      toast.error("Mandatory fields are required");
      return;
    }

    if (isNaN(Number(formData.recruitmentBudget)))
      return toast.error("⚠️ Budget can only be numbers!");

    if (!expiryDate) return toast.error("⚠️ Please set job expiry date!");

    if (!user?.school_id || !user.school_id.trim())
      return toast.error("⚠️ School not found!");

    const newJobPosting: CreateJobPayload = {
      school_id: user.school_id,
      title: formData.vacancyTitle,
      category: formData.department,
      employment_type: formData.employmentType as JobType,
      expiry_date: expiryDate,
      summary: formData.publicSummary,
      description: formData.fullJobDescription,
      requirements: formData.mandatoryRequirements,
      qualifications: formData.preferredQualifications,
      salary_range: formData.salaryRange,
      allowances: formData.allowances,
      status: "active",
      budget: Number(formData.recruitmentBudget),
    };

    postNewJob(newJobPosting);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "details":
        return (
          <JobDetailsForm
            formData={{
              vacancyTitle: formData.vacancyTitle,
              department: formData.department,
              employmentType: formData.employmentType,
              applicationDeadline: formData.applicationDeadline,
            }}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onNext={handleNext}
            onCancel={handleCancel}
          />
        );
      case "description":
        return (
          <DescriptionRequirementsForm
            formData={{
              publicSummary: formData.publicSummary,
              fullJobDescription: formData.fullJobDescription,
              mandatoryRequirements: formData.mandatoryRequirements,
              preferredQualifications: formData.preferredQualifications,
            }}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={handleCancel}
          />
        );
      case "compensation":
        return (
          <CompensationForm
            formData={{
              salaryRange: formData.salaryRange,
              allowances: formData.allowances,
              recruitmentBudget: formData.recruitmentBudget,
            }}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onSubmit={handleSubmit}
            onBack={handleBack}
            onCancel={handleCancel}
            isCreatingJob={isCreatingJob}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">Post New Vacancy</h2>
        <p className="text-gray-600 mt-1">
          Create a clear, detailed job posting to attract qualified candidates.
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
