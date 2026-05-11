/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import {
  Profile02Icon,
  Notification01FreeIcons,
  SecurityLockFreeIcons,
} from "@hugeicons/core-free-icons";
import PersonalProfileViews from "@/components/dashboard-pages/parent/settings/views/personal-profile-views";
import FinancialWalletSecurity from "@/components/dashboard-pages/parent/settings/views/financial-wallet-verification";
import NotificationPreferences from "@/components/dashboard-pages/parent/settings/views/notification-preferences";
import { Card, CardContent } from "@/components/ui/card";
import { Step, StepNavigation } from "@/components/ui/step-navigation";
import PasswordChange from "@/components/general/shared-modals/password-change";
import { toast } from "sonner";
import { selectUser } from "@/store/slices/authSlice";
import { useAppSelector } from "@/store/hooks";
import { useUpdateUserMutation } from "@/services/users/users";
import { useCreateAttachmentMutation } from "@/services/attachment/attachment";
import { useGetStudentByQueryParamQuery } from "@/services/stakeholders/stakeholders";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";

type StepId =
  | "personal-profile"
  | "financial-wallet-security"
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
    id: "financial-wallet-security",
    label: "Financial & Wallet Security",
    icon: SecurityLockFreeIcons,
  },
  {
    id: "notification-preferences",
    label: "Notification Preferences",
    icon: Notification01FreeIcons,
  },
];

export interface UploadedImageDetails {
  profile_image_url: string | null;
  profile_image_public_id: string | null;
}

export default function ParentSettingsPage() {
  //view state handler
  const [currentStep, setCurrentStep] = useState<StepId>("personal-profile");
  const user = useAppSelector(selectUser);
  const [modalStepsId, setModalStepsId] =
    useState<ModalStepId>("verify-password");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgDetails, setImgDetails] = useState<UploadedImageDetails>({
    profile_image_public_id: null,
    profile_image_url: null,
  });
  const [updateUser, { isLoading: isUpdatingImg }] = useUpdateUserMutation();
  const [createAttachment, { isLoading }] = useCreateAttachmentMutation();
  const { data: currParent, isLoading: isFetchingCurrParent } =
    useGetStudentByQueryParamQuery(user?.id ?? "");
  const parent: Stakeholders | undefined = currParent?.data[0];
  //view change handler
  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId as StepId);
  };

  //handle img update
  const updateUserImage = async () => {
    if (!imgDetails.profile_image_url || !imgDetails.profile_image_public_id)
      return toast.error("Image update failed");
    try {
      const res = await updateUser({
        id: user?.id ?? "",
        data: {
          profile_image_url: imgDetails.profile_image_url,
          profile_image_public_id: imgDetails.profile_image_public_id,
        },
      }).unwrap();
      toast.success(
        res.message ? res.message : "Profile image updated successfully",
      );
    } catch {}
  };

  //handle upload
  const handleUpload = async () => {
    if (!user) return;
    if (!selectedFile) return;
    const formData = new FormData();

    formData.append("file", selectedFile as Blob);
    formData.append("school_id", `${user?.school_id}`);
    formData.append("type", "others");
    formData.append("name", "profie_image_url");
    try {
      const res = await createAttachment(formData).unwrap();
      if (res.data.file && res.data.id)
        setImgDetails({
          profile_image_url: res.data.file,
          profile_image_public_id: res.data.id,
        });
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
  }, [selectedFile]);

  useEffect(() => {
    if (!imgDetails.profile_image_url) return;
    updateUserImage();
  }, [imgDetails.profile_image_url]);

  const renderContent = () => {
    switch (currentStep) {
      case "personal-profile":
        return (
          <PersonalProfileViews
            user={user}
            loading={isLoading}
            uploadImg={uploadImg}
            parent={parent}
            isLoading={isUpdatingImg}
          />
        );
      case "financial-wallet-security":
        return <FinancialWalletSecurity setOpenModal={setOpenModal} />;
      case "notification-preferences":
        return <NotificationPreferences />;
      default:
        return (
          <PersonalProfileViews
            user={user}
            loading={isLoading}
            uploadImg={uploadImg}
            parent={parent}
            isLoading={isFetchingCurrParent}
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
            This screen manages the parents digital identity.
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
