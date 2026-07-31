"use client";

import { useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { CourseCard } from "@/components/dashboard-pages/student/my-courses/course-card";
import { useGetClassQuery } from "@/services/schools/schools";
import { useGetStudentByQueryParamQuery } from "@/services/stakeholders/stakeholders";

export interface Course {
  courseCode: string;
  courseName: string;
  teacher: string;
  currentUnit: number;
  status: string;
  courseId: string;
  resources: { name: string; format: string; link: string }[];
}

export default function MyCoursesPage() {
  const user = useAppSelector(selectUser);
  const [myCourses, setMyCourses] = useState<Course[]>([]);

  //get stakeholder
  const { data: stakeholder, isLoading: isFetchingStudent } =
    useGetStudentByQueryParamQuery(user?.id ?? "", { skip: !user?.id });

  const my_class = useMemo(() => {
    if (!stakeholder?.data) return;
    return stakeholder.data[0].class_assigned;
  }, [stakeholder]);

  //get class-details
  const { data: assigned_class_data, isLoading: isFetchingClass } =
    useGetClassQuery(
      {
        id: user?.school_id ?? "",
        class_name: my_class ?? "",
      },
      { skip: !user?.school_id?.trim() || !my_class?.trim() },
    );

  const my_class_details = useMemo(() => {
    if (!assigned_class_data) return;
    if (assigned_class_data.data.subjects.length > 0) {
      const courses: Course[] = assigned_class_data.data.subjects.map(
        (prev) => ({
          courseCode: prev.code,
          courseName: prev.name,
          teacher: assigned_class_data.data.teachers[0].full_name,
          currentUnit: prev.credit_units,
          status: prev.status,
          courseId: prev.id,
          resources: prev.resources.map((item) => ({
            name: item.name,
            format: item.format,
            link: item.file_link,
          })),
        }),
      );
      setMyCourses(courses);
    }
    return assigned_class_data?.data;
  }, [assigned_class_data]);

  const isLoading = isFetchingClass || isFetchingStudent;

  return (
    <div className="space-y-4">
      {/* Page Title and Description */}
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Courses</h1>
        <p className="text-gray-600">
          This screen displays all courses the student is currently enrolled in,
          providing direct access to lesson content, resources, and progress
          tracking.
        </p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Enrolled Subjects"
          value={my_class_details ? `${my_class_details?.subjects?.length} Subject(s)` : "..."}
          trend="up"
        />
        <MetricCard title="Average Course Progress" value="..." trend="up" />
        <MetricCard title="Total New Resources" value="..." trend="up" />
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="text-center p-8 text-gray-500">Loading courses...</div>
      ) : my_class_details?.subjects?.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No subjects found for your class.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              courseCode={course.courseCode}
              courseName={course.courseName}
              teacher={course.teacher}
              currentUnit={course.currentUnit.toString()}
              latestActivity="No recent activity"
              courseId={course.courseId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
