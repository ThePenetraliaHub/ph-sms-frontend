"use client";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { ModalContainer } from "@/components/ui/modal-container";
import { SelectItem } from "@/components/ui/select";
import React, { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResourceForm = {
  document: File | undefined;
  courseAssigned: string;
  unitAssigned: string;
};

export default function UploadNewResource({ onOpenChange, open }: Props) {
  //dummy ops
  const courseOptions = [
    {
      value: "Unit 3: Algebra",
      label: "Unit 3: Algebra",
    },
    {
      value: "Unit 3: Economics",
      label: "Unit 3: Economics",
    },
    {
      value: "Unit 3: English",
      label: "Unit 3: English",
    },
  ];
  const unitOptions = [
    {
      value: "JSS 1 Mathematics",
      label: "JSS 1 Mathematics",
    },
    {
      value: "JSS 2 Mathematics",
      label: "JSS 2 Mathematics",
    },
    {
      value: "JSS 3 Mathematics",
      label: "JSS 3 Mathematics",
    },
  ];

  //state handler
  const [newResource, setNewResource] = useState<ResourceForm>({
    document: undefined,
    courseAssigned: "",
    unitAssigned: "",
  });

  //handle mocal close
  const handleCancel = () => {
    onOpenChange(false);
    setNewResource({
      document: undefined,
      courseAssigned: "",
      unitAssigned: "",
    });
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
  const handleSubmit = () => {
    console.log(newResource);
    //validate
    //call endpoint & effect change
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
            className="bg-main-blue h-12 text-white hover:bg-main-blue/90"
            onClick={handleSubmit}
            // disabled={!isFormValid}
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
          {/* <Input
            type="file"
            placeholder="Enter password"
            className="lg:h-12 lg:px-5"
            onChange={handleChange}
            // value={passwordHandler.newPass}
            name="newPass"
          /> */}
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
            label="Assign to Course"
            value={newResource.courseAssigned}
            // onValueChange={setCourseAssigned}
            onValueChange={(e) => {
              setNewResource((prevState) => {
                return {
                  ...prevState,
                  courseAssigned: e,
                };
              });
            }}
            placeholder="Select Course"
          >
            {courseOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectField>

          <SelectField
            label="Assign to Unit"
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
            placeholder="Select Unit"
          >
            {unitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectField>
        </div>
      </div>
    </ModalContainer>
  );
}
