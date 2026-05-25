"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/general/huge-icon";
import {
  UserIcon,
  TransactionHistoryIcon,
  DocumentValidationIcon,
  GraduateMaleIcon,
} from "@hugeicons/core-free-icons";

// type StepId = "details" | "academic" | "documents" | "status";
type StepId = "details" | "academic" | "status";

interface Step {
  id: StepId;
  label: string;
  icon: any;
}

const steps: Step[] = [
  { id: "details", label: "Applicant & Parent Details", icon: UserIcon },
  { id: "academic", label: "Academic Details", icon: GraduateMaleIcon },
  // { id: "documents", label: "Document Upload", icon: TransactionHistoryIcon },
  { id: "status", label: "Application Status", icon: DocumentValidationIcon },
];

interface StepNavigationProps {
  activeStep: StepId;
  onStepChange?: (step: StepId) => void;
}

export function StepNavigation({
  activeStep,
  onStepChange,
}: StepNavigationProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        return (
          <div
            key={step.id}
            onClick={() => onStepChange?.(step.id)}
            className={cn(
              "cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-main-blue/5 text-main-blue"
                : "text-gray-600 hover:bg-main-blue/5 hover:text-main-blue",
            )}
          >
            <Icon icon={step.icon} size={20} />
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
