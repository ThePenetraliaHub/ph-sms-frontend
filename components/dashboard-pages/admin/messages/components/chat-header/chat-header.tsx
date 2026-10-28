"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import {
  Search01Icon,
  UserMultiple02Icon,
  SharedDriveIcon,
} from "@hugeicons/core-free-icons";

import { Card, CardContent } from "@/components/ui/card";

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  type: "general" | "group" | "individual";
  onSearch?: () => void;
  onMembers?: () => void;
}

export function ChatHeader({
  title,
  subtitle,
  type,
  onSearch,
  onMembers,
}: ChatHeaderProps) {
  return (
    <Card>
      <CardContent className="flex flex-row justify-between">
        <div className="flex flex-row items-start gap-3">
          {(type === "general" || type === "group") && (
            <Icon
              icon={SharedDriveIcon}
              size={18}
              className="mt-1 text-main-blue"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMembers}
            className="h-9 w-9 hidden" //EDITED
          >
            <Icon icon={UserMultiple02Icon} size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearch}
            className="h-9 w-9"
          >
            <Icon icon={Search01Icon} size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
