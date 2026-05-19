/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import type { StaffEditSavePayload } from "./staff-edit-types";

export function FinancialPayrollForm({
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
    monthlySalary: "",
    bankName: "",
    accountNumber: "",
    taxId: "",
  });

  useEffect(() => {
    if (initialData) {
      const bank = initialData.bank ?? {};
      setFormData({
        monthlySalary: initialData.salary ?? "",
        bankName: bank.bank_name ?? "",
        accountNumber: bank.account_number ?? "",
        taxId: bank.tax_id ?? "",
      });
    }
  }, [initialData]);

  const banks = [
    "Zenith",
    "Access Bank",
    "First Bank",
    "GTBank",
    "UBA",
    "Fidelity Bank",
    "Stanbic IBTC",
    "Union Bank",
  ];

  const handleSubmit = () => {
    const payload: StaffEditSavePayload = {
      stakeholder: {
        salary: formData.monthlySalary || null,
        bank: {
          ...(initialData.bank ?? {}),
          bank_name: formData.bankName || undefined,
          account_number: formData.accountNumber || undefined,
          tax_id: formData.taxId || undefined,
        },
      },
    };
    onSave(payload);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Financial & Payroll
      </h2>

      <div className="space-y-6">
        <InputField
          id="monthlySalary"
          label="Monthly Salary/Wage"
          placeholder="placeholder"
          value={formData.monthlySalary}
          onChange={(e) =>
            setFormData({ ...formData, monthlySalary: e.target.value })
          }
        />

        <SelectField
          label="Bank Name"
          placeholder="Select bank name"
          value={formData.bankName}
          onValueChange={(value) =>
            setFormData({ ...formData, bankName: value })
          }
        >
          {banks.map((bank) => (
            <SelectItem key={bank} value={bank}>
              {bank}
            </SelectItem>
          ))}
        </SelectField>

        <InputField
          id="accountNumber"
          label="Account Number"
          placeholder="placeholder"
          value={formData.accountNumber}
          onChange={(e) =>
            setFormData({ ...formData, accountNumber: e.target.value })
          }
        />

        <InputField
          id="taxId"
          label="Tax ID/Pension No."
          placeholder="placeholder"
          value={formData.taxId}
          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
        />
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
