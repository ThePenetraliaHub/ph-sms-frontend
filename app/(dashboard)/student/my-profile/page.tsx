"use client";

import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  Profile02Icon,
  Notification01FreeIcons,
  SecurityLockFreeIcons,
} from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import NotificationPreferences from "@/components/dashboard-pages/student/settings/views/NotificationPreferences";
import PersonalProfileViews from "@/components/dashboard-pages/student/settings/views/PersonalProfileViews";
import { Card, CardContent } from "@/components/ui/card";
import { Step, StepNavigation } from "@/components/ui/step-navigation";
import SecurityAccess from "@/components/dashboard-pages/student/settings/views/SecurityAccess";
import PasswordChange from "@/components/general/shared-modals/password-change";
import { toast } from "sonner";
import { useCreateAttachmentMutation } from "@/services/attachment/attachment";

type StepId =
  | "personal-profile"
  | "security-access"
  | "notification-preferences";

export type ModalStepId = "verify-password" | "change-password";

export type PasswordHandler = {
  oldPass: string;
  newPass: string;
  confirmPass: string;
};

const steps: Step[] = [
  {
    id: "personal-profile",
    label: "Personal Profile",
    icon: Profile02Icon,
  },
  {
    id: "security-access",
    label: "Security & Access",
    icon: SecurityLockFreeIcons,
  },
  {
    id: "notification-preferences",
    label: "Notification Preferences",
    icon: Notification01FreeIcons,
  },
];

export default function MyProfilePage() {
  //view state handler
  const [createAttachment, { isLoading }] = useCreateAttachmentMutation();
  const user = useAppSelector(selectUser);
  const [currentStep, setCurrentStep] = useState<StepId>("personal-profile");
  const [modalStepsId, setModalStepsId] =
    useState<ModalStepId>("verify-password");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  //view change handler
  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId as StepId);
  };

  //handle upload
  const handleUpload = async () => {
    const formData = new FormData();

    formData.append("file", selectedFile as Blob);
    formData.append("type", "image");

    try {
      const res = await createAttachment(formData).unwrap();
      console.log(res);
    } catch {
      //base api catches error
    }
  };

  //get image from device
  const uploadImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeded.");
      e.target.value = ""; // reset input
      return;
    }
    setSelectedFile(file);
    e.target.value = ""; //reset input
  };

  useEffect(() => {
    if (!selectedFile) return;
    handleUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  const renderContent = () => {
    switch (currentStep) {
      case "personal-profile":
        return (
          <PersonalProfileViews
            user={user}
            loading={isLoading}
            uploadImg={uploadImg}
          />
        );
      case "security-access":
        return <SecurityAccess setOpenModal={setOpenModal} />;
      case "notification-preferences":
        return <NotificationPreferences />;
      default:
        return (
          <PersonalProfileViews
            user={user}
            loading={isLoading}
            uploadImg={uploadImg}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-6 py-3">
          <h1 className="text-2xl font-semibold text-[#1B1B1B] mb-2 lg:text-3xl">
            System Settings
          </h1>
          <p className="text-sm text-gray-600">
            This screen manages the student&#39;s identity.
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="px-2 xl:sticky">
              <StepNavigation
                steps={steps}
                activeStep={currentStep}
                onStepChange={handleStepChange}
                orientation="vertical"
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="px-6">{renderContent()}</CardContent>
          </Card>
        </div>
      </div>
      {/* modal */}
      <PasswordChange
        modalStepsId={modalStepsId}
        setModalStepsId={setModalStepsId}
        open={openModal}
        onOpenChange={setOpenModal}
      />
    </div>
  );
}
