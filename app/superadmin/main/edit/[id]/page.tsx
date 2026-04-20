"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AddSchoolStepNavigation } from "@/components/dashboard-pages/superadmin/schools/components/add-school-step-navigation";
import { IdentityForm } from "@/components/dashboard-pages/superadmin/schools/forms/identity-form";
import { BrandingForm } from "@/components/dashboard-pages/superadmin/schools/forms/branding-form";
import { SubscriptionForm } from "@/components/dashboard-pages/superadmin/schools/forms/subscription-form";
import {
  getInitialAddSchoolFormState,
  schoolToFormState,
  buildUpdateSchoolPayload,
} from "@/components/dashboard-pages/superadmin/schools/forms/add-school-form-state";
import {
  useGetSchoolByIdQuery,
  useUpdateSchoolMutation,
} from "@/services/schools/schools";
import { toast } from "sonner";
import type { AddSchoolStepId } from "@/components/dashboard-pages/superadmin/schools/components/add-school-step-navigation";

export default function EditSchoolPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [currentStep, setCurrentStep] = useState<AddSchoolStepId>("identity");
  const [formState, setFormState] = useState(getInitialAddSchoolFormState());

  const {
    data: school,
    isLoading,
    isError,
  } = useGetSchoolByIdQuery(id, {
    skip: !id,
  });
  const [updateSchool, { isLoading: isUpdating }] = useUpdateSchoolMutation();

  useEffect(() => {
    if (school) {
      setFormState(schoolToFormState(school?.data));
    }
  }, [school]);

  const update = <K extends keyof typeof formState>(
    key: K,
    value: (typeof formState)[K],
  ) => setFormState((s) => ({ ...s, [key]: value }));

  const handleSubmit = async () => {
    if (!school) return;
    if (!formState.identity.schoolName?.trim()) {
      toast.error("School name is required");
      return;
    }
    if (!formState.subscription.subscription_id?.trim()) {
      toast.error("Please select a subscription plan");
      return;
    }
    try {
      const payload = buildUpdateSchoolPayload(
        formState,
        school?.data,
        null,
        null,
      );
      await updateSchool({ id: school?.data?.id, data: payload }).unwrap();
      toast.success("School updated successfully");
      router.push("/superadmin/main");
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "error" in err.data
          ? (err.data as { error?: string }).error
          : null;
      toast.error(message || "Failed to update school");
    }
  };

  if (!id) {
    return (
      <div className="space-y-4">
        <div className="bg-background rounded-md p-6">
          <p className="text-muted-foreground">Invalid school.</p>
          <button
            type="button"
            onClick={() => router.push("/superadmin/main")}
            className="text-main-blue hover:underline mt-2"
          >
            Back to schools
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !school) {
    return (
      <div className="space-y-4">
        <div className="bg-background rounded-md p-6">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="bg-background rounded-md p-6">
          <p className="text-muted-foreground">School not found.</p>
          <button
            type="button"
            onClick={() => router.push("/superadmin/main")}
            className="text-main-blue hover:underline mt-2"
          >
            Back to schools
          </button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "identity":
        return (
          <IdentityForm
            value={formState.identity}
            onChange={(v) => update("identity", v)}
            onNext={() => setCurrentStep("branding")}
            onCancel={() => router.push("/superadmin/main")}
          />
        );
      case "branding":
        return (
          <BrandingForm
            value={formState.branding}
            onChange={(v) => update("branding", v)}
            onNext={() => setCurrentStep("subscription")}
            onBack={() => setCurrentStep("identity")}
            onCancel={() => router.push("/superadmin/main")}
          />
        );
      case "subscription":
        return (
          <SubscriptionForm
            value={formState.subscription}
            onChange={(v) => update("subscription", v)}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep("branding")}
            onCancel={() => router.push("/superadmin/main")}
            isSubmitting={isUpdating}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit School</h2>
        <p className="text-muted-foreground mt-1">
          Update the details for {school?.data.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <AddSchoolStepNavigation
                activeStep={currentStep}
                onStepChange={setCurrentStep}
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
