"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentTable } from "@/components/dashboard-pages/admin/students/components/student-table";

import { useGetAllStudentsQuery } from "@/services/stakeholders/stakeholders";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import FilterStudents from "@/components/dashboard-pages/admin/students/modals/FilterStudents";

export default function AllStudentsPage() {
  const { data: studentsData, isLoading: isAllStudentsLoading } =
    useGetAllStudentsQuery();
  const [filterModal, setFilterModal] = useState<boolean>(false);
  // Filter to only show enrolled students (stage=6)
  const enrolledStudents = useMemo(() => {
    if (!studentsData?.data) return [];
    return studentsData.data.filter(
      (student: Stakeholders) => student.stage === 6,
    );
  }, [studentsData]);

  const filteredStudentsData = useMemo(() => {
    if (!studentsData) return undefined;
    return {
      ...studentsData,
      // data: enrolledStudents, //uncomment this for later stage
      data: studentsData.data,
    };
  }, [studentsData]);

  // const totalStudents = enrolledStudents.length;

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md mb-6 p-6">
        <h2 className="text-2xl font-bold text-gray-800">All Students List</h2>
        <p className="text-gray-600 mt-1">
          Manage Student Records (IEP, Grades, Class Assignment).
        </p>
      </div>

      <div className="bg-background rounded-md p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-1 bg-orange-500 rounded"></div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Total Students:{" "}
              {isAllStudentsLoading ? "Loading..." : studentsData?.data.length}
            </h3>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">All Classes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isAllStudentsLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading students...
            </div>
          ) : (
            <StudentTable
              setFilterModal={setFilterModal}
              studentsData={filteredStudentsData}
              isLoading={isAllStudentsLoading}
            />
          )}
        </CardContent>
      </Card>
      {/* refund auth modal */}
      {filterModal && (
        <FilterStudents open={filterModal} onOpenChange={setFilterModal} />
      )}
    </div>
  );
}
