"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileHeader } from "@/components/dashboard-pages/admin/staff/components/edit-profile-header/edit-profile-header";
import { EditTabs } from "@/components/dashboard-pages/admin/staff/components/edit-tabs/edit-tabs";
import { ContactInformationForm } from "@/components/dashboard-pages/admin/staff/forms/contact-information-form";
import { EmploymentRoleForm } from "@/components/dashboard-pages/admin/staff/forms/employment-role-form";
import { SystemPermissionsForm } from "@/components/dashboard-pages/admin/staff/forms/system-permissions-form";
import { FinancialPayrollForm } from "@/components/dashboard-pages/admin/staff/forms/financial-payroll-form";

import {
  useGetStakeholderByIdQuery,
  useUpdateStakeholderMutation,
} from "@/services/stakeholders/stakeholders";
import { useUpdateUserMutation } from "@/services/users/users";
import type { StaffEditSavePayload } from "@/components/dashboard-pages/admin/staff/forms/staff-edit-types";
import { toast } from "sonner";

type TabId = "contact" | "employment" | "permissions" | "financial";

export default function EditStaffPage({ params }: { params: { id: string } }) {
  const [staffId, setStaffId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>("contact");
  const [profilePicture, setProfilePicture] = useState<string | undefined>();

  const [updateStakeholder, { isLoading: isUpdatingStakeholder }] =
    useUpdateStakeholderMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const isSaving = isUpdatingStakeholder || isUpdatingUser;

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams =
          params instanceof Promise ? await params : params;
        const id = resolvedParams?.id;
        if (id) {
          setStaffId(id);
        } else {
          console.warn("No ID found in params:", resolvedParams);
        }
        setHasChecked(true);
      } catch (error) {
        console.error("Error resolving params:", error);
        setHasChecked(true);
      }
    };
    resolveParams();
  }, [params]);

  const {
    data: staffDataResponse,
    isLoading,
    isError,
  } = useGetStakeholderByIdQuery(staffId ?? "", {
    skip: !staffId,
  });

  const stakeholder = staffDataResponse?.data;

  if (!hasChecked || !staffId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading staff data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading staff</div>
          <div className="text-gray-500 text-sm">Staff ID: {staffId}</div>
        </div>
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Staff not found</div>
          <div className="text-gray-500 text-sm">ID: {staffId}</div>
        </div>
      </div>
    );
  }

  const displayName = stakeholder.user
    ? [stakeholder.user.first_name, stakeholder.user.last_name]
        .filter(Boolean)
        .join(" ") || "Staff"
    : "Staff";

  const handlePhotoChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleSave = async (payload: StaffEditSavePayload) => {
    try {
      const promises: Promise<unknown>[] = [];
      if (payload.stakeholder && Object.keys(payload.stakeholder).length > 0) {
        promises.push(
          updateStakeholder({
            id: stakeholder.id,
            data: payload.stakeholder as any,
          }).unwrap(),
        );
      }
      if (
        payload.user &&
        Object.keys(payload.user).length > 0 &&
        stakeholder.user.id
      ) {
        promises.push(
          updateUser({
            id: stakeholder.user.id,
            data: payload.user as any,
          }).unwrap(),
        );
      }
      if (promises.length > 0) {
        await Promise.all(promises);
        // window.history.back();
        toast.success("Staff information updated successfully!");
      }
    } catch (err) {
      console.error("Failed to save staff:", err);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "contact":
        return (
          <ContactInformationForm
            initialData={stakeholder}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case "employment":
        return (
          <EmploymentRoleForm
            initialData={stakeholder}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case "permissions":
        return (
          <SystemPermissionsForm
            initialData={stakeholder}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      case "financial":
        return (
          <FinancialPayrollForm
            initialData={stakeholder}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      default:
        return (
          <ContactInformationForm
            initialData={stakeholder}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <EditProfileHeader
        name={displayName}
        profilePicture={
          profilePicture ?? stakeholder.user?.profile_image_url ?? undefined
        }
        onPhotoChange={handlePhotoChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card className="bg-background p-0">
            <CardContent className="px-2 py-4">
              <EditTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-0 bg-background">
            <CardContent className="p-6">{renderTabContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
