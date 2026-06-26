"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import type { StaffEditSavePayload } from "./staff-edit-types";

export function ContactInformationForm({
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
    primaryPhone: "",
    emergencyContact: "",
    residentialAddress: "",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        primaryPhone: initialData.user?.phone_number ?? "",
        emergencyContact: initialData.emergency_contact_and_phone ?? "",
        residentialAddress: initialData.user?.residential_address ?? "",
        password: "",
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    const payload: StaffEditSavePayload = {
      user: {
        phone_number: formData.primaryPhone || null,
        residential_address: formData.residentialAddress || null,
      },
      stakeholder: {
        emergency_contact_and_phone: formData.emergencyContact || null,
      },
    };
    if (formData.password.trim()) {
      (payload.user as Record<string, unknown>).password = formData.password;
    }
    onSave(payload);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Contact Information
      </h2>

      <div className="space-y-6">
        <InputField
          id="primaryPhone"
          label="Primary Phone Number"
          placeholder="E.g. +23412347890"
          value={formData.primaryPhone}
          onChange={(e) =>
            setFormData({ ...formData, primaryPhone: e.target.value })
          }
        />

        <InputField
          id="emergencyContact"
          label="Emergency Contact & Number"
          placeholder="E.g., Bello Aisha Fatimah, +23412347890"
          value={formData.emergencyContact}
          onChange={(e) =>
            setFormData({ ...formData, emergencyContact: e.target.value })
          }
        />

        <InputField
          id="residentialAddress"
          label="Residential Address"
          placeholder="E.g., Bello Aisha Fatimah"
          value={formData.residentialAddress}
          onChange={(e) =>
            setFormData({ ...formData, residentialAddress: e.target.value })
          }
        />

        <div className="space-y-2">
          <Label htmlFor="password">Change Password</Label>
          <InputField
            id="password"
            type="password"
            placeholder="Click to change password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <p className="text-xs text-gray-500">Click to change password</p>
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
