"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import GuardianDetails from "@/components/dashboard-pages/admin/guardians/guardian-details";
import { AddGuardianStepNavigation } from "@/components/dashboard-pages/admin/guardians/add-guardian-step-navigation";
import { CreateUserRequest } from "@/services/users/users-type";
import { useCreateUserMutation } from "@/services/users/users";
import { toast } from "sonner";
import { useGetSchoolByIdQuery } from "@/services/schools/schools";

const STEPS = ["details", "status"] as const;
type StepId = (typeof STEPS)[number];

export type Guardian = {
  first_name: string; 
  middle_name: string; 
  last_name: string; 
  date_joined: string; 
  primary_contact: string; 
  full_name: string; 
  status: string; 
  email: string; 
  gender: "male" | "female";
  phone_number: string; 
  residential_address: string; 
  role: "parent"; 
  username: string;
};

const INITIAL_DATA: Guardian = {
  first_name: "",
  middle_name: "",
  last_name: "",
  date_joined: "",
  primary_contact: "",
  full_name: "",
  status: "active",
  email: "",
  gender: "male",
  phone_number: "",
  residential_address: "",
  role: "parent",
  username: "",
};

export default function AddApplicantPage() {
  const { replace } = useRouter();
  const user = useAppSelector(selectUser);
  const [step, setStep] = useState<StepId>("details");
  const [newGuardian, setNewGuardian] = useState<Guardian>(INITIAL_DATA);

  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const { data: school_data, isLoading: isFetchingSchool } =
    useGetSchoolByIdQuery(user?.school_id ?? "", { skip: !user?.school_id });

  const school: string = useMemo(() => {
    if (isFetchingSchool) return "Loading...";
    if (!school_data) return "N/A";
    return school_data.data.name;
  }, [school_data]);

  const saveGuardianUserDetails = async () => {
    const {
      username,
      first_name,
      last_name,
      middle_name,
      gender,
      email,
      role,
      status,
      phone_number,
      residential_address,
    } = newGuardian;
    if (!first_name.trim() || !last_name.trim() || !phone_number.trim())
      return toast.error("Invalid form details");
    if (!user?.school_id) return toast.error("School missing!");
    const payload: CreateUserRequest = {
      school_id: user?.school_id ?? "",
      username,
      first_name,
      last_name,
      middle_name,
      gender,
      email,
      password: "password123",
      role,
      status,
      phone_number,
      residential_address,
      theme: "light",
      permissions: ["write"],
    };
    try {
      const res = await createUser(payload).unwrap();
      toast.success(res.message ? res.message : "Parent created successfully");
      setNewGuardian(INITIAL_DATA);
      replace("/admin/guardians");
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Add Guardian Manually
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <AddGuardianStepNavigation
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
                <GuardianDetails
                  setStep={setStep}
                  guardian={newGuardian}
                  setGuardian={setNewGuardian}
                  onSubmit={saveGuardianUserDetails}
                  isLoading={isCreatingUser}
                  school_name={school}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
