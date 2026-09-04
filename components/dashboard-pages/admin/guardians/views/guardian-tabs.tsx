"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/general/huge-icon";
import {
  User03Icon,
  Calendar01Icon,
  DocumentValidationIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons";

type TabId = "details"

interface Tab {
  id: TabId;
  label: string;
  icon: any;
}

const tabs: Tab[] = [
  { id: "details", label: "Personal Details", icon: User03Icon },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function GuardianTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "cursor-pointer flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors rounded-md",
            activeTab === tab.id
              ? "bg-main-blue/5 text-main-blue"
              : "text-gray-600 hover:bg-main-blue/5 hover:text-main-blue",
          )}
        >
          <Icon icon={tab.icon} size={18} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
