"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import {
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  RepositoryIcon,
  AddInvoiceIcon,
  Payment01Icon,
  PayByCheckIcon,
  DiscountIcon,
} from "@hugeicons/core-free-icons";
import { FinancialMetricCard } from "@/components/dashboard-pages/admin/finance/finance-metrics";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import { ActivityItem } from "@/components/ui/activity-item";
import { Separator } from "@/components/ui/separator";

import { ViewStudentsModal } from "@/components/dashboard-pages/admin/finance/components/view-students-modal";
import { TrackPaymentsModal } from "@/components/dashboard-pages/admin/finance/components/track-payments-modal";
import { LogPaymentModal } from "@/components/dashboard-pages/admin/finance/components/log-payment-modal";
import { PostCanteenItemModal } from "@/components/dashboard-pages/admin/finance/components/post-canteen-item-modal";
import { SetFeeStructureModal } from "@/components/dashboard-pages/admin/finance/components/set-fee-structure-modal";

import {
  useGetAllTransactionsQuery,
  useGetMetricsQuery,
} from "@/services/transactions/transactions";
import type { TransactionFeeAgeingRow } from "@/services/transactions/transaction-types";
import { selectAllTransactionsData } from "@/services/transactions/transaction-selectors";
import { useAppSelector } from "@/store/hooks";
import { formattedAmount } from "@/common/helper";

export default function FinancePage() {
  const router = useRouter();
  const [viewStudentsModalOpen, setViewStudentsModalOpen] = useState(false);
  const [selectedFeeAgeingRow, setSelectedFeeAgeingRow] =
    useState<TransactionFeeAgeingRow | null>(null);
  const [trackPaymentsModalOpen, setTrackPaymentsModalOpen] = useState(false);
  const [logPaymentModalOpen, setLogPaymentModalOpen] = useState(false);
  const [postCanteenItemModalOpen, setPostCanteenItemModalOpen] =
    useState(false);
  const [setFeeStructureModalOpen, setSetFeeStructureModalOpen] =
    useState(false);

  useGetAllTransactionsQuery();
  const transactions = useAppSelector(selectAllTransactionsData);
  const { data: metrics } = useGetMetricsQuery();

  const handleViewStudents = (row: TransactionFeeAgeingRow) => {
    setSelectedFeeAgeingRow(row);
    setViewStudentsModalOpen(true);
  };

  interface QuickAction {
    icon: any;
    title: string;
    description: string;
    onClick: () => void;
  }

  const quickActions: QuickAction[] = [
    {
      icon: RepositoryIcon,
      title: "Set Fee Structures",
      description:
        "This is the configuration area that determines what a student owes.",
      onClick: () => setSetFeeStructureModalOpen(true),
    },
    {
      icon: AddInvoiceIcon,
      title: "Generate Bulk Invoices",
      description: "Issue fees for a new term.",
      onClick: () => router.push("fee-revenue-management/bulk-invoices"),
    },
    {
      icon: Payment01Icon,
      title: "Log Payment",
      description: "Records a physical payment.",
      onClick: () => setLogPaymentModalOpen(true),
    },
    {
      icon: PayByCheckIcon,
      title: "Track Payment",
      description: "Entry form for recording non-fee transactions.",
      onClick: () => setTrackPaymentsModalOpen(true),
    },
    {
      icon: DiscountIcon,
      title: "Pending Discount Requests",
      description: "Review Discount Requests.",
      onClick: () => router.push("fee-revenue-management/discount-requests"),
    },
  ];

  interface FeeAgeingData {
    period: string;
    value: number;
    total: number;
    barColor: string;
    actionLabel: string;
    sourceRow: TransactionFeeAgeingRow;
  }

  const feeAgeingData: FeeAgeingData[] = useMemo(() => {
    const barColors = [
      "bg-red-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-main-blue",
      "bg-emerald-500",
    ];

    return (metrics?.data?.fee_ageing ?? []).map((row, index) => ({
      period: row.period_label,
      value: row.outstanding_amount,
      total: row.total_billed_amount,
      barColor: barColors[index % barColors.length],
      actionLabel: "View Students",
      sourceRow: row,
    }));
  }, [metrics?.data?.fee_ageing]);

  const feeAgeingColumns: TableColumn<FeeAgeingData>[] = [
    {
      key: "period",
      title: "Ageing Period",
      className: "w-[300px]",
      render: (value) => (
        <span className="text-sm font-medium text-gray-700">{value}</span>
      ),
    },
    {
      key: "value",
      title: "Outstanding Value",
      className: "min-w-[300px]",
      render: (value, row) => (
        <ProgressBar
          value={value}
          total={row.total}
          barColor={row.barColor}
          displayAmount={value}
        />
      ),
    },
    {
      key: "actionLabel",
      title: "Action",
      className: "w-[200px]",
      render: (_, row) => (
        <Button
          variant="link"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (row.actionLabel === "View Students") {
              handleViewStudents(row.sourceRow);
            } else {
              console.log("Send bulk reminder");
            }
          }}
          className="text-main-blue hover:text-main-blue/80 p-0 h-auto font-normal"
        >
          {row.actionLabel}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <h2 className="text-2xl font-bold text-gray-800">
            Fee & Revenue Management Overview Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Use this overview to monitor outstanding risk, track cash flow, and
            ensure compliance with all budgetary controls.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinancialMetricCard
          title="Net Available Cash"
          value={
            metrics
              ? formattedAmount(metrics?.data?.net_available_cash?.value)
              : "0"
          }
          subtitle={
            metrics?.data?.net_available_cash?.value === 0 ? "No data" : ""
          }
        />
        <FinancialMetricCard
          title="Total Outstanding Fees"
          value={
            metrics
              ? formattedAmount(metrics?.data?.total_outstanding_fees?.value)
              : "0"
          }
          subtitle={
            metrics?.data?.total_outstanding_fees?.value === 0 ? "No data" : ""
          }
        />
        <FinancialMetricCard
          title="Budget Adherence"
          value={
            metrics
              ? `${metrics?.data?.budget_adherence?.percentage ?? 0}%`
              : "0"
          }
          subtitle={
            metrics?.data?.budget_adherence?.percentage === 0 ? "No data" : ""
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Fee Ageing Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {feeAgeingData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No fee ageing data
              </div>
            ) : (
              <DataTable
                columns={feeAgeingColumns}
                data={feeAgeingData}
                headerClassName="bg-main-blue/5"
                showActionsColumn={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Recent Financial Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No recent transactions
                </div>
              ) : (
                transactions.slice(0, 5).map((tx, index) => (
                  <div key={tx.id ?? index}>
                    <ActivityItem
                      icon={
                        tx.transaction_type === "income"
                          ? ArrowUpRight01Icon
                          : ArrowDownLeft01Icon
                      }
                      iconColor={
                        tx.transaction_type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                      title={tx.description || "No description"}
                      description={
                        tx.amount
                          ? `₦${Number(tx.amount).toLocaleString()}`
                          : "No amount"
                      }
                      time={tx.created_at ?? null}
                      iconBg
                    />
                    {index < Math.min(5, transactions.length) - 1 && (
                      <Separator />
                    )}
                  </div>
                ))
              )}
            </div>
            {transactions.length > 5 && (
              <div className="flex justify-center pt-2">
                <Button variant="outline">Load more</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {quickActions.map((action, index) => (
                <div key={index}>
                  <QuickActionCard
                    icon={action.icon}
                    title={action.title}
                    description={action.description}
                    onClick={action.onClick}
                  />
                  {index < quickActions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ViewStudentsModal
        open={viewStudentsModalOpen}
        onOpenChange={(next) => {
          setViewStudentsModalOpen(next);
          if (!next) setSelectedFeeAgeingRow(null);
        }}
        period={selectedFeeAgeingRow?.period_label ?? ""}
        stakeholdersSeed={selectedFeeAgeingRow?.students}
      />

      <TrackPaymentsModal
        open={trackPaymentsModalOpen}
        onOpenChange={setTrackPaymentsModalOpen}
      />

      <LogPaymentModal
        open={logPaymentModalOpen}
        onOpenChange={setLogPaymentModalOpen}
      />

      <PostCanteenItemModal
        open={postCanteenItemModalOpen}
        onOpenChange={setPostCanteenItemModalOpen}
      />

      <SetFeeStructureModal
        open={setFeeStructureModalOpen}
        onOpenChange={setSetFeeStructureModalOpen}
      />
    </div>
  );
}
