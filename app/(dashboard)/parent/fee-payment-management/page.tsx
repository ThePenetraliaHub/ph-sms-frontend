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
import { useInitializeFeesPaymentMutation } from "@/services/payment/payment";
import { ConfirmPaymentModal } from "@/components/dashboard-pages/parent/fees-payment-portal/confirm-payment-modal";
import { useViewStudentFeesQuery } from "@/services/schools/schools";
import { ViewStudentFeesData } from "@/services/schools/schools-type";
import { useGetChildrenPaymentRecordsQuery } from "@/services/transactions/transactions";
import { ParentPaymentRecords } from "@/services/transactions/transaction-types";
import { format } from "date-fns";

type Ward = {
  id: string;
  full_name: string;
};

type Metric = {
  title: string;
  value: string | number;
  subtitle?: string;
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

interface OutstandingFees {
  id: string;
  amount: number;
  status: "paid" | "unpaid";
  fee_name: string;
  created_at: string;
  due_date: string;
}

interface PaymentRecords extends ParentPaymentRecords {
  fee_name: string;
}

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
    useInitializeFeesPaymentMutation();

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

  //fetch student fees
  const { data: studentFeesData, isLoading: isFetchingStudentFees } =
    useViewStudentFeesQuery(
      { student_id: selWardId ?? "" },
      { skip: !selWardId || !selWardId?.trim() },
    );

  const student_fee_records: ViewStudentFeesData | null = useMemo(() => {
    if (!studentFeesData?.data) return null;
    return studentFeesData?.data;
  }, [studentFeesData]);

  const studentOutstandingFess: OutstandingFees[] = useMemo(() => {
    if (!studentFeesData) return [] as OutstandingFees[];
    const studentFees: OutstandingFees[] = studentFeesData.data.fees.map(
      (fee) => ({
        id: fee.id,
        amount: Number(fee.total_amount ?? 0) || Number(fee.amount_owed ?? 0),
        status: fee.status as "paid" | "unpaid",
        fee_name: fee.fee_name,
        created_at: fee.created_at,
        due_date: fee.due_date,
      }),
    );
    return studentFees;
  }, [studentFeesData]);

  //fetch payment records
  const { data: payment_records, isLoading: isFetchingRecords } =
    useGetChildrenPaymentRecordsQuery();

  const paymentRecords: PaymentRecords[] = useMemo(() => {
    if (!payment_records) return [] as PaymentRecords[];
    const modifiedArr: PaymentRecords[] = payment_records.data.payments.map(
      (record) => ({
        ...record,
        fee_name: record.fee_details.map((item) => item.fee_name).join(", "),
      }),
    );
    return modifiedArr;
  }, [payment_records]);

  const metrics: Metric[] = [
    {
      title: "Total Payments",
      value: payment_records?.data.summary?.total_payments ?? "-",
      subtitle: "Number of payments made to the school's accounts",
    },
    {
      title: "Total Amount",
      value: payment_records?.data.summary?.total_amount ?? "-",
      subtitle: "Total amounts made to the school's accounts",
    },
    {
      title: "Successful Payments",
      value: payment_records?.data.summary?.successful_payments ?? "-",
      subtitle: "Total number of successful payments completed.",
    },
    {
      title: "Pending Payments",
      value: payment_records?.data.summary?.pending_payments ?? "-",
      subtitle: "Total number of pending payments.",
    },
    {
      title: "Failed Payments",
      value: payment_records?.data.summary?.failed_payments ?? "-",
      subtitle: "Total number of failed payments.",
    },
  ];

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

  const proceedToPay = () => {
    if (!authUrl) return toast.error("Failed to complete payment");
    window.location.href = authUrl;
  };

  const outstandingFeesColumns: TableColumn<OutstandingFees>[] = [
    {
      key: "fee_name",
      title: "Fee Name",
      render: (v) => <span className="font-medium">{v as string}</span>,
    },
    {
      key: "amount",
      title: "Amount",
      render: (v, r) => (
        <span className="font-semibold">₦{r.amount.toLocaleString()}.00</span>
      ),
    },
    { key: "created_at", title: "Created At" },
    { key: "due_date", title: "Due Date" },
    {
      key: "status",
      title: "Status",
      render: (v, r) => (
        <span
          className={`text-sm font-medium capitalize ${r.status === "paid" ? "text-green-600" : "text-destructive"}`}
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
            disabled={isInitializing || row.status === "paid"}
            variant="link"
            className="h-auto p-0 text-main-blue disabled:opacity-50 transition ease-in-out delay-100 disabled:cursor-not-allowed"
            onClick={() => initiatePayment(row.amount, [row.id], row.fee_name)}
          >
            {row.status === "paid" ? "-" : "Pay Now"}
          </Button>
        );
      },
    },
  ];

  const paymentColumns: TableColumn<PaymentRecords>[] = [
    {
      key: "fee_name",
      title: "Fees",
      render: (v) => <p className="font-medium text-gray-800">{v as string}</p>,
    },
    { key: "student_name", title: "Student" },
    { key: "reference", title: "Reference No." },
    {
      key: "amount",
      title: "Amount",
      render: (v, r) => (
        <span className="text-sm font-medium capitalize">
          {r.amount ? `₦${r.amount.toLocaleString()}.00` : "₦0.00"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (v, r) => (
        <span
          className={`font-medium capitalize ${r.status === "success" ? "text-green-600" : r.status === "pending" ? "text-yellow-600" : "text-destructive"}`}
        >
          {v as string}
        </span>
      ),
    },
    {
      key: "payment_method",
      title: "Pay Method",
      render: (v, row) => (
        <span className="capitalize text-gray-800">{v as string}</span>
      ),
    },
    {
      key: "paid_at",
      title: "Paid On",
      render: (v, row) => (
        <span className="text-gray-800">
          {format(v as string, "MMM dd, yyyy")}
        </span>
      ),
    },
    // {
    //   key: "action",
    //   title: "Action",
    //   render: (value, row) => {
    //     return (
    //       <Button
    //         variant="link"
    //         className="h-auto p-0 text-main-blue"
    //         onClick={() => toast.success("Download successful ✅")}
    //       >
    //         Download Receipt
    //       </Button>
    //     );
    //   },
    // },
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
        <div className="grid grid-col-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {metrics.map((summary, index) => {
            return (
              <MetricCard
                key={index}
                title={summary.title}
                subtitle={summary.subtitle}
                value={summary.value}
                // trend={"up"}
              />
            );
          })}
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
            onClick={() => setPayModalOpen(true)}
            className="w-full h-11"
            // disabled={true}
          >
            <Icon icon={CheckmarkCircle01FreeIcons} size={18} />
            Check Payment Status
          </Button>
        </div>
      </div>

      {/* main content */}
      <div>
        {!selWardId ? (
          <div className="h-50 w-full text-muted-foreground justify-center flex items-center">
            <p>Select a child to begin.</p>
          </div>
        ) : isFetchingStudentFees || isFetchingRecords ? (
          <div className="h-50 w-full text-muted-foreground justify-center flex items-center">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OUTSTANDING FEES */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Outstanding Fees for{" "}
                  {student_fee_records
                    ? student_fee_records.student.full_name
                    : "Student"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  ⚠️ Kindly note that you'll be redirected to an external site
                  to complete your payment.
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <DataTable
                    columns={outstandingFeesColumns}
                    data={studentOutstandingFess}
                    emptyMessage={"No outstanding payments record yet"}
                    showActionsColumn={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* PAYMENT HISTORY */}
        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <DataTable
                columns={paymentColumns}
                data={paymentRecords}
                isLoading={isFetchingRecords}
                emptyMessage={"No fee payments record yet"}
                showActionsColumn={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <PayFeesModal open={payModalOpen} onOpenChange={setPayModalOpen} />

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
