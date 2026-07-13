"use client";

import {
  ExtResourceFile,
  SubjectOutlineForm,
} from "@/app/(dashboard)/admin/academic/curriculum-management/add-edit-subject-outline/page";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

interface SubjectIdentityScopeFormProps {
  formData: {
    mode: "create" | "edit";
    selectedSubject: string;
    subjectName: string;
    subjectCode: string;
    applicableGrade: string;
    headOfDepartment: string;
    resource: ExtResourceFile[];
  };
  attachments: File[];
  setAttachments: Dispatch<SetStateAction<File[]>>;
  setFormData: Dispatch<SetStateAction<SubjectOutlineForm>>;
  onSaveContinue: () => void;
  gradeOptions: Array<string>;
  hodOptions: { value: string; label: string }[];
  subjectOptions: { value: string; label: string }[];
}

export function SubjectIdentityScopeForm({
  formData,
  attachments,
  setAttachments,
  setFormData,
  onSaveContinue,
  gradeOptions,
  hodOptions,
  subjectOptions,
}: SubjectIdentityScopeFormProps) {
  // console.log("formData Resource: ", formData.resource);

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    //check document size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Document size is greater than 5MB");
      e.target.value = ""; // reset input
      return;
    }

    //check if file exists in the document array already
    if (attachments.some((doc) => doc.name === file.name)) {
      toast.error("Document already added");
      e.target.value = "";
      return;
    }

    setAttachments((prev) => {
      return [...prev, file];
    });
  };

  const removeDocument = (name: string) => {
    setAttachments((prev) => prev.filter((doc) => doc.name !== name));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Subject Identity & Scope
      </h3>

      {/* Mode Selection */}
      <div className="flex gap-2 border rounded-md p-1">
        <Button
          type="button"
          variant={formData.mode === "create" ? "default" : "outline"}
          onClick={() => setFormData((prev) => ({ ...prev, mode: "create" }))}
          className={cn(
            "flex-1",
            formData.mode === "create"
              ? "bg-main-blue/5 text-main-blue hover:bg-main-blue/10"
              : "bg-white text-gray-700 hover:bg-main-blue/5 border-0 shadow-none",
          )}
        >
          Create New Subject
        </Button>
        <Button
          type="button"
          variant={formData.mode === "edit" ? "default" : "outline"}
          onClick={() => setFormData((prev) => ({ ...prev, mode: "edit" }))}
          className={cn(
            "flex-1",
            formData.mode === "edit"
              ? "bg-main-blue/5 text-main-blue hover:bg-main-blue/10"
              : "bg-white text-gray-700 hover:bg-main-blue/5 border-0 shadow-none",
          )}
        >
          Edit Existing Subject
        </Button>
      </div>

      {formData.mode === "edit" ? (
        <SelectField
          label="Select Subject"
          value={formData.selectedSubject}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, selectedSubject: value }))
          }
          placeholder="E.g., Integrated Science"
        >
          {subjectOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectField>
      ) : (
        <InputField
          label="Subject Name"
          placeholder="E.g., Integrated Science"
          value={formData.subjectName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, subjectName: e.target.value }))
          }
        />
      )}

      <InputField
        label="Subject Code"
        placeholder="E.g., ISC-JSS2"
        value={formData.subjectCode}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, subjectCode: e.target.value }))
        }
      />

      <SelectField
        label="Applicable Grade/ Class"
        value={formData.applicableGrade}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, applicableGrade: value }))
        }
        placeholder="E.g., JSS1, JSS2, JSS3, etc."
      >
        {gradeOptions.map((option, index) => (
          <SelectItem key={index} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectField>

      <SelectField
        label="Head of Department (HOD)"
        value={formData.headOfDepartment}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, headOfDepartment: value }))
        }
        placeholder="Select from Staff Directory"
      >
        {hodOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectField>

      {/* previously added materials */}
      {formData.mode === "edit" && (
        <div className="px-1.5 space-y-2">
          <p className="text-sm font-semibold">Previously Added Resources</p>
          {formData.resource.length > 0 ? (
            <div className="space-y-2">
              {formData.resource.map((material) => (
                <div
                  key={material.id}
                  className="text-sm flex items-center justify-between gap-x-2 w-full bg-accent rounded-lg p-2.5"
                >
                  <p>{material.name}</p>
                  <a
                    href={material.file_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No resources added.</p>
          )}
        </div>
      )}

      {/* materials & resources */}

      {formData.mode === "create" && (
        <div className="px-1.5 space-y-2">
          <p className="text-sm font-semibold">Resources</p>
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file) => (
                <div
                  key={file.name}
                  className="text-sm flex items-center justify-between gap-x-2 w-full bg-accent rounded-lg p-2.5"
                >
                  <p>{file.name}</p>
                  <button
                    type="button"
                    onClick={() => removeDocument(file.name)}
                    className="bg-transparent text-destructive cursor-pointer hover:scale-110 transition ease-in-out delay-100"
                  >
                    <X />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="w-full border-input border p-2 flex items-center justify-center h-10 rounded-lg text-sm font-medium relative">
            {"Click to add resource (PDF, DOCX) < 5MB"}
            <input
              disabled={attachments.length >= 5}
              multiple={false}
              onChange={addFiles}
              accept=".pdf,.docs,.doc,.docx"
              className="text-sm cursor-pointer absolute top-0 bottom-0 right-0 left-0 opacity-0"
              type="file"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button className="w-60" onClick={onSaveContinue}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
