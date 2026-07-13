"use client";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { ModalContainer } from "@/components/ui/modal-container";
import { SelectItem } from "@/components/ui/select";
import { useGetClassQuery } from "@/services/schools/schools";
import { useUpdateSubjectMutation } from "@/services/subjects/subjects";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assigned_classes: string[];
  schoolId: string;
}

type ResourceForm = {
  document: File | undefined;
  courseAssigned: string;
  // unitAssigned: string;
  classAssigned: string;
};

export default function UploadNewResource({
  onOpenChange,
  open,
  assigned_classes,
  schoolId,
}: Props) {
  const [newResource, setNewResource] = useState<ResourceForm>({
    document: undefined,
    courseAssigned: "",
    classAssigned: assigned_classes[0] ?? "",
  });

  //fetch class to get access to the subjects offered by that class
  const { data: class_data, isLoading: isFetchingClass } = useGetClassQuery(
    { id: schoolId ?? "", class_name: newResource.classAssigned },
    { skip: !schoolId || !newResource.classAssigned },
  );

  //update subject endpoint
  const [updateSubject, { isLoading: isUpdatingSubject }] =
    useUpdateSubjectMutation();

  const curr_class = useMemo(() => {
    if (!class_data) return;
    return class_data.data;
  }, [class_data]);

  //handle mocal close
  const handleCancel = () => {
    setNewResource({
      document: undefined,
      courseAssigned: "",
      // unitAssigned: "",
      classAssigned: "",
    });
    onOpenChange(false);
  };

  //handle file uploads
  const pickResource = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFile = e.target?.files[0];
    setNewResource((prevState) => {
      return {
        ...prevState,
        document: selectedFile,
      };
    });
  };

  //handle submission
  const handleSubmit = async () => {
    if (!newResource.document) return toast.error("Resource cannot be null");
    const subject = new FormData();
    if (!newResource.courseAssigned)
      return toast.error("Please select a subject");
    subject.append("files", newResource.document);

    try {
      const res = await updateSubject({
        id: newResource.courseAssigned,
        data: subject,
      }).unwrap();
      toast.success("Resource uploaded successfully");
      handleCancel();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ModalContainer
      open={open}
      title={"Upload New Resource"}
      onOpenChange={handleCancel}
      size="3xl"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button className="h-12" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="bg-main-blue h-12 text-white hover:bg-main-blue/90 transition ease-in-out delay-100 opacity-100 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isUpdatingSubject || !newResource.document}
          >
            Upload & Submit
          </Button>
        </div>
      }
    >
      <div
        // onSubmit={handlePasswordUpdate}
        className="space-y-7"
      >
        <div className="flex flex-col gap-y-3 w-full">
          <Label htmlFor="password">Browse File</Label>
          <div className="w-full h-10 border border-gray-200 rounded-lg flex items-center justify-center text-sm relative">
            <p>
              {newResource.document
                ? newResource.document?.name
                : "Select PDF, MP4, DOCX, etc"}
            </p>
            <input
              type="file"
              onChange={pickResource}
              accept=".pdf, .docx, .mp4, image/*"
              className={`absolute top-0 bottom-0 left-0 right-0 opacity-0 cursor-pointer ${newResource.document && "hidden"}`}
            />
          </div>
        </div>
        <div className="space-y-6 w-full">
          <SelectField
            label="Assign to Class"
            disabled={isFetchingClass}
            value={newResource.classAssigned}
            onValueChange={(e) => {
              setNewResource((prevState) => {
                return {
                  ...prevState,
                  classAssigned: e,
                };
              });
            }}
            placeholder="Select Class"
          >
            {assigned_classes.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectField>

          <SelectField
            label="Assign to Subject"
            disabled={isFetchingClass}
            value={newResource.courseAssigned}
            onValueChange={(e) => {
              setNewResource((prevState) => {
                return {
                  ...prevState,
                  courseAssigned: e,
                };
              });
            }}
            placeholder="Select Subject"
          >
            {curr_class?.subjects.map((subject, index) => (
              <SelectItem key={index} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectField>

          {/* <SelectField
            label="Assign to Unit/Outline"
            value={newResource.unitAssigned}
            // onValueChange={setUnitAssigned}
            onValueChange={(e) => {
              setNewResource((prevState) => {
                return {
                  ...prevState,
                  unitAssigned: e,
                };
              });
            }}
            placeholder="Select Subject Unit/Outline"
          >
            {unitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectField> */}
        </div>
      </div>
    </ModalContainer>
  );
}
