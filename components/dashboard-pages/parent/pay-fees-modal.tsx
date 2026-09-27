"use client";

import { useEffect, useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/format-api-error";
import { useVerifyPaymentMutation } from "@/services/payment/payment";
import { CheckCircle2, InfoIcon, XCircle } from "lucide-react";

interface PayFeesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayFeesModal({ open, onOpenChange }: PayFeesModalProps) {
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "pending" | "failed" | undefined
  >();

  const [verifyPayment, { isLoading }] = useVerifyPaymentMutation();

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReferenceNo("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!referenceNo || !referenceNo.trim())
      return toast.error("Please fill in the reference number");
    const payload = {
      reference: referenceNo,
    };
    try {
      const { data, message } = await verifyPayment(payload).unwrap();
      if (data.payment.status) setPaymentStatus(data.payment.status);
      toast.success(message ? message : "Payment status retrieved successfully")
      // handleClose(false);
    } catch (err: unknown) {
      // toast.error(getApiErrorMessage(err, "Failed to initialize payment"));
    }
  };

  useEffect(() => {
    if (!paymentStatus) return;
    const interval = setInterval(() => {
      if (paymentStatus) setPaymentStatus(undefined);
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentStatus]);

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Check Payment Status"
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
            className="flex-1 disabled:opacity-70"
            disabled={isLoading || !referenceNo.trim()}
          >
            {isLoading ? "Verifying..." : "Verify Payment"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Use the form below to check for your payment status using payment
          Reference Number.
        </p>
        <div>
          <Label
            htmlFor="pay-description"
            className="text-sm font-medium text-gray-700"
          >
            Reference No.
          </Label>
          <Input
            id="pay-description"
            type="text"
            placeholder="e.g. PAY-XXXXXXXX-XXXXXX"
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            maxLength={225}
            className="mt-1 h-11"
          />
          {/* notify */}
          {paymentStatus && (
            <div className="mt-3">
              {paymentStatus === "success" ? (
                <div className="p-3 rounded-lg bg-green-600 text-white flex items-center gap-x-2">
                  <CheckCircle2 />
                  <p>Your payment was successful.</p>
                </div>
              ) : paymentStatus === "pending" ? (
                <div className="p-3 rounded-lg bg-yellow-600 text-white flex items-center gap-x-2">
                  <InfoIcon />
                  <p>Your payment is still pending.</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-destructive text-white flex items-center gap-x-2">
                  <XCircle />
                  <p>Your payment failed.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
