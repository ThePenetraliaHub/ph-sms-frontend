"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/input-field";
import DatePickerIcon from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { AcademicCalendarConfig, Term } from "@/services/schools/schools-type";
import { useUpdateSchoolMutation } from "@/services/schools/schools";
import { toast } from "sonner";
import {
  TermDate,
  TermSemesterConfigModal,
} from "./term-semester-config-modal";

export interface AcademicCalendarValues {
  academicYearName: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  numberOfTerms: string;
  holidayDate: Date | undefined;
}

export interface AcademicCalendarFormRef {
  getValues: () => AcademicCalendarValues;
}

interface AcademicCalendarFormProps {
  initialValues: AcademicCalendarConfig;
  schoolId: string;
  academicSession: string;
  handleBack: () => void;
}

export const AcademicCalendarForm = ({
  initialValues,
  schoolId,
  academicSession,
  handleBack,
}: AcademicCalendarFormProps) => {
  const [academicYearName, setAcademicYearName] = useState(
    initialValues?.name ?? "",
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    initialValues?.start_date ? new Date(initialValues.start_date) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    initialValues?.end_date ? new Date(initialValues.end_date) : undefined,
  );
  const [numberOfTerms, setNumberOfTerms] = useState<string | number>(
    initialValues?.no_of_terms ?? 0,
  );
  const [holidayDate, setHolidayDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [holidayDateOpen, setHolidayDateOpen] = useState(false);
  const [termModalOpen, setTermModalOpen] = useState(false);
  const noOfTerms: number = 3;

  const [updateSchool, { isLoading: isUpdatingSchool }] =
    useUpdateSchoolMutation();

  const updateSchoolAcademicConfig = async () => {
    if (isNaN(Number(numberOfTerms))) {
      toast.error(
        "Please enter a valid number for 'Number of Terms/Semesters'",
      );
      return;
    }
    const academic_data_config = {
      end_date: endDate ? endDate.toISOString().split("T")[0] : "",
      start_date: startDate ? startDate.toISOString().split("T")[0] : "",
      name: academicYearName,
      no_of_terms: Number(numberOfTerms) ?? null,
    };

    try {
      const res = await updateSchool({
        id: schoolId,
        data: { academic_calendar_config: academic_data_config },
      }).unwrap();
      toast.success(
        res.message
          ? res.message
          : "Academic calendar configuration updated successfully!",
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleTermSet = async (terms: TermDate[]) => {
    const filterTerm = terms.filter((term) => term.startDate && term.endDate);
    if (filterTerm.length !== terms.length) {
      toast.error("Please ensure all terms have both start and end dates set.");
      return;
    }
    const modifiedTermArr: Term[] = filterTerm.map((term) => {
      return {
        name: `Term ${filterTerm.indexOf(term) + 1}`,
        session: academicSession,
        start_date: term.startDate
          ? term.startDate.toISOString().split("T")[0]
          : "",
        end_date: term.endDate ? term.endDate.toISOString().split("T")[0] : "",
      };
    });
    console.log(modifiedTermArr);
    try {
      const res = await updateSchool({
        id: schoolId,
        data: { term: modifiedTermArr[0] },
      }).unwrap();
      console.log(res);
      toast.success(
        res.message ? res.message : "Academic terms updated successfully!",
      );
      setTermModalOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center w-full justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Academic Calendar Configuration
        </h3>
        <Button variant="outline" onClick={() => setTermModalOpen(true)}>
          Set Terms
        </Button>
      </div>

      <div className="space-y-6">
        <InputField
          label="Academic Year Name"
          value={academicYearName}
          onChange={(e) => setAcademicYearName(e.target.value)}
          placeholder="placeholder"
        />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">
            School Year Date
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerIcon
              label="Start Date"
              date={startDate}
              setDate={(date) => {
                setStartDate(
                  typeof date === "function" ? date(startDate) : date,
                );
              }}
              open={startDateOpen}
              setOpen={setStartDateOpen}
              placeholder="mm/dd/yy"
            />
            <DatePickerIcon
              label="End Date"
              date={endDate}
              setDate={(date) => {
                setEndDate(typeof date === "function" ? date(endDate) : date);
              }}
              open={endDateOpen}
              setOpen={setEndDateOpen}
              placeholder="mm/dd/yy"
            />
          </div>
        </div>

        <InputField
          label="Number of Terms/Semesters"
          type="number"
          value={numberOfTerms}
          onChange={(e) => setNumberOfTerms(e.target.value)}
          placeholder="Placeholder"
        />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">
            Define Holidays
          </h4>
          <div className="flex gap-4">
            <div className="flex-1">
              <DatePickerIcon
                label=""
                date={holidayDate}
                setDate={(date) => {
                  setHolidayDate(
                    typeof date === "function" ? date(holidayDate) : date,
                  );
                }}
                open={holidayDateOpen}
                setOpen={setHolidayDateOpen}
                placeholder="mm/dd/yy"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline">Add Holiday/Break</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {/* handleBack */}
          <Button onClick={handleBack} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={isUpdatingSchool}
            className={`w-60 ${isUpdatingSchool ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"}`}
            onClick={updateSchoolAcademicConfig}
          >
            Save & Publish Calendar
          </Button>
        </div>
      </div>

      {/* set terms date modal */}
      <TermSemesterConfigModal
        open={termModalOpen}
        isUpdating={isUpdatingSchool}
        onOpenChange={setTermModalOpen}
        numberOfTerms={noOfTerms}
        onConfirm={(terms) => {
          handleTermSet(terms);
        }}
      />
    </div>
  );
};
