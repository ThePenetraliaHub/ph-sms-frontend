"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  EditStepNavigation,
  type EditStepId,
} from "@/components/dashboard-pages/admin/students/components/edit-step-navigation";
import { PersonalInfoForm } from "@/components/dashboard-pages/admin/students/forms/personal-info-form";
import { AcademicInfoForm } from "@/components/dashboard-pages/admin/students/forms/academic-info-form";
import { StudentDocumentUploadForm } from "@/components/dashboard-pages/admin/students/forms/document-upload-form";
import { StudentStatusForm } from "@/components/dashboard-pages/admin/students/forms/student-status-form";
import {
  getInitialStudentEditState,
  buildUserUpdatePayload,
  buildStakeholderUpdatePayload,
  getNewDocuments,
} from "@/components/dashboard-pages/admin/students/forms/student-edit-form-state";
import { useGetStudentByIdQuery } from "@/services/stakeholders/stakeholders";
import { useUpdateStakeholderMutation } from "@/services/stakeholders/stakeholders";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/services/users/users";
import { useCreateAttachmentMutation } from "@/services/attachment/attachment";

const STEPS: EditStepId[] = ["details", "academic", "documents", "status"];

export default function EditStudentPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [step, setStep] = useState<EditStepId>("details");
  const [formState, setFormState] = useState<ReturnType<
    typeof getInitialStudentEditState
  > | null>(null);

  const [updateUser] = useUpdateUserMutation();
  const [updateStakeholder] = useUpdateStakeholderMutation();
  const [createAttachment] = useCreateAttachmentMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = params instanceof Promise ? await params : params;
        if (resolved?.id) setStudentId(resolved.id);
      } catch {
        // ignore
      } finally {
        setHasChecked(true);
      }
    };
    resolveParams();
  }, [params]);

  const {
    data: studentData,
    isLoading,
    isError,
  } = useGetStudentByIdQuery(studentId ?? "", { skip: !studentId });

  const student = studentData?.data;
  console.log(student);

  // Initialise form state once student data arrives
  useEffect(() => {
    if (student && !formState) {
      setFormState(getInitialStudentEditState(student));
    }
  }, [student, formState]);

  const go = (dir: 1 | -1) => {
    const i = STEPS.indexOf(step) + dir;
    if (i >= 0 && i < STEPS.length) setStep(STEPS[i]);
  };

  const update = <K extends keyof NonNullable<typeof formState>>(
    key: K,
    value: NonNullable<typeof formState>[K],
  ) => setFormState((s) => (s ? { ...s, [key]: value } : s));

  const handleSubmit = async () => {
    if (!student || !formState) return;
    setIsSubmitting(true);

    try {
      const userPayload = buildUserUpdatePayload(formState, student);
      const stakeholderPayload = buildStakeholderUpdatePayload(
        formState,
        student,
      );
      const newDocs = getNewDocuments(formState);
      // console.log("User Payload", userPayload);
      // console.log("Stakeholder Payload", userPayload);
      // console.log("Student ID: ", student.id);
      // console.log("Studer User ID", student.user.id);

      await Promise.all([
        updateUser({ id: student.user.id, data: userPayload as any }).unwrap(),
        updateStakeholder({
          id: student.id,
          data: stakeholderPayload,
        }).unwrap(),
      ]);

      // Upload any new documents
      if (newDocs.length > 0) {
        await Promise.all(
          newDocs.map((doc) => {
            const fd = new FormData();
            fd.append("file", doc.file);
            fd.append("name", doc.name);
            fd.append("type", doc.type);
            fd.append("user_id", student.user_id);
            fd.append("status", "pending");
            return createAttachment(fd).unwrap();
          }),
        );
      }

      toast.success("Student updated successfully");
      router.push(`/admin/students/${student.id}`);
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to update student oh";
      toast.error(message);
      console.error("Edit student failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading / error states ---

  if (!hasChecked || !studentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isLoading || !formState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading student data...</div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Failed to load student.</div>
      </div>
    );
  }

  const studentName = `${student.user.first_name} ${student.user.last_name}`;

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Student</h2>
        <p className="text-sm text-gray-500 mt-1">{studentName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <EditStepNavigation
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
                <PersonalInfoForm
                  value={formState.details}
                  onChange={(v) => update("details", v)}
                  onNext={() => go(1)}
                  onCancel={() => router.back()}
                />
              )}
              {step === "academic" && (
                <AcademicInfoForm
                  value={formState.academic}
                  onChange={(v) => update("academic", v)}
                  onNext={() => go(1)}
                  onBack={() => go(-1)}
                  onCancel={() => router.back()}
                />
              )}
              {step === "documents" && (
                <StudentDocumentUploadForm
                  value={formState.documents}
                  onChange={(v) => update("documents", v)}
                  onNext={() => go(1)}
                  onBack={() => go(-1)}
                  onCancel={() => router.back()}
                />
              )}
              {step === "status" && (
                <StudentStatusForm
                  value={formState.status}
                  onChange={(v) => update("status", v)}
                  onBack={() => go(-1)}
                  onCancel={() => router.back()}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
