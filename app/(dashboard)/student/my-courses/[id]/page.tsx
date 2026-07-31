"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/general/huge-icon";
import {
  Search01Icon,
  ViewIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { useGetSubjectByIdQuery } from "@/services/subjects/subjects";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface Resource {
  name: string;
  format: string;
  link: string;
}

interface CourseContent {
  unitTopic: string;
  topicLessonName: string;
  resources: Resource[];
  status: "In progress" | "Not Started" | "Nil";
}

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [courseContents, setCourseContents] = useState<CourseContent[]>([]);

  const {
    data: subject,
    isLoading: isFetchingSubject,
    isError: isFecthingSubjectErr,
  } = useGetSubjectByIdQuery(id, { skip: !id });

  const course = useMemo(() => {
    if (!subject) return;
    const courseOutline: CourseContent[] =
      subject.data.content_outline_table.map((prev) => ({
        unitTopic: prev.unit_definition,
        topicLessonName: prev.topic_definition,
        resources: subject.data.resource
          ? subject.data.resource?.map((item) => ({
              name: item.name,
              format: item.format,
              link: item.file_link,
            }))
          : [],
        status: subject.data.status as "In progress" | "Not Started" | "Nil",
      }));
    setCourseContents(courseOutline);
    return subject.data;
  }, [subject]);

  async function handleResourceDownload(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      toast.error("An error occured. Please try again.");
    }
  }

  const columns: TableColumn<CourseContent>[] = [
    {
      key: "unitTopic",
      title: "Unit Topics",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "topicLessonName",
      title: "Topic / Lesson Name",
      render: (value) => (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {value as string}
        </div>
      ),
    },
    {
      key: "resources",
      title: "Resources Available",
      render: (value, row) => {
        const resources = row.resources;
        if (resources.length === 0) {
          return (
            <span className="text-sm text-gray-400">No Resources Yet</span>
          );
        }
        return (
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 text-sm text-gray-700"
              >
                <span>{resource.name}</span>
                <div className="flex items-center gap-1">
                  {/* view */}
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="View"
                  >
                    <Icon icon={ViewIcon} size={16} />
                  </a>
                  {/* download */}
                  <button
                    onClick={() =>
                      handleResourceDownload(resource.link, resource.name)
                    }
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    title="Download"
                  >
                    <Icon icon={Download01Icon} size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as string;
        const colorClass =
          status === "In progress"
            ? "text-blue-600"
            : status === "Not Started"
              ? "text-gray-600"
              : "text-gray-400";
        return (
          <span className={`text-sm capitalize ${colorClass}`}>{status}</span>
        );
      },
    },
  ];

  if (isFetchingSubject)
    return (
      <div className="text-muted-foreground min-h-[80vh] flex items-center justify-center">
        Loading course...
      </div>
    );

  if (isFecthingSubjectErr)
    return (
      <div className="text-muted-foreground min-h-[80vh] flex items-center justify-center">
        {" "}
        ❌ Failed to get course. Try again.
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Course Header */}
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {course?.name}
        </h1>
        <div className="flex flex-wrap gap-3">
          <div className="bg-gray-100 rounded-md px-4 py-2">
            <span className="text-sm text-gray-700">
              Assigned Teacher: {course?.head_of_department_id ?? ""}
            </span>
          </div>
          <div className="bg-gray-100 rounded-md px-4 py-2">
            <span className="text-sm text-gray-700">
              Curriculum Standard: {course?.curriculum_standard ?? ""}
            </span>
          </div>
          <div className="bg-gray-100 rounded-md px-4 py-2">
            <span className="text-sm text-gray-700">
              Course Status: {course?.status ?? ""}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="New Resources" value="3 New Resources" trend="up" />
        <MetricCard title="Latest Grade" value="92%" trend="up" />
      </div>

      {/* Course Outline and Resource Access */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Course Outline and Resource Access
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon
                  icon={Search01Icon}
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  type="search"
                  placeholder="Text Input (e.g., Kinetic Energy Video)"
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Icon icon={Search01Icon} size={18} />
                Filter: All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={courseContents}
              showActionsColumn={false}
            />
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="outline">Load More</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
