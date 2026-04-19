"use client";

import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { CourseCard } from "@/components/dashboard-pages/student/my-courses/course-card";

export default function MyCoursesPage() {
  const user = useAppSelector(selectUser);

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
          title="Total Enrolled Courses"
          value={`${0} ${1 === 1 ? "Subject" : "Subjects"}`}
          trend="up"
        />
        <MetricCard title="Average Course Progress" value="N/A" trend="up" />
        <MetricCard title="Total New Resources" value="N/A" trend="up" />
      </div>

      {/* Course Cards Grid */}
      {false ? (
        <div className="text-center p-8 text-gray-500">Loading courses...</div>
      ) : [].length === 0 ? (
        <div className="text-center p-8 text-gray-500">No courses found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* {courses.map((course) => (
            <CourseCard
              key={course.id}
              courseCode={course.code || course.id}
              courseName={course.name || course.title || "Unnamed Course"}
              teacher={course.teacherName || course.instructor || "N/A"}
              currentUnit={course.currentUnit || "N/A"}
              latestActivity={course.description || "No recent activity"}
              courseId={course.id}
            />
          ))} */}
        </div>
      )}
    </div>
  );
}
