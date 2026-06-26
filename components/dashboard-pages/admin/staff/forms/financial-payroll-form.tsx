/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import type { StaffEditSavePayload } from "./staff-edit-types";
import { Bank } from "@/services/schools/schools-type";
import { toast } from "sonner";

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
    accountName: "",
  });

  //   export interface Bank {
  //  bank_id: string;
  //  bank_code: string;
  //  bank_name: string;
  //  account_name: string;
  //  account_number: string;
  // }

  useEffect(() => {
    if (initialData) {
      const bank: Bank | null = initialData.bank ?? null;
      setFormData({
        monthlySalary: initialData.salary ?? "",
        bankName: bank?.bank_name ?? "",
        accountNumber: bank?.account_number ?? "",
        accountName: bank?.account_name ?? "",
      });
    }
  }, [initialData]);

  const banks: { id: string; code: string; name: string }[] = [
    {
      id: "1",
      code: "1111",
      name: "Zenith Bank PLC",
    },
    {
      id: "2",
      code: "2222",
      name: "Access Bank",
    },
    {
      id: "3",
      code: "3333",
      name: "First Bank",
    },
    {
      id: "4",
      code: "4444",
      name: "GTBank",
    },
    {
      id: "5",
      code: "5555",
      name: "UBA",
    },
    {
      id: "6",
      code: "6666",
      name: "Fidelity Bank PLC",
    },
    {
      id: "7",
      code: "7777",
      name: "Stanbic IBTC Bank",
    },
    {
      id: "8",
      code: "8888",
      name: "Union Bank",
    },
    {
      id: "9",
      code: "9999",
      name: "Moniepoint MFB Bank",
    },
    {
      id: "10",
      code: "0000",
      name: "OPay Digital Services",
    },
  ];

  const handleSubmit = () => {
    if (formData.bankName && isNaN(Number(formData.accountNumber)))
      return toast.error("Please enter only numbers for account number");
    if (formData.bankName && formData.accountNumber.length !== 10)
      return toast.error("Please enter a valid account number");
    if (formData.bankName && !formData.accountName.trim())
      return toast.error("Please input the account holder's name");
    if(isNaN(Number(formData.monthlySalary))) return toast.error('Salary can only be in numbers')

    const [selectedBank] = banks.filter(
      (bank) => bank.name === formData.bankName,
    );
    const payload: StaffEditSavePayload = {
      stakeholder: {
        salary: formData.monthlySalary || null,
        bank: formData.bankName
          ? {
              // ...(initialData.bank ?? {}),
              // bank_name: formData.bankName || undefined,
              // account_number: formData.accountNumber || undefined,
              // tax_id: formData.accountName || undefined,
              bank_id: selectedBank.id ?? null,
              bank_code: selectedBank.code ?? null,
              bank_name: formData.bankName ?? null,
              account_name: formData.accountName ?? null,
              account_number: formData.accountNumber ?? null,
            }
          : null,
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
          onValueChange={(value) => {
            setFormData({ ...formData, bankName: value });
            // setSelectedBankId(value);
          }}
        >
          {banks.map((bank, index) => (
            <SelectItem key={index} value={bank.name}>
              {bank.name}
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
          id="accountName"
          label="Account Holder's Name"
          placeholder="placeholder"
          value={formData.accountName}
          onChange={(e) =>
            setFormData({ ...formData, accountName: e.target.value })
          }
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
