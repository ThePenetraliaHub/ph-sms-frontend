"use client";

import { useState, useEffect } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useFundWalletMutation } from "@/services/wallet/wallet";
import { getApiErrorMessage } from "@/lib/format-api-error";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import type { SkChildDetails } from "@/services/stakeholders/stakeholder-types";

interface TopUpWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** For parents: wards to top up. For teachers/self: omit or pass empty array. */
  wards?: any;
  /** For self top-up (e.g. teacher): receiver is current user. Ignored when wards has items. */
  receiverId?: string;
  currentBalance?: string;
  onSuccess?: () => void;
}

export function TopUpWalletModal({
  open,
  onOpenChange,
  wards = [],
  receiverId,
  currentBalance = "₦0.00",
  onSuccess,
}: TopUpWalletModalProps) {
  const user = useAppSelector(selectUser);
  const isSelfTopUp = wards.length === 0;
  const selfReceiverId = receiverId ?? user?.id ?? "";

  const [wardUserId, setWardUserId] = useState<string>(
    wards[0]?.id ?? selfReceiverId,
  );
  const [amount, setAmount] = useState("");
  const [fundWallet, { isLoading }] = useFundWalletMutation();

  useEffect(() => {
    if (open) {
      if (wards.length > 0) {
        setWardUserId(wards[0].id);
      } else {
        setWardUserId(selfReceiverId);
      }
    }
  }, [open, wards, selfReceiverId]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setAmount("");
    onOpenChange(isOpen);
  };

  const effectiveReceiverId = isSelfTopUp ? selfReceiverId : wardUserId;

  const handleSubmit = async () => {
    const amt = parseFloat(amount?.replace(/,/g, "") || "0");
    if (!effectiveReceiverId) {
      toast.error(
        isSelfTopUp
          ? "Unable to identify your account"
          : "Please select a student",
      );
      return;
    }
    if (!amt || amt < 100) {
      toast.error("Amount must be at least ₦100");
      return;
    }
    try {
      await fundWallet({
        receiver_id: effectiveReceiverId,
        amount: amt,
        currency: "NGN",
      }).unwrap();
      toast.success("Wallet topped up successfully");
      handleClose(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to top up wallet"));
    }
  };

  const wardLabel = (w: any) => {
    const name = w ? w.full_name : "Student";
    return w.full_name ? `${name} (${w.full_name})` : name;
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Top Up Wallet"
      size="lg"
      footer={
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Processing…" : "Top Up"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          {isSelfTopUp
            ? "Enter the amount to add to your wallet. The amount will be credited immediately."
            : "Enter the amount to add to your ward's wallet. The amount will be credited immediately."}
        </p>
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Current balance
          </Label>
          <Input
            value={currentBalance}
            readOnly
            className="bg-gray-50 mt-1 w-fit"
          />
        </div>
        {wards.length > 1 && (
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Select student
            </Label>
            <Select value={wardUserId} onValueChange={setWardUserId}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Choose student" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>
                    {wardLabel(w.user?.first_name ?? "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label
            htmlFor="topup-amount"
            className="text-sm font-medium text-gray-700"
          >
            Amount (₦)
          </Label>
          <Input
            id="topup-amount"
            type="text"
            placeholder="e.g. 10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
            className="mt-1 h-11"
          />
        </div>
      </div>
    </ModalContainer>
  );
}
