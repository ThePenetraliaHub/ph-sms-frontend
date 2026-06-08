"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LetterGradeDefinitionsModal } from "./letter-grade-definitions-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUpdateSchoolMutation } from "@/services/schools/schools";
import { GradingScaleConfig } from "@/services/schools/schools-type";

interface GradingScalesFormProps {
  handleBack: () => void;
  schoolId: string;
  isSchoolDataLoading: boolean;
  prevGradingScalesConfig: GradingScaleConfig[] | undefined;
}

export function GradingScalesForm({
  handleBack,
  schoolId,
  isSchoolDataLoading,
  prevGradingScalesConfig,
}: GradingScalesFormProps) {
  const [gradeName, setGradeName] = useState("");
  const [gradePoint, setGradePoint] = useState("");
  const [upperPercentage, setUpperPercentage] = useState("");
  const [lowerPercentage, setLowerPercentage] = useState("");
  const [remark, setRemark] = useState("");
  const [gradeTableModalOpen, setGradeTableModalOpen] = useState(false);

  const [updateSchool, { isLoading: isUpdatingSchool }] =
    useUpdateSchoolMutation();

  const handleAddGradeLevel = async () => {
    if (isSchoolDataLoading)
      return toast.error(
        "School data is still loading. Please wait a moment and try again.",
      );

    if (
      isNaN(Number(gradePoint)) ||
      isNaN(Number(upperPercentage)) ||
      isNaN(Number(lowerPercentage))
    ) {
      toast.error(
        "Please enter valid numbers for Grade Point, Upper Percentage, and Lower Percentage.",
      );
      return;
    }

    const newGradeLevel: GradingScaleConfig = {
      grade_name: gradeName,
      grade_point: Number(gradePoint),
      upper_percentage: Number(upperPercentage),
      lower_percentage: Number(lowerPercentage),
      remark: remark,
    };

    //upload grade point
    try {
      const res = await updateSchool({
        id: schoolId,
        data: {
          grading_scales_config: [
            ...(prevGradingScalesConfig ?? []),
            newGradeLevel,
          ],
        },
      }).unwrap();
      toast.success(
        res.message ? res.message : "New grade level added successfully!",
      );
      // Clear form fields after successful submission
      setGradeName("");
      setGradePoint("1");
      setUpperPercentage("");
      setLowerPercentage("");
      setRemark("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add new grade level. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Grading Scales Configuration
        </h3>
        <Button variant="outline" onClick={() => setGradeTableModalOpen(true)}>
          See Grade Table
        </Button>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-4">
          Letter Grade Definitions
        </h4>
        <p className="text-sm text-gray-600 mb-6">
          Define a new grade level by filling in the fields below.
        </p>
      </div>

      <div className="space-y-6">
        <InputField
          label="Grade Name"
          value={gradeName}
          onChange={(e) => setGradeName(e.target.value)}
          placeholder="e.g. Grade A"
        />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">
            Percentage Boundary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Upper percentage"
              type="number"
              value={upperPercentage}
              onChange={(e) => setUpperPercentage(e.target.value)}
              placeholder="e.g. 100"
            />
            <InputField
              label="Lower Percentage"
              type="number"
              value={lowerPercentage}
              onChange={(e) => setLowerPercentage(e.target.value)}
              placeholder="e.g. 70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Numerical Grade Point (GPA Value)</Label>
          <Select onValueChange={(value) => setGradePoint(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="e.g. 5" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value, key) => {
                return (
                  <SelectItem key={key} value={value.toString()}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <InputField
          label="Principal/HOD Remark"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="E.g. Excellent, Very Good, Good, Fair, Poor"
        />

        <div className="space-y-6">
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button
              disabled={
                !gradeName.trim() ||
                !gradePoint.trim() ||
                !upperPercentage.trim() ||
                !lowerPercentage.trim() ||
                !remark.trim() ||
                isUpdatingSchool
              }
              className="w-60 disabled:opacity-50"
              onClick={handleAddGradeLevel}
            >
              {!isUpdatingSchool ? "Submit New Grade Level" : "Submitting..."}
            </Button>
          </div>
        </div>
      </div>

      <LetterGradeDefinitionsModal
        open={gradeTableModalOpen}
        onOpenChange={setGradeTableModalOpen}
        onEditGrade={(gradeId) => {
          console.log("Edit grade:", gradeId);
        }}
        grades={prevGradingScalesConfig ?? []}
      />
    </div>
  );
}
