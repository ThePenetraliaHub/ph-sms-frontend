"use client";

import { Suspense, useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { selectUser } from "@/store/slices/authSlice";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import { CheckmarkCircle01FreeIcons } from "@hugeicons/core-free-icons";
import { useGetParentByUserIdQuery } from "@/services/stakeholders/stakeholders";
import { PayFeesModal } from "@/components/dashboard-pages/parent/pay-fees-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InitiatePaymentPayload } from "@/services/payment/payment-types";
import { useInitializePaymentMutation } from "@/services/payment/payment";
import { ConfirmPaymentModal } from "@/components/dashboard-pages/parent/fees-payment-portal/confirm-payment-modal";

type Ward = {
  id: string;
  full_name: string;
};

export type PaymentInfo = {
  full_name: string;
  adm_number: string;
  payment_reference_no: string;
  status: string;
  school: string;
  fee_type: string;
  amount: number;
};

const testInitialPayData: PaymentInfo = {
  full_name: "",
  adm_number: "",
  payment_reference_no: "",
  status: "active",
  school: "",
  fee_type: "",
  amount: 0,
};

interface FeesPaymentHistory {
  id: string;
  description: string;
  paymentDate: string;
  amountPaid: number;
  receiptUrl: string;
  status: "success" | "failed";
}

const dumFeesPay: FeesPaymentHistory[] = [
  {
    id: "wr453ffetdhhf67",
    description: "Payment for Children's notebook",
    paymentDate: "2026-09-09",
    amountPaid: 200000.0,
    receiptUrl: "https://test-receipt.com",
    status: "success",
  },
  {
    id: "544trgfhhd7d55fkgkvnfyr",
    description: "Library Fees",
    paymentDate: "2026-09-13",
    amountPaid: 30000.0,
    receiptUrl: "https://test-receipt.com",
    status: "success",
  },
  {
    id: "09i7kyjhhdndbcarrevdf6",
    description: "Medical Fees",
    paymentDate: "2026-09-09",
    amountPaid: 400000.0,
    receiptUrl: "https://test-receipt.com",
    status: "failed",
  },
];

interface OutstandingFees {
  id: string;
  amount: number;
  status: "pending" | "success" | "failed";
  title: string;
  description: string;
  created_at: string;
  due_on: string;
}

const dumOutFees: OutstandingFees[] = [
  {
    id: "feesId1",
    amount: 30000.0,
    status: "pending",
    title: "Test Title 1",
    description: "Test Description 1",
    due_on: "2026-09-01",
    created_at: "2026-09-16",
  },
  {
    id: "feesId2",
    amount: 40000.0,
    status: "pending",
    title: "Test Title 2",
    description: "Test Description 2",
    due_on: "2026-09-01",
    created_at: "2026-09-16",
  },
  {
    id: "feesId3",
    amount: 50000.0,
    status: "pending",
    title: "Test Title 3",
    description: "Test Description 3",
    due_on: "2026-09-01",
    created_at: "2026-09-16",
  },
];

// const CURRENCY = "₦";
// const formatAmount = (n: number | string) =>
//   `${CURRENCY}${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

function FeePaymentManagementContent() {
  const user = useAppSelector(selectUser);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [confirmMod, setConfirmMod] = useState<boolean>(false);
  const [selWardId, setSelWardId] = useState<string>();
  const [authUrl, setAuthUrl] = useState<string>();
  const [paymentInfo, setPaymentInfo] =
    useState<PaymentInfo>(testInitialPayData);

  //initialize payment
  const [initializePayment, { isLoading: isInitializing }] =
    useInitializePaymentMutation();

  //fetch parent
  const { data: parentData, isLoading: isFetchingParentData } =
    useGetParentByUserIdQuery(user?.id ?? "", {
      skip: !user?.id,
    });
  const parent = parentData?.data ?? null;

  //construct wards from parent data
  const wards: Ward[] = useMemo(() => {
    if (!parent || !parent.children_details) return [] as Ward[];

    const children: Ward[] = parent.children_details?.map((child) => ({
      id: child.id,
      full_name: child.full_name,
    }));

    return children;
  }, [parent]);

  const initiatePayment = async (
    amount: number,
    fee_ids: string[],
    title: string,
  ) => {
    //run checks
    if (!selWardId) return toast.error("Select student to pay for");
    if (!parent?.user.email) return toast.error("User not identified");
    if (amount <= 0) return toast.error("Invalid fee payment");
    if (fee_ids.length === 0) return toast.error("No fees payment selected");

    //construct initiate payment payload
    const payload: InitiatePaymentPayload = {
      student_id: selWardId,
      fee_ids,
      amount,
      email: parent?.user.email ?? "",
    };

    try {
      const { data } = await initializePayment(payload).unwrap();
      console.log("initialize flow res", data);
      setAuthUrl(data.transaction.authorization_url ?? undefined);
      setPaymentInfo((prev) => ({
        ...prev,
        full_name: data.transaction.student_name ?? "",
        adm_number: data.transaction.student_admission_number ?? "",
        payment_reference_no: data.transaction.reference ?? "",
        fee_type: title,
        school: data.transaction.school_name ?? "",
        amount: Number(data.transaction.amount) ?? "",
      }));
      setConfirmMod(true);
    } catch {}
  };

  const isValidPaystackUrl = (value: string): boolean => {
    try {
      const url = new URL(value);
      return (
        (url.protocol === "https:" || url.protocol === "http:") &&
        url.hostname === "paystack.com"
      );
    } catch {
      return false;
    }
  };

  const proceedToPay = () => {
    if (!authUrl) return toast.error("Failed to complete payment");
    //validate url, tailored to paystack
    const isValidUrl = isValidPaystackUrl(authUrl);
    if (!isValidUrl) return toast.error("Unresolved hostname");
    window.location.href = authUrl;
  };

  const outstandingFeesColumns: TableColumn<OutstandingFees>[] = [
    {
      key: "description",
      title: "Description",
      render: (v) => (
        <span className="font-medium text-gray-800">{v as string}</span>
      ),
    },
    {
      key: "title",
      title: "Title",
      render: (v) => (
        <span className="font-medium text-gray-800">{v as string}</span>
      ),
    },
    { key: "amount", title: "Amount" },
    { key: "due_on", title: "Due Date" },
    {
      key: "status",
      title: "Status",
      render: (v, r) => (
        <span
          className={`text-sm font-medium capitalize ${r.status === "success" ? "text-green-600" : r.status === "pending" ? "text-yellow-600" : "text-destructive"}`}
        >
          {v as string}
        </span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (_v, row) => {
        return (
          <Button
            disabled={isInitializing}
            variant="link"
            className="h-auto p-0 text-main-blue disabled:opacity-50 transition ease-in-out delay-100"
            onClick={() => initiatePayment(row.amount, [row.id], row.title)}
          >
            Pay Now
          </Button>
        );
      },
    },
  ];

  const paymentColumns: TableColumn<FeesPaymentHistory>[] = [
    {
      key: "description",
      title: "Description",
      render: (v) => (
        <span className="font-medium text-gray-800">{v as string}</span>
      ),
    },
    { key: "paymentDate", title: "Date" },
    { key: "amountPaid", title: "Amount" },
    {
      key: "status",
      title: "Status",
      render: (v, r) => (
        <span
          className={`text-sm font-medium capitalize ${r.status === "success" ? "text-green-600" : "text-destructive"}`}
        >
          {v as string}
        </span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (value, row) => {
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-main-blue"
            onClick={() => toast.success("Download successful ✅")}
          >
            Download Receipt
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Fees & Payments Management
        </h1>
        <p className="text-gray-600">
          Manage school fees for your wards. Make payments from your wallet and
          view history.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-col-1 lg:grid-cols-2 2xl:grid-cols-2 gap-3">
          <MetricCard
            title="Total Outstanding Balance"
            // value={formatAmount(totalOutstanding)}
            value={0}
            // trend={totalOutstanding > 0 ? "up" : undefined}
            trend={"up"}
          />
          <MetricCard key={""} title="Last Payment" value={"—"} subtitle={""} />
        </div>
        <Card>
          <CardHeader>
            <div className="space-y-1.5">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Children Details
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select a child's fees record to show
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              disabled={isFetchingParentData}
              value={selWardId}
              onValueChange={setSelWardId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => {
                  return (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.full_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <div className="flex items-end">
          <Button
            variant="outline"
            // onClick={() => handlePayNow()}
            className="w-full h-11"
            disabled={true}
          >
            <Icon icon={CheckmarkCircle01FreeIcons} size={18} />
            Verify Payment Status
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Outstanding Fees for Student -
          </CardTitle>
          <p className="text-sm text-gray-600">
            ⚠️ Kindly note that you'll be redirected to an external site to
            complete your payment.
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={outstandingFeesColumns}
              data={dumOutFees}
              emptyMessage={"No outstanding payments record yet"}
              showActionsColumn={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* PAYMENT HISTORY */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={paymentColumns}
              data={dumFeesPay}
              emptyMessage={"No fee payments record yet"}
              showActionsColumn={false}
            />
          </div>
          {/* {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={loadMore}>
                    Load More
                  </Button>
                </div>
              )} */}
        </CardContent>
      </Card>

      <PayFeesModal
        open={payModalOpen}
        onOpenChange={setPayModalOpen}
        wards={[]}
        schoolId={""}
        prefillAmount={0}
        feesType={""}
      />

      <ConfirmPaymentModal
        paymentInfo={paymentInfo}
        open={confirmMod}
        onOpenChange={setConfirmMod}
        handleSubmit={proceedToPay}
      />
    </div>
  );
}

export default function FeePaymentManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-32 animate-pulse rounded bg-gray-100" />
        </div>
      }
    >
      <FeePaymentManagementContent />
    </Suspense>
  );
}
