"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  name: string;
  staffId: string;
  role: string;
  email: string;
  noOfWards: number;
  status: "active" | "on-leave" | "inactive";
  statusLabel: string;
  profilePicture?: string;
}

export function ViewGuardianHeader({
  name,
  staffId,
  role,
  status,
  statusLabel,
  profilePicture,
  email,
  noOfWards,
}: Props) {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border border-green-600";
      case "on-leave":
        return "bg-orange-100 text-orange-700 border border-orange-600";
      case "inactive":
        return "bg-red-100 text-red-700 border border-red-600";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-600";
    }
  };

  return (
    <div className="bg-background rounded-md p-6 mb-6">
      <div className="flex items-start gap-6">
        {/* Profile Picture */}
        <div className="shrink-0">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt={name}
              width={120}
              height={120}
              className="rounded-md object-cover object-top w-30 h-30"
            />
          ) : (
            <div className="w-30 h-30 rounded-md bg-gray-200 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-400">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Staff Info */}
        <div className="flex-1 h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl 2xl:text-4xl font-bold text-gray-800 mb-6">
                {name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="border rounded-md px-3 py-2">
                  <span className="font-medium">Staff ID:</span> {staffId}
                </div>
                <div className="border rounded-md capitalize px-3 py-2">
                  <span className="font-medium">Role:</span> {role}
                </div>
                <div className="border rounded-md px-3 py-2">
                  <span className="font-medium">Email:</span> {email}
                </div>
                <div className="border rounded-md px-3 py-2">
                  <span className="font-medium">Number of Wards:</span>{" "}
                  {noOfWards}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center text-white capitalize text-xs sm:text-sm font-medium rounded-md h-9 px-4 py-2",
                getStatusColor(),
              )}
            >
              {statusLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
