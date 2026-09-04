"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useGetSchoolsQuery } from "@/services/schools/schools";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicantDetailsState } from "./admission-form-state";
import DatePickerIcon from "@/components/ui/date-picker";
import { School } from "@/services/schools/schools-type";
import { selectClasses } from "@/store/slices/schoolSlice";
import {
  useGetStakeholdersQuery,
  useGetStudentByQueryParamQuery,
} from "@/services/stakeholders/stakeholders";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";

export function ApplicantDetailsForm({
  value,
  onChange,
  onNext,
  onCancel,
}: {
  value: ApplicantDetailsState;
  onChange: (next: ApplicantDetailsState) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const user = useAppSelector(selectUser);
  const formData = value;
  const setFormData = onChange;
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetSchoolsQuery();
  const { data: stakeholder } = useGetStudentByQueryParamQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  console.log("This Stakeholder: ", stakeholder?.data);

  const schools = schoolsData?.data || [];
  console.log("form data", formData); //START FROM HERE TOMORROW
  const dateValue = formData.date ? new Date(formData.date) : undefined;
  const setDateValue = (d: React.SetStateAction<Date | undefined>) => {
    const next = typeof d === "function" ? d(dateValue) : d;
    setFormData({ ...formData, date: next ? format(next, "yyyy-MM-dd") : "" });
  };

  const selectedSch = useMemo(() => {
    if (!formData.schoolId) return;
    const chosen_sch = schools.filter((sch) => sch.id === formData.schoolId)[0];
    return chosen_sch;
  }, [formData]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Applicant & Parent/Guardian Details
      </h2>

      <div className="space-y-6">
        {/* School Selector */}
        <SelectField
          label="School"
          placeholder={
            isLoadingSchools ? "Loading schools..." : "Select a school"
          }
          value={formData.schoolId}
          onValueChange={(value) =>
            setFormData({ ...formData, schoolId: value })
          }
          required
        >
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              {school.name}
            </SelectItem>
          ))}
        </SelectField>

        <div className="flex flex-row gap-2">
          <InputField
            id="firstName"
            label="First Name"
            placeholder="E.g., Aisha"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />

          <InputField
            id="lastName"
            label="Last Name"
            placeholder="E.g., Bello"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>

        <DatePickerIcon
          label="Date of birth"
          date={dateValue}
          setDate={setDateValue}
          placeholder="mm/dd/yyyy"
          open={datePickerOpen}
          setOpen={setDatePickerOpen}
        />

        <div className="space-y-2">
          <Label>Gender</Label>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="male"
                checked={formData.gender.male}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    gender: {
                      ...formData.gender,
                      male: checked === true,
                      female: checked === true ? false : formData.gender.female,
                    },
                  })
                }
              />
              <Label htmlFor="male" className="font-normal cursor-pointer">
                Male
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="female"
                checked={formData.gender.female}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    gender: {
                      ...formData.gender,
                      female: checked === true,
                      male: checked === true ? false : formData.gender.male,
                    },
                  })
                }
              />
              <Label htmlFor="female" className="font-normal cursor-pointer">
                Female
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grade/Class Applying For</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) =>
              setFormData({ ...formData, grade: value })
            }
          >
            <SelectTrigger id="grade" className="w-full">
              <SelectValue placeholder="Select class you are applying for" />
            </SelectTrigger>
            <SelectContent>
              {selectedSch?.classes.map((cls, index) => {
                return (
                  <SelectItem key={index} value={cls}>
                    {cls}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="phoneNumber"
          label="Primary Phone Number"
          placeholder="E.g., +23412347890"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />

        <InputField
          id="email"
          label="Email Address"
          type="email"
          placeholder="E.g., aisha.bello@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onNext}
          className="w-60 bg-main-blue hover:bg-main-blue/90"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
