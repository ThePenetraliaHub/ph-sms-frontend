"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StepNavigation, Step } from "@/components/ui/step-navigation";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { format } from "date-fns";
import { AssignmentsIcon, ResourcesAddIcon } from "@hugeicons/core-free-icons";
import { useGetSubjectsQuery } from "@/services/subjects/subjects";
import type { Subject } from "@/services/subjects/subject-types";

type StepId = "standards-mapping" | "draft-outlines";

const steps: Step[] = [
  {
    id: "standards-mapping",
    label: "Standards Mapping",
    icon: ResourcesAddIcon,
  },
  {
    id: "draft-outlines",
    label: "Draft Subject Outlines",
    icon: AssignmentsIcon,
  },
];

interface DraftOutline {
  id: string;
  subjectName: string;
  applicableGrades: string[];
  lastEditedBy: string;
  lastModifiedDate: Date;
}

function subjectToDraftOutline(s: Subject): DraftOutline {
  const grades = s.applicable_grade ? [...s.applicable_grade] : [];
  const ub = s.updated_by;
  const lastEditedBy =
    ub && typeof ub === "object"
      ? `${ub.first_name ?? ""} ${ub.last_name ?? ""}`.trim() || "—"
      : "—";
  return {
    id: s.id,
    subjectName: s.name,
    applicableGrades: grades,
    lastEditedBy,
    lastModifiedDate: new Date(s.updated_at),
  };
}

interface MappingRow {
  id: string;
  internalUnit: string;
  internalTopic: string;
  externalStandard: string;
}

const standardOptions = [
  { value: "waec-2026", label: "WAEC 2026 Syllabus" },
  { value: "national-curriculum", label: "National Curriculum" },
  { value: "q4", label: "Q4" },
];

function contentOutlineToMappingRows(
  subject: Subject | undefined,
  standardLabel: string,
): MappingRow[] {
  if (!subject?.content_outline_table?.length) return [];
  const outline = subject.content_outline_table;
  const externalLabel =
    standardLabel ||
    subject.curriculum_standard ||
    "Not yet mapped to external standard";
  return outline.map((item, index) => ({
    id: `${subject.id}-${index}`,
    internalUnit: item.unit_definition ?? "—",
    internalTopic: item.topic_definition ?? "—",
    externalStandard: externalLabel,
  }));
}

export default function MapStandardSubjectPage() {
  const [activeStep, setActiveStep] = useState<StepId>("standards-mapping");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedStandard, setSelectedStandard] = useState<string>("");

  const { data: subjectsResponse } = useGetSubjectsQuery({ _all: true });
  const subjectsList: Subject[] = useMemo(() => {
    const d = (subjectsResponse as { data?: Subject[] })?.data;
    return Array.isArray(d) ? d : [];
  }, [subjectsResponse]);

  const selectedSubjectData = useMemo(
    () => subjectsList.find((s) => s.id === selectedSubject),
    [subjectsList, selectedSubject],
  );

  const standardLabel = useMemo(() => {
    const opt = standardOptions.find((o) => o.value === selectedStandard);
    return opt?.label ?? "";
  }, [selectedStandard]);

  const mappingData: MappingRow[] = useMemo(
    () => contentOutlineToMappingRows(selectedSubjectData, standardLabel),
    [selectedSubjectData, standardLabel],
  );

  const draftOutlinesData: DraftOutline[] = useMemo(
    () => subjectsList.map(subjectToDraftOutline),
    [subjectsList],
  );

  const subjectOptions = useMemo(
    () =>
      subjectsList.map((s) => ({
        value: s.id,
        label: `${s.name}${s.applicable_grade ? ` (${s.applicable_grade})` : ""}`,
      })),
    [subjectsList],
  );

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId as StepId);
  };

  const draftOutlinesColumns: TableColumn<DraftOutline>[] = [
    {
      key: "subjectName",
      title: "Subject Name",
      className: "font-medium",
    },
    {
      key: "applicableGrades",
      title: "Applicable Grade(s)",
      render: (value) => <span className="text-sm">{value.join(", ")}</span>,
    },
    {
      key: "lastEditedBy",
      title: "Last Edited By",
    },
    {
      key: "lastModifiedDate",
      title: "Last Modified Date",
      render: (value) => (
        <div className="flex flex-col gap-1">
          <p className="text-sm">{format(value, "LLL. d, yyyy")}</p>
          <p className="text-xs text-gray-500 font-light">
            {format(value, "h:mm a")}
          </p>
        </div>
      ),
    },
  ];

  const draftOutlinesActions: TableAction<DraftOutline>[] = [
    {
      type: "link",
      config: {
        label: "Continue Editing",
        href: (row) =>
          `/admin/academic/curriculum-management/add-edit-subject-outline?id=${row.id}`,
        className: "text-main-blue hover:text-main-blue/80",
      },
    },
  ];

  const mappingColumns: TableColumn<MappingRow>[] = [
    {
      key: "internal",
      title: `Subject: ${selectedSubjectData ? `${selectedSubjectData.name}${selectedSubjectData.applicable_grade ? ` (${selectedSubjectData.applicable_grade})` : ""}` : "Internal Curriculum"} - Internal Curriculum`,
      render: (value, row) => (
        <div className="space-y-1">
          <p className="text-sm font-medium">{row.internalUnit}</p>
          <p className="text-sm text-gray-600">{row.internalTopic}</p>
        </div>
      ),
    },
    {
      key: "externalStandard",
      title: `External Standard${standardLabel ? ` - ${standardLabel}` : ""}`,
      render: (value) => <p className="text-sm">{value}</p>,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Map Standard to Subject
        </h2>
        <p className="text-gray-600 mt-1">
          This is a critical process for accreditation and ensuring educational
          quality.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Navigation */}
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

        {/* Right Content */}
        <div className="lg:col-span-3">
          <Card className="p-0 bg-background">
            <CardContent className="p-6">
              {activeStep === "standards-mapping" ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Standards Mapping Interface
                    </h3>

                    <div className="space-y-4">
                      <SelectField
                        label="Select Subject"
                        value={selectedSubject}
                        onValueChange={setSelectedSubject}
                        placeholder="Choose Subject (e.g., SS2 Biology)"
                      >
                        {subjectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectField>

                      <SelectField
                        label="Select Standard"
                        value={selectedStandard}
                        onValueChange={setSelectedStandard}
                        placeholder="Choose Standard (e.g., WAEC 2026 Syllabus, National Curriculum, Q4)"
                      >
                        {standardOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectField>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Mapping Table
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <DataTable
                        columns={mappingColumns}
                        data={mappingData}
                        emptyMessage="No mappings available. Select a subject and standard to begin."
                        tableClassName="border-collapse"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Draft Subject Outlines Access ({draftOutlinesData.length})
                    </h3>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <DataTable
                      columns={draftOutlinesColumns}
                      data={draftOutlinesData}
                      actions={draftOutlinesActions}
                      emptyMessage="No draft subject outlines available."
                      tableClassName="border-collapse"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
