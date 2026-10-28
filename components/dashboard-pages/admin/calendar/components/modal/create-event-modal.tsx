"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DatePickerIcon from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/time-picker";
import { useGetSchoolsQuery } from "@/services/schools/schools";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (eventData: EventFormData) => void;
  selectedDate?: Date;
  defaultSchoolId?: string;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
}

export interface EventFormData {
  schoolId: string;
  title: string;
  description: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  location: string;
  audienceVisibility: "general" | "private";
  specifics: {
    teacher: boolean;
    student: boolean;
    parent: boolean;
    staff: boolean;
  };
  sendNotification: boolean;
}

const initialFormData: Omit<EventFormData, "schoolId"> & { schoolId: string } =
  {
    schoolId: "",
    title: "",
    description: "",
    date: undefined,
    startTime: "",
    endTime: "",
    location: "",
    audienceVisibility: "general",
    specifics: { teacher: false, student: false, parent: false, staff: false },
    sendNotification: false,
  };

export function CreateEventModal({
  open,
  onOpenChange,
  onSubmit,
  defaultSchoolId,
  selectedDate,
  setSelectedDate,
}: CreateEventModalProps) {
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);
  const [formData, setFormData] = useState<EventFormData>({
    ...initialFormData,
    schoolId: defaultSchoolId ?? "",
  });
  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetSchoolsQuery();
  const schools = schoolsData?.data ?? [];

  useEffect(() => {
    if (open && defaultSchoolId) {
      setFormData((prev) =>
        prev.schoolId ? prev : { ...prev, schoolId: defaultSchoolId },
      );
    }
  }, [open, defaultSchoolId]);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
    setFormData({
      ...initialFormData,
      schoolId: defaultSchoolId ?? "",
    });
    setOpenDatePicker(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedDate(undefined);
    setFormData({
      ...initialFormData,
      schoolId: defaultSchoolId ?? "",
    });
    setOpenDatePicker(false);
    onOpenChange(false);
  };

  const handleAudienceChange = (value: "general" | "private") => {
    setFormData((prev) => ({
      ...prev,
      audienceVisibility: value,
    }));
  };

  const handleSpecificsChange = (
    key: "teacher" | "student" | "parent" | "staff",
  ) => {
    setFormData((prev) => ({
      ...prev,
      specifics: {
        ...prev.specifics,
        [key]: !prev.specifics[key],
      },
    }));
  };

  // handling date
  const handleDateChange: Dispatch<SetStateAction<Date | undefined>> = (
    date,
  ) => {
    setFormData((prev) => ({
      ...prev,
      date: typeof date === "function" ? date(prev.date) : date,
    }));
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleCancel}
      title="Create New School Event"
      size="5xl"
      maxHeight="90vh"
    >
      <div className="space-y-6 py-4">
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

        <InputField
          id="event-title"
          label="Event Title"
          placeholder="E.g., Q4 Budget Review Meeting, Annual Science Fair"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <TextareaField
          id="description"
          label="Description"
          placeholder="Briefly describe the event purpose and key agenda points."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
        />

        <div className="grid grid-cols-3 gap-2">
          <DatePickerIcon
            label="Date"
            open={openDatePicker}
            setOpen={setOpenDatePicker}
            date={selectedDate ? selectedDate : formData.date}
            setDate={handleDateChange}
          />

          <TimePicker
            label="Start Time"
            time={formData.startTime}
            setTime={(value) =>
              setFormData((prev) => ({
                ...prev,
                startTime:
                  typeof value === "function" ? value(prev.startTime) : value,
              }))
            }
            id="start-time"
          />

          <TimePicker
            label="End Time"
            time={formData.endTime}
            setTime={(value) =>
              setFormData((prev) => ({
                ...prev,
                endTime:
                  typeof value === "function" ? value(prev.endTime) : value,
              }))
            }
            id="end-time"
          />
        </div>

        <InputField
          id="location"
          label="Location"
          placeholder="E.g., Main Assembly Hall, Board Room (or Text Input: External Venue Address)"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Audience Visibility
          </Label>
          <div className="flex flex-row gap-6">
            <CheckboxField
              id="general-announcement"
              label="General announcement"
              checked={formData.audienceVisibility === "general"}
              onCheckedChange={() => handleAudienceChange("general")}
            />
            <CheckboxField
              id="private"
              label="Private"
              checked={formData.audienceVisibility === "private"}
              onCheckedChange={() => handleAudienceChange("private")}
            />
          </div>
          {formData.audienceVisibility === "private" && (
            <div className="ml-6 mt-3 space-y-2 border-l-2 border-gray-200 pl-4">
              <Label className="text-xs font-medium text-gray-600">
                Visible to:
              </Label>
              <div className="flex flex-wrap gap-4">
                <CheckboxField
                  id="specifics-teacher"
                  label="Teacher"
                  checked={formData.specifics.teacher}
                  onCheckedChange={() => handleSpecificsChange("teacher")}
                />
                <CheckboxField
                  id="specifics-student"
                  label="Student"
                  checked={formData.specifics.student}
                  onCheckedChange={() => handleSpecificsChange("student")}
                />
                <CheckboxField
                  id="specifics-parent"
                  label="Parent"
                  checked={formData.specifics.parent}
                  onCheckedChange={() => handleSpecificsChange("parent")}
                />
                <CheckboxField
                  id="specifics-staff"
                  label="Non-teaching staff"
                  checked={formData.specifics.staff}
                  onCheckedChange={() => handleSpecificsChange("staff")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Send Notification
          </Label>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600 flex-1">
              Send notification (Email/SMS) 24 hours prior
            </p>
            <Checkbox
              id="send-notification"
              checked={formData.sendNotification}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  sendNotification: checked as boolean,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="">
          Create Event
        </Button>
      </div>
    </ModalContainer>
  );
}
