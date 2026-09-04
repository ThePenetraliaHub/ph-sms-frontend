"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { ModalContainer } from "@/components/ui/modal-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CurriculumStructurePacingFormProps {
  formData: {
    curriculumStandard: string;
    contentOutline: Array<{
      unit: string;
      topic: string;
      plannedPeriods: string;
    }>;
    plannedPacing: string;
  };
  onFormDataChange: (
    data: Partial<CurriculumStructurePacingFormProps["formData"]>,
  ) => void;
  onBack: () => void;
  onSaveContinue: () => void;
  curriculumStandardOptions: { value: string; label: string }[];
  pacingOptions: { value: string; label: string }[];
  subjectName: string;
}

export function CurriculumStructurePacingForm({
  formData,
  onFormDataChange,
  onBack,
  onSaveContinue,
  curriculumStandardOptions,
  pacingOptions,
  subjectName,
}: CurriculumStructurePacingFormProps) {
  const [units, setUnits] = useState<string[]>([""]);
  const [topics, setTopics] = useState<string[]>([""]);
  const [showSubjectOutlineModal, setShowSubjectOutlineModal] = useState(false);

  const updateContentOutlineWithData = (
    currentUnits: string[],
    currentTopics: string[],
  ) => {
    const maxLength = Math.max(currentUnits.length, currentTopics.length);
    const outline: { unit: string; topic: string; plannedPeriods: string }[] =
      [];
    for (let i = 0; i < maxLength; i++) {
      outline.push({
        unit: currentUnits[i] || "",
        topic: currentTopics[i] || "",
        plannedPeriods: formData.plannedPacing || "",
      });
    }
    onFormDataChange({ contentOutline: outline });
  };

  const handleAddTopic = () => {
    const newUnits = [...units, ""];
    setUnits(newUnits);
    updateContentOutlineWithData(newUnits, topics);
  };

  const handleAddUnit = () => {
    const newTopics = [...topics, ""];
    setTopics(newTopics);
    updateContentOutlineWithData(units, newTopics);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Curriculum Structure & Pacing
      </h3>

      <SelectField
        label="Curriculum Standard"
        value={formData.curriculumStandard}
        onValueChange={(value) =>
          onFormDataChange({ curriculumStandard: value })
        }
        placeholder="Select: National (NERDC) / International (IGCSE) / School Custom"
      >
        {curriculumStandardOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectField>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800">
            Content Outline Table
          </h4>
          {(units.length > 0 || topics.length > 0) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSubjectOutlineModal(true)}
              className="h-9 text-main-blue border-main-blue hover:bg-main-blue/5"
            >
              See Subject Outline
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {Array.from({
            length: Math.max(units.length, topics.length),
          }).map((_, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <InputField
                  label={index === 0 ? "Unit Definition" : ""}
                  placeholder="E.g., Ecology Basics"
                  value={units[index] || ""}
                  onChange={(e) => {
                    const newUnits = [...units];
                    while (newUnits.length <= index) {
                      newUnits.push("");
                    }
                    newUnits[index] = e.target.value;
                    setUnits(newUnits);
                    updateContentOutlineWithData(newUnits, topics);
                  }}
                />
              </div>
              <div className="flex-1">
                <InputField
                  label={index === 0 ? "Topic Definition" : ""}
                  placeholder="E.g., Food Chains"
                  value={topics[index] || ""}
                  onChange={(e) => {
                    const newTopics = [...topics];
                    while (newTopics.length <= index) {
                      newTopics.push("");
                    }
                    newTopics[index] = e.target.value;
                    setTopics(newTopics);
                    updateContentOutlineWithData(units, newTopics);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <SelectField
        label="Planned Pacing"
        value={formData.plannedPacing}
        onValueChange={(value) => {
          onFormDataChange({ plannedPacing: value });
          onFormDataChange({
            contentOutline: formData.contentOutline.map((item) => ({
              ...item,
              plannedPeriods: value,
            })),
          });
        }}
        placeholder="Select weeks for each unit and topic"
      >
        {pacingOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectField>

      <div className="flex gap-2 place-self-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddTopic}
          className="h-9"
        >
          Add Topic
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddUnit}
          className="h-9"
        >
          Add Unit
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button className="w-60" onClick={onSaveContinue}>
          Save & Continue
        </Button>
      </div>

      {/* Subject Outline Modal */}
      <ModalContainer
        open={showSubjectOutlineModal}
        onOpenChange={setShowSubjectOutlineModal}
        title={`Subject: ${subjectName || "Integrated Science"}`}
        size="3xl"
      >
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-main-blue/5">
                <TableHead className="font-semibold">Unit Name</TableHead>
                <TableHead className="font-semibold">Topic</TableHead>
                <TableHead className="font-semibold">Planned Periods</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.contentOutline.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-gray-500 py-8"
                  >
                    No content outline added yet
                  </TableCell>
                </TableRow>
              ) : (
                formData.contentOutline.map((item, index) => (
                  <TableRow
                    key={index}
                    className={index === 0 ? "bg-main-blue/5" : ""}
                  >
                    <TableCell>
                      {item.unit
                        ? `Unit ${index + 1}: ${item.unit}`
                        : `Unit ${index + 1}`}
                    </TableCell>
                    <TableCell>
                      <span className={index === 0 ? "font-semibold" : ""}>
                        {item.topic
                          ? `Topic ${index + 1}.${index + 1}: ${item.topic}`
                          : `Topic ${index + 1}.${index + 1}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.plannedPeriods
                        ? `${
                            pacingOptions.find(
                              (opt) => opt.value === item.plannedPeriods,
                            )?.label || item.plannedPeriods
                          }`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <p className="text-sm text-gray-500 mt-4">
            Select weeks for each unit and topic
          </p>
        </div>
      </ModalContainer>
    </div>
  );
}
