"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickActionCard } from "@/components/dashboard-pages/admin/admissions/components/quick-action-card";
import {
  Discount01Icon,
  WalletAdd02Icon,
  Payment02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { TopUpWalletModal } from "@/components/dashboard-pages/parent/top-up-wallet-modal";
import { OutstandingFeesModal } from "./outstanding-fees-modal";
import { FinancialArrangementModal } from "./financial-arrangement-modal";
import { LeaveRequestModal } from "./leave-request-modal";
import { useGetWalletBalanceQuery } from "@/services/wallet/wallet";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";

interface Props {
  parent: Stakeholders | null;
}

export function QuickActionsCard({ parent }: Props) {
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [outstandingFeesModalOpen, setOutstandingFeesModalOpen] =
    useState(false);
  const [financialArrangementModalOpen, setFinancialArrangementModalOpen] =
    useState(false);
  const [leaveRequestModalOpen, setLeaveRequestModalOpen] = useState(false);

  // const { data: parentData } = useGetParentByUserIdQuery(user?.id ?? "", {
  //   skip: !user?.id || !topUpModalOpen,
  // });
  // const parent = parentData?.data ?? null;
  // console.log(parentData);
  const wards =
    (
      parent as {
        children_details?: Array<{
          id: string;
          user_id: string;
          user?: { first_name?: string; last_name?: string };
          class_assigned?: string | null;
        }>;
      } | null
    )?.children_details ?? [];
  const wardUserId = wards[0]?.user_id;
  const { data: wardWalletData } = useGetWalletBalanceQuery(
    wardUserId ?? undefined,
    {
      skip: !wardUserId || !topUpModalOpen,
    },
  );
  const wardWallet = wardWalletData?.data as
    | { balance?: string; currency?: string }
    | undefined;
  const balanceFormatted =
    wardWallet?.balance != null && wardWallet?.currency
      ? `${wardWallet.currency} ${Number(wardWallet.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
      : "₦0.00";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <QuickActionCard
            title="Top Up Wallet"
            description="Opens the payment modal for instant funding."
            icon={WalletAdd02Icon}
            onClick={() => setTopUpModalOpen(true)}
            className="border-b"
          />
          <QuickActionCard
            title="View Outstanding Fees"
            description="Links directly to the invoice summary in the Fees & Payments module."
            icon={Payment02Icon}
            onClick={() => setOutstandingFeesModalOpen(true)}
            className="border-b"
          />
          <QuickActionCard
            title="Request Fee Discount/Installment"
            description="Links directly to the Fee/Request Portal for formal submission."
            icon={Discount01Icon}
            onClick={() => setFinancialArrangementModalOpen(true)}
            className="border-b"
          />
          <QuickActionCard
            title="Student Leave Request"
            description="Allows parents to formally notify the school and request an excused absence for their child"
            icon={UserIcon}
            onClick={() => setLeaveRequestModalOpen(true)}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <TopUpWalletModal
        open={topUpModalOpen}
        onOpenChange={setTopUpModalOpen}
        wards={wards}
        currentBalance={balanceFormatted}
      />
      <OutstandingFeesModal
        open={outstandingFeesModalOpen}
        totalOutstanding={
          parent?.school_fees.total
            ? parent.school_fees.total.toString()
            : "₦ 0.00"
        }
        onOpenChange={setOutstandingFeesModalOpen}
        parent={parent}
      />
      <FinancialArrangementModal
        open={financialArrangementModalOpen}
        onOpenChange={setFinancialArrangementModalOpen}
      />
      <LeaveRequestModal
        open={leaveRequestModalOpen}
        onOpenChange={setLeaveRequestModalOpen}
      />
    </>
  );
}
