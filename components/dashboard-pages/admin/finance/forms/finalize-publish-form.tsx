"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FinalizePublishFormProps {
  totalInvoices: number;
  totalAmount: number;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (params: { notifyParents: boolean }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function FinalizePublishForm({
  totalInvoices,
  totalAmount,
  onBack,
  onCancel,
  onSubmit,
  isSubmitting = false,
}: FinalizePublishFormProps) {
  const [confirmationChecked, setConfirmationChecked] = useState(true);
  const [communicationChecked, setCommunicationChecked] = useState(true);
  const [archivalChecked, setArchivalChecked] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ notifyParents: communicationChecked });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-8">
        <h3 className="text-lg font-semibold text-gray-800">
          Finalize and Publish
        </h3>

        <div className="flex flex-col gap-8">
          <div>
            <span className="text-sm text-gray-600">
              Total Invoice Generated:
            </span>
            <span className="text-sm border px-4 py-2 rounded-md ml-2 text-gray-800">
              {totalInvoices} Invoices
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">
              Total Amount Expected:
            </span>
            <span className="text-sm border px-4 py-2 rounded-md ml-2 text-gray-800">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="confirmation" className="text-sm text-gray-700">
              You are about to generate {totalInvoices} invoices totaling{" "}
              {formatCurrency(totalAmount)}. This action is irreversible.
            </Label>
          </div>
          <Switch
            id="confirmation"
            checked={confirmationChecked}
            onCheckedChange={setConfirmationChecked}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="communication" className="text-sm text-gray-700">
              Publish to Parent Portal and Send Email/SMS Notification
            </Label>
          </div>
          <Switch
            id="communication"
            checked={communicationChecked}
            onCheckedChange={setCommunicationChecked}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="archival" className="text-sm text-gray-700">
              Log Batch Details in Financial Audit Report
            </Label>
          </div>
          <Switch
            id="archival"
            checked={archivalChecked}
            onCheckedChange={setArchivalChecked}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-60"
          disabled={!confirmationChecked || isSubmitting}
        >
          {isSubmitting ? "Publishing…" : "Generate & Send Invoices Now"}
        </Button>
      </div>
    </form>
  );
}
