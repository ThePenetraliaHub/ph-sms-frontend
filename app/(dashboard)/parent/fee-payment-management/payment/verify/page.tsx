"use client";
import { Button } from "@/components/ui/button";
import { useLazyGetPaymentStatusQuery } from "@/services/payment/payment";
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  LoaderIcon,
  LucideContact2,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { JSX, useEffect, useState } from "react";

type Step = "loading" | "error" | "success";

export default function Page() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const reference = searchParams.get("reference");
  const [step, setStep] = useState<Step | null>(reference ? "loading" : null);
  const [status, setStatus] = useState<"checking" | "ready">("checking");

  const [fetchPaymentStatus] = useLazyGetPaymentStatusQuery();

  const goBack = () => replace("/parent/fee-payment-management");

  const renderContent = (): JSX.Element => {
    switch (step) {
      case "loading":
        return (
          <div className="bg-background rounded-md p-6 space-y-7">
            <div className="space-y-2 w-full">
              <div className="flex flex-row items-center gap-x-2">
                <LoaderIcon className="text-yellow-700" size={25} />
                <h1 className="text-gray-800 text-2xl font-bold">
                  Verifying Payment...
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base w-[60%]">
                We're checking your payment status. This will only take a
                moment.
              </p>
            </div>
            <div className="space-y-1">
              <Loader2 size={30} className="animate-spin" />
              <p className="text-gray-800 text-sm">Please wait...</p>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="bg-background rounded-md p-6 space-y-7">
            <div className="space-y-2 w-full">
              <div className="flex flex-row items-center gap-x-2">
                <CheckCircle color="green" size={25} />
                <h1 className="text-gray-800 text-2xl font-bold">
                  Payment Verified!
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base w-[60%]">
                Your fee payment has been successfully verified. Please click
                the button below to return to fees portal.{" "}
              </p>
            </div>
            <Button onClick={() => goBack()} className="w-full">
              Continue <ArrowRight />
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="bg-background rounded-md p-6 space-y-7">
            <div className="space-y-2 w-full">
              <div className="flex flex-row items-center gap-x-2">
                <XCircle color="red" size={25} />
                <h1 className="text-gray-800 text-2xl font-bold">
                  Payment Verification Failed
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base w-[60%]">
                We couldn't verify your payment at the moment. This could be due
                to a network issue or an incomplete transaction.
              </p>
            </div>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <Button onClick={() => verifyPayment()} className="w-full">
                Try Again <ArrowRight />
              </Button>
              <Button
                variant={"outline"}
                disabled={true}
                className="w-full lg:w-1/2"
              >
                Contact Support <LucideContact2 />
              </Button>
            </div>
          </div>
        );
      default:
        return <></>; //null
    }
  };

  const verifyPayment = async () => {
    if (!reference) return;
    if (step !== "loading") setStep("loading");
    try {
      const res = await fetchPaymentStatus({ reference }).unwrap();
      //   console.log("Response: ", res);
      //if paid, set steps to success else, set to error
      setStep(null);
    } catch {
      setStep("error");
    }
  };

  useEffect(() => {
    if (!reference) {
      return goBack();
    }
    setStatus("ready");
    verifyPayment();
  }, [reference]);

  if (status === "checking") {
    //do something
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Fees Verification
        </h1>
        <p className="text-gray-600">
          Automatic verification of your online payments.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
