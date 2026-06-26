"use client";

import { useState, useEffect } from "react";
import { SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SelectItem } from "@/components/ui/select";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import type { StaffEditSavePayload } from "./staff-edit-types";

export function SystemPermissionsForm({
  initialData,
  onCancel,
  onSave,
  isSaving = false,
}: {
  initialData: Stakeholders;
  onCancel: () => void;
  onSave: (payload: StaffEditSavePayload) => void;
  isSaving?: boolean;
}) {
  const [formData, setFormData] = useState({
    systemRole: "",
    accountStatus: true,
  });

  useEffect(() => {
    if (initialData?.user) {
      setFormData({
        systemRole: initialData.user.role ?? "",
        accountStatus: initialData.user.is_active ?? true,
      });
    }
  }, [initialData]);

  const systemRoles = ["Admin", "Teacher", "Staff", "Parent", "Student"];

  const handleSubmit = () => {
    const payload: StaffEditSavePayload = {
      user: {
        role: formData.systemRole,
        is_active: formData.accountStatus,
      },
    };
    onSave(payload);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        System Access & Permissions
      </h2>

      <div className="space-y-6">
        <SelectField
          label="System Role(s)"
          placeholder="Select job title"
          value={formData.systemRole}
          onValueChange={(value) =>
            setFormData({ ...formData, systemRole: value })
          }
        >
          {systemRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectField>

        <div className="flex flex-row justify-between">
          <div>
            <Label htmlFor="accountStatus">Account Status</Label>
            <p className="text-sm text-gray-600 mb-3">
              Quickly disables access without terminating the profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="accountStatus"
              checked={formData.accountStatus}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, accountStatus: checked })
              }
            />
            <span className="text-sm text-gray-600">
              {formData.accountStatus ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-60 bg-main-blue hover:bg-main-blue/90"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
