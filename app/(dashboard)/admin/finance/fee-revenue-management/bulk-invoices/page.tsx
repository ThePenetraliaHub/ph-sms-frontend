"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { ScopeSelectionForm } from "@/components/dashboard-pages/admin/finance/forms/scope-selection-form";
import { RecipientPreviewForm } from "@/components/dashboard-pages/admin/finance/forms/recipient-preview-form";
import { FinalizePublishForm } from "@/components/dashboard-pages/admin/finance/forms/finalize-publish-form";
import { AssignmentsIcon, ResourcesAddIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCreateBulkInvoiceMutation } from "@/services/transactions/transactions";
import type { CreateBulkInvoicePayload } from "@/services/transactions/transaction-types";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { getApiErrorMessage } from "@/lib/format-api-error";
import { useAppSelector } from "@/store/hooks";
import { selectClasses, selectTerm } from "@/store/slices/schoolSlice";

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

type RecipientRow = {
  id: string;
  name: string;
  studentId: string;
  gradeClass: string;
  invoiceValue: number;
  discountApplied: string;
  discountAmount?: number;
  discountPercentage?: number;
};

function buildBulkInvoicePayload(
  formData: {
    startInvoiceNumber: string;
    academicTerm: string;
    gradeClass: string;
    amount: string;
    paymentDeadline: Date | undefined;
    note: string;
  },
  notifyParents: boolean,
): CreateBulkInvoicePayload {
  if (!formData.paymentDeadline) {
    throw new Error("Payment deadline is required.");
  }
  const amount = parseFloat(formData.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Enter a valid invoice amount.");
  }
  return {
    grade_class: formData.gradeClass,
    start_invoice_number: formData.startInvoiceNumber.trim(),
    academic_term: formData.academicTerm,
    amount,
    note: (formData.note || "").trim(),
    payment_deadline: format(formData.paymentDeadline, "yyyy-MM-dd"),
    notify_parents: notifyParents,
  };
}

function mapStakeholderToRecipient(
  s: Stakeholders,
  invoiceAmount: number,
  selectedScopeGradeClass: string,
): RecipientRow {
  const u = s.user;
  const name = u
    ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unknown"
    : "Unknown";
  const fromStakeholder = (s.class_assigned || "").trim();
  return {
    id: s.id,
    name,
    studentId: (s.admission_number || "").trim() || s.id,
    gradeClass: fromStakeholder || selectedScopeGradeClass.trim() || "—",
    invoiceValue: invoiceAmount,
    discountApplied: "—",
  };
}

export default function BulkInvoicesPage() {
  const router = useRouter();
  const term = useAppSelector(selectTerm);
  const schoolClasses = useAppSelector(selectClasses);

  const [activeStep, setActiveStep] = useState<StepId>("scope");
  const [formData, setFormData] = useState({
    startInvoiceNumber: "",
    academicTerm: "",
    gradeClass: "",
    amount: "",
    paymentDeadline: undefined as Date | undefined,
    note: "",
  });

  const [hasPreview, setHasPreview] = useState(false);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);

  const [createBulkInvoice, { isLoading: isBulkInvoiceLoading }] =
    useCreateBulkInvoiceMutation();

  const patchScopeForm = useCallback(
    (
      patch: Partial<{
        startInvoiceNumber: string;
        academicTerm: string;
        gradeClass: string;
        amount: string;
        paymentDeadline: Date | undefined;
        note: string;
      }>,
    ) => {
      setFormData((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  useEffect(() => {
    setFormData((prev) =>
      prev.gradeClass && !schoolClasses.includes(prev.gradeClass)
        ? { ...prev, gradeClass: "" }
        : prev,
    );
  }, [schoolClasses]);

  useEffect(() => {
    const name = term?.name?.trim() ?? "";
    setFormData((prev) =>
      prev.academicTerm === name ? prev : { ...prev, academicTerm: name },
    );
  }, [term]);

  const resetPreview = useCallback(() => {
    setHasPreview(false);
    setTotalInvoices(0);
    setTotalAmount(0);
    setRecipients([]);
  }, []);

  const handleStepChange = (stepId: string) => {
    const next = stepId as StepId;
    if (next === "scope") {
      if (activeStep !== "scope") {
        resetPreview();
      }
      setActiveStep("scope");
      return;
    }
    if ((next === "preview" || next === "finalize") && !hasPreview) {
      return;
    }
    setActiveStep(next);
  };

  const handleScopeNext = async () => {
    try {
      if (!formData.paymentDeadline) {
        toast.error("Please set a payment deadline.");
        return;
      }
      if (schoolClasses.length === 0) {
        toast.error(
          "This school has no classes configured. Update the school profile first.",
        );
        return;
      }
      if (!formData.academicTerm.trim()) {
        toast.error(
          "Academic term is missing from the school record. Load the school or set its current term.",
        );
        return;
      }
      if (!formData.startInvoiceNumber.trim() || !formData.gradeClass) {
        toast.error("Please complete all required scope fields.");
        return;
      }
      if (!schoolClasses.includes(formData.gradeClass)) {
        toast.error("Selected class is not valid for this school.");
        return;
      }
      const payload = buildBulkInvoicePayload(formData, false);
      const res = await createBulkInvoice(payload).unwrap();
      if (res.status === false) {
        toast.error(res.message || "Preview failed.");
        return;
      }
      const data = res.data;
      if (!data) {
        toast.error("No preview data returned from the server.");
        return;
      }
      setTotalInvoices(data.total_invoices);
      setTotalAmount(data.total_amount);
      const list = data.recipients ?? [];
      setRecipients(
        list.map((s) =>
          mapStakeholderToRecipient(s, payload.amount, formData.gradeClass),
        ),
      );
      setHasPreview(true);
      toast.success("Recipient preview loaded.");
      setActiveStep("preview");
    } catch (e) {
      toast.error(
        getApiErrorMessage(e, "Could not load invoice preview. Try again."),
      );
    }
  };

  const handlePreviewNext = () => {
    setActiveStep("finalize");
  };

  const handleBack = () => {
    if (activeStep === "preview") {
      setActiveStep("scope");
      resetPreview();
    } else if (activeStep === "finalize") {
      setActiveStep("preview");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleFinalizeSubmit = async ({
    notifyParents,
  }: {
    notifyParents: boolean;
  }) => {
    try {
      const payload = buildBulkInvoicePayload(formData, notifyParents);
      const res = await createBulkInvoice(payload).unwrap();
      if (res.status === false) {
        toast.error(res.message || "Failed to publish invoices.");
        return;
      }
      toast.success(
        notifyParents
          ? "Invoices published and parents notified."
          : "Invoices generated successfully.",
      );
      resetPreview();
      setFormData({
        startInvoiceNumber: "",
        academicTerm: "",
        gradeClass: "",
        amount: "",
        paymentDeadline: undefined,
        note: "",
      });
      setActiveStep("scope");
      router.push("..");
    } catch (e) {
      toast.error(
        getApiErrorMessage(e, "Could not generate invoices. Try again."),
      );
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "scope":
        return (
          <ScopeSelectionForm
            schoolClasses={schoolClasses}
            formData={formData}
            onFormDataChange={patchScopeForm}
            onNext={handleScopeNext}
            onCancel={handleCancel}
            isPreviewLoading={isBulkInvoiceLoading}
          />
        );
      case "preview":
        return (
          <RecipientPreviewForm
            totalInvoices={totalInvoices}
            totalAmount={totalAmount}
            onBack={handleBack}
            onNext={handlePreviewNext}
            recipients={recipients}
            excludedStudents={[]}
          />
        );
      case "finalize":
        return (
          <FinalizePublishForm
            totalInvoices={totalInvoices}
            totalAmount={totalAmount}
            onBack={handleBack}
            onCancel={handleCancel}
            onSubmit={handleFinalizeSubmit}
            isSubmitting={isBulkInvoiceLoading}
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
