"use client";

import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import checkIcon from "@/assets/check-icon.png";
import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BadgeDollarSign,
  Book,
  LucideBuilding2,
} from "lucide-react";
import { PaymentInfo } from "@/app/(dashboard)/parent/fee-payment-management/page";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentInfo: PaymentInfo;
  handleSubmit: () => string | number | undefined;
}

export function ConfirmPaymentModal({
  open,
  onOpenChange,
  paymentInfo,
  handleSubmit,
}: Props) {
  const {
    full_name,
    adm_number,
    payment_reference_no,
    school,
    fee_type,
    status,
    amount,
  } = paymentInfo;

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
    }
    onOpenChange(isOpen);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title=""
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
            // disabled={isLoading}
          >
            Proceed to Checkout <ArrowRight />
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-2">
        <div className="flex w-full justify-between items-center">
          <Image
            src={checkIcon}
            className="w-30"
            alt="check-icon"
            priority
            draggable={false}
          />
          <p className="font-medium text-gray-600"> {payment_reference_no}</p>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Confirm Payment Details</CardTitle>
          <p className="text-sm text-gray-600">
            Please review the details before you proceed to make payment. You'll
            be redirected to <span className="font-bold">PayStack</span> to
            complete your payment securely.
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg space-y-5">
          <div className="flex gap-5 justify-between items-center">
            <div className="flex gap-x-2 items-center">
              <span className="min-w-13 rounded-full flex items-center justify-center max-w-13 h-13 bg-main-blue text-white uppercase font-semibold text-xl">
                {full_name.split(" ")[0]?.slice(0, 1) ?? ""}
                {full_name.split(" ")[1]?.slice(0, 1) ?? ""}
              </span>
              <div className="text-sm">
                <h3 className="font-medium">{full_name}</h3>
                <p>{adm_number}</p>
              </div>
            </div>
            <p className="bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full capitalize">
              {status}
            </p>
          </div>
          <hr className="border-none h-px w-full bg-muted-foreground/10" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-x-2">
              <LucideBuilding2 />
              <p>School</p>
            </div>
            <p>{school}</p>
          </div>
          <hr className="border-none h-px w-full bg-muted-foreground/10" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-x-2">
              <Book />
              <p>Fee Type</p>
            </div>
            <p>{fee_type}</p>
          </div>
          <hr className="border-none h-px w-full bg-muted-foreground/10" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-x-2">
              <BadgeDollarSign />
              <p>Total Amount</p>
            </div>
            <p className="font-semibold text-lg">₦{amount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
