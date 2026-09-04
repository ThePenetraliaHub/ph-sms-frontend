"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  useGetStakeholderByIdQuery,
  useUpdateStakeholderMutation,
} from "@/services/stakeholders/stakeholders";
import { UpdateStakeholdersRequest } from "@/services/stakeholders/stakeholder-types";
import { UpdateUserRequest } from "@/services/users/users-type";
import { useUpdateUserMutation } from "@/services/users/users";
import { toast } from "sonner";
import { useGetSchoolByIdQuery } from "@/services/schools/schools";
import { EditGuardianStepNavigation } from "@/components/dashboard-pages/admin/guardians/edit/edit-guardian-step-navigation";
import EditGuardianUserDetails from "@/components/dashboard-pages/admin/guardians/edit/edit-guardian-user-details";
import EditGuardianSkDetails from "@/components/dashboard-pages/admin/guardians/edit/edit-guardian-sk-details";

const STEPS = ["details", "information"] as const;
type StepId = (typeof STEPS)[number];

export type Guardian = {
  //user keys
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  status: string;
  email: string;
  gender: "male" | "female";
  phone_number: string;
  residential_address: string;
  username: string;
  //stakeholder keys
  admin_notes: string;
  primary_contact: string;
  date_joined: string;
  occupation: string;
  emergency_contact: string;
};

const INITIAL_DATA: Guardian = {
  //user keys
  first_name: "",
  middle_name: "",
  last_name: "",
  full_name: "",
  status: "active",
  email: "",
  gender: "male",
  phone_number: "",
  residential_address: "",
  username: "",
  //stakeholder keys
  admin_notes: "",
  primary_contact: "",
  date_joined: "",
  occupation: "",
  emergency_contact: "",
};

export default function AddApplicantPage() {
  const { replace } = useRouter();
  const params = useParams<{ id: string }>();
  const parentId = params.id;
  const user = useAppSelector(selectUser);
  const [step, setStep] = useState<StepId>("details");
  const [guardian, setGuardian] = useState<Guardian>(INITIAL_DATA);

  //fetch stakeholder's data
  const {
    data: stakeholder,
    isLoading,
    isError,
  } = useGetStakeholderByIdQuery(parentId, { skip: !parentId });

  const parent = stakeholder?.data;

  const [updateStakeholder, { isLoading: isUpdatingSk }] =
    useUpdateStakeholderMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const { data: school_data, isLoading: isFetchingSchool } =
    useGetSchoolByIdQuery(user?.school_id ?? "", { skip: !user?.school_id });

  const school: string = useMemo(() => {
    if (isFetchingSchool) return "Loading...";
    if (!school_data) return "N/A";
    return school_data.data.name;
  }, [school_data]);

  const updateGuardianUserDetails = async () => {
    const {
      username,
      first_name,
      last_name,
      middle_name,
      gender,
      email,
      status,
      phone_number,
      residential_address,
    } = guardian;
    if (!first_name.trim() || !last_name.trim() || !phone_number.trim())
      return toast.error("Invalid form details");
    if (!parent?.user.id) return toast.error("Unable to identify person");
    const payload: Partial<UpdateUserRequest> = {
      username,
      first_name,
      last_name,
      middle_name,
      gender,
      email,
      status,
      phone_number,
      residential_address,
    };
    try {
      const res = await updateUser({
        id: parent?.user.id,
        data: payload,
      }).unwrap();
      toast.success(
        res.message ? res.message : "Guardian updated successfully",
      );
      if (res.status) replace("/admin/guardians");
    } catch {}
  };

  const updateGuardianSkDetails = async () => {
    if (!user?.school_id) return toast.error("School Missing!");
    const {
      date_joined,
      primary_contact,
      status,
      admin_notes,
      occupation,
      emergency_contact,
    } = guardian;
    const payload: UpdateStakeholdersRequest = {
      status: status as "active" | "inactive" | "suspended",
      //   primary_contact, //uncomment after issues has been resolved
      date_joined,
      occupation,
      //   emergency_contact, uncomment after issue has been resolved
      admin_notes,
      type: "parent",
    };
    try {
      const res = await updateStakeholder({
        id: parentId,
        data: payload,
      }).unwrap();
      toast.success(
        res.message ? res.message : "Guardian updated successfully",
      );
      if (res.status) replace("/admin/guardians");
    } catch {}
  };

  useEffect(() => {
    if (!parent) return;
    setGuardian({
      //user keys
      first_name: parent.user.first_name,
      middle_name: parent.user.middle_name ?? "",
      last_name: parent.user.last_name,
      full_name: parent.full_name ?? "",
      status: parent.status || parent.user.status,
      email: parent.user.email,
      gender: parent.user.gender as "male" | "female",
      phone_number: parent.user.phone_number ?? "",
      residential_address: parent.user.residential_address ?? "",
      username: parent.user.username,
      //stakeholder keys
      admin_notes: parent.admin_notes ?? "",
      primary_contact: parent.primary_contact ?? "",
      date_joined: parent.date_joined,
      occupation: parent.occupation ?? "",
      emergency_contact: parent.emergency_contact ?? "",
    });
  }, [parent]);

  if (!parentId) {
    return replace("/admin/guardians");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading guardian data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error: Failed to fetch data.</div>
        </div>
      </div>
    );
  }

  if (parent?.type !== "parent") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">
            This is not a registered guardian
          </div>
          <div className="text-gray-500 text-sm">Type: {parent?.type}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Edit Guardian Details
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <EditGuardianStepNavigation
                activeStep={step}
                onStepChange={(s) => setStep(s)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-0 bg-background">
            <CardContent className="p-6">
              {step === "details" && (
                <EditGuardianUserDetails
                  guardian={guardian}
                  setGuardian={setGuardian}
                  onSubmit={updateGuardianUserDetails}
                  isLoading={isUpdatingUser}
                  school_name={school}
                />
              )}
              {step === "information" && (
                <EditGuardianSkDetails
                  guardian={guardian}
                  setGuardian={setGuardian}
                  onSubmit={updateGuardianSkDetails}
                  isLoading={isUpdatingSk}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
