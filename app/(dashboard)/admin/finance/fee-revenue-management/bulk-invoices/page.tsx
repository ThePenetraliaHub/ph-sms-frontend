"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { ScopeSelectionForm } from "@/components/dashboard-pages/admin/finance/forms/scope-selection-form";
import { RecipientPreviewForm } from "@/components/dashboard-pages/admin/finance/forms/recipient-preview-form";
import { FinalizePublishForm } from "@/components/dashboard-pages/admin/finance/forms/finalize-publish-form";
import { AssignmentsIcon, ResourcesAddIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";

type StepId = "scope" | "preview" | "finalize";

const steps: Step[] = [
  {
    id: "scope",
    label: "Scope Selection",
    icon: AssignmentsIcon,
  },
  {
    id: "preview",
    label: "Recipient Preview",
    icon: ResourcesAddIcon,
  },
  {
    id: "finalize",
    label: "Finalize and Publish",
    icon: ResourcesAddIcon,
  },
];

export default function BulkInvoicesPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<StepId>("scope");
  const [formData, setFormData] = useState({
    startInvoiceNumber: "",
    academicTerm: "",
    gradeClass: "",
    paymentDeadline: undefined as Date | undefined,
    note: "",
  });

  const [previewData] = useState({
    totalInvoices: 145,
    totalAmount: 2452000,
  });

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId as StepId);
  };

  const handleNext = () => {
    if (activeStep === "scope") {
      setActiveStep("preview");
    } else if (activeStep === "preview") {
      setActiveStep("finalize");
    }
  };

  const handleBack = () => {
    if (activeStep === "preview") {
      setActiveStep("scope");
    } else if (activeStep === "finalize") {
      setActiveStep("preview");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = () => {
    console.log("Generating invoices:", { formData, previewData });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "scope":
        return (
          <ScopeSelectionForm
            formData={formData}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onNext={handleNext}
            onCancel={handleCancel}
          />
        );
      case "preview":
        return (
          <RecipientPreviewForm
            totalInvoices={previewData.totalInvoices}
            totalAmount={previewData.totalAmount}
            onBack={handleBack}
            onNext={handleNext}
            recipients={[]}
            excludedStudents={[]}
          />
        );
      case "finalize":
        return (
          <FinalizePublishForm
            totalInvoices={previewData.totalInvoices}
            totalAmount={previewData.totalAmount}
            onBack={handleBack}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <h2 className="text-2xl font-bold text-gray-800">
            Generate Bulk Invoices
          </h2>
          <p className="text-gray-600 mt-1">
            Three-step process with clear progression indicators to minimize
            errors.
          </p>
        </CardContent>
      </Card>

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
