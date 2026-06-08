"use client";

import { useRef } from "react";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { Upload } from "lucide-react";
import type { AccessDocumentationState } from "./staff-form-state";
import type { DocumentUploadState } from "./staff-form-state";

interface DocumentField {
  id: string;
  label: string;
  format: string;
  fileType: "pdf" | "jpg";
}

const documentFields: DocumentField[] = [
  {
    id: "medicalReport",
    label: "Medical Report",
    format: "First Name_Surname_Doc. Type.pdf",
    fileType: "pdf",
  },
  {
    id: "passportPhoto",
    label: "Passport Photo",
    format: "First Name_Surname_Doc. Type.jpg",
    fileType: "jpg",
  },
];

export function AccessDocumentationForm({
  value,
  onChange,
  documents,
  onDocumentsChange,
  onSubmit,
  onBack,
  onCancel,
  isSubmitting,
}: {
  value: AccessDocumentationState;
  onChange: (next: AccessDocumentationState) => void;
  documents: DocumentUploadState;
  onDocumentsChange: (next: DocumentUploadState) => void;
  onSubmit: () => void;
  onBack: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const formData = value;
  const setFormData = onChange;
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const systemRoles = ["admin", "write"];

  const handleFileChange = (id: string, file: File | null) => {
    onDocumentsChange({ ...documents, [id]: file });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Access & Documentation
      </h2>

      <div className="space-y-6">
        <InputField
          id="schoolEmail"
          label="Generate School Email"
          value={formData.schoolEmail}
          onChange={(e) =>
            setFormData({ ...formData, schoolEmail: e.target.value })
          }
          readOnly
        />

        <SelectField
          label="System Role/Permissions"
          placeholder="Select System Role/Permissions"
          value={formData.systemRole}
          onValueChange={(value) =>
            setFormData({ ...formData, systemRole: value })
          }
        >
          {systemRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectField>

        {/* Document Upload Section */}
        {documentFields.map((field) => (
          <div key={field.id} className="space-y-2 hidden">
            <Label htmlFor={field.id}>{field.label}</Label>
            <div className="relative">
              <input
                ref={(el) => {
                  fileInputRefs.current[field.id] = el;
                }}
                type="file"
                id={field.id}
                accept={field.fileType === "pdf" ? ".pdf" : ".jpg,.jpeg"}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange(field.id, file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start h-auto min-h-[60px] py-4 px-4"
                onClick={() => fileInputRefs.current[field.id]?.click()}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 text-left">
                    {documents[field.id] ? (
                      <span className="text-sm text-gray-600">
                        {documents[field.id]?.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Upload {field.fileType.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Upload className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </Button>
            </div>
            <p className="text-xs text-red-600">(format: {field.format})</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          className="w-60 bg-main-blue hover:bg-main-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding Staff..." : "Add New Staff"}
        </Button>
      </div>
    </div>
  );
}
