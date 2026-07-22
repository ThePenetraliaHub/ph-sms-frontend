"use client";

import { useState } from "react";
import { format } from "date-fns";
import { InputField } from "@/components/ui/input-field";
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
import DatePickerIcon from "@/components/ui/date-picker";
import type { StudentPersonalState } from "./student-edit-form-state";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";

export function PersonalInfoForm({
  value,
  onChange,
  onNext,
  onCancel,
}: {
  value: StudentPersonalState;
  onChange: (next: StudentPersonalState) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const user = useAppSelector(selectUser);
  const SCH_CLASSES: string[] = user?.school.classes || [];
  const formData = value;
  const setFormData = onChange;
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const dateValue = formData.date ? new Date(formData.date) : undefined;
  const setDateValue = (d: React.SetStateAction<Date | undefined>) => {
    const next = typeof d === "function" ? d(dateValue) : d;
    setFormData({ ...formData, date: next ? format(next, "yyyy-MM-dd") : "" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Personal & Parent Details
      </h2>

      <div className="space-y-6">
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
          label="Date of Birth"
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
          <Label htmlFor="grade">Current Class</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) =>
              setFormData({ ...formData, grade: value })
            }
          >
            <SelectTrigger id="grade" className="w-full">
              <SelectValue placeholder="Select current class" />
            </SelectTrigger>
            <SelectContent>
              {SCH_CLASSES.map((clx, index) => {
                return (
                  <SelectItem key={index} value={clx}>
                    {clx}
                  </SelectItem>
                );
              })}
              {/* <SelectItem value="js2">Junior Secondary 2 (JS2)</SelectItem>
              <SelectItem value="js3">Junior Secondary 3 (JS3)</SelectItem>
              <SelectItem value="ss1">Senior Secondary 1 (SS1)</SelectItem>
              <SelectItem value="ss2">Senior Secondary 2 (SS2)</SelectItem>
              <SelectItem value="ss3">Senior Secondary 3 (SS3)</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="parentName"
          label="Parent Name"
          placeholder="E.g., Bello Aisha Fatimah"
          value={formData.parentName}
          onChange={(e) =>
            setFormData({ ...formData, parentName: e.target.value })
          }
        />

        <InputField
          id="parentEmail"
          label="Parent Email"
          type="email"
          placeholder="E.g., parent@example.com"
          value={formData.parentEmail}
          onChange={(e) =>
            setFormData({ ...formData, parentEmail: e.target.value })
          }
        />

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
