"use client";
import { useState } from "react";
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

export default function ParentSettingsPage() {
  //view state handler
  const [currentStep, setCurrentStep] = useState<StepId>("personal-profile");
  const [modalStepsId, setModalStepsId] =
    useState<ModalStepId>("verify-password");
  const [openModal, setOpenModal] = useState<boolean>(false);

  //view change handler
  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId as StepId);
  };

  const renderContent = () => {
    switch (currentStep) {
      case "personal-profile":
        return <PersonalProfileViews />;
      case "financial-wallet-security":
        return <FinancialWalletSecurity setOpenModal={setOpenModal} />;
      case "notification-preferences":
        return <NotificationPreferences />;
      default:
        return <PersonalProfileViews />;
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
