"use client";

import { useState, useMemo } from "react";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import { Eye, EyeOff } from "lucide-react";
import { WalletAdd02Icon, Download02Icon } from "@hugeicons/core-free-icons";
import { TopUpWalletModal } from "@/components/dashboard-pages/parent/top-up-wallet-modal";
import { usePagination } from "@/hooks/use-pagination";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { useGetParentByUserIdQuery } from "@/services/stakeholders/stakeholders";
import { useGetWalletBalanceQuery } from "@/services/wallet/wallet";
import { useGetTransactionsQuery } from "@/services/transactions/transactions";
import {
  mapTransactionsToRows,
  type WalletTransactionRow,
} from "@/lib/student-wallet-utils";
import type { Transaction as ApiTransaction } from "@/services/transactions/transaction-types";
import type { SkChildDetails } from "@/services/stakeholders/stakeholder-types";

export default function WalletPage() {
  const user = useAppSelector(selectUser);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

  const { data: parentData } = useGetParentByUserIdQuery(user?.id ?? "", {
    skip: !user?.id,
  });
  const parent = parentData?.data ?? null;
  const wards: SkChildDetails[] = parent?.children_details ?? [];
  const primaryWard = wards[0] ?? null;
  const wardUserId = primaryWard?.id ?? null;
  const wardName = primaryWard?.full_name;

  const { data: wardWalletData, refetch: refetchWardWallet } =
    useGetWalletBalanceQuery(wardUserId ?? undefined, { skip: !wardUserId });
  const wardWallet = wardWalletData?.data as
    | { balance?: string; currency?: string }
    | undefined;
  const balanceFormatted =
    wardWallet?.balance != null && wardWallet?.currency
      ? `${wardWallet.currency} ${Number(wardWallet.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
      : "₦0.00";
  const { data: transactionsData, refetch: refetchTx } =
    useGetTransactionsQuery(
      wardUserId ? { _all: "true", user_id: wardUserId } : { _all: "true" },
      { skip: !wardUserId },
    );
  const apiTransactions = (transactionsData?.data ?? []) as ApiTransaction[];
  const allTransactions = useMemo(
    () => mapTransactionsToRows(apiTransactions, wardWallet?.balance ?? "0"),
    [apiTransactions, wardWallet?.balance],
  );

  const {
    displayedData: transactions,
    hasMore,
    loadMore,
  } = usePagination({
    data: allTransactions,
    initialItemsPerPage: 5,
    itemsPerPage: 5,
  });

  const getAmountColor = (row: WalletTransactionRow) =>
    row.isDebit ? "text-red-600" : "text-green-600";

  const columns: TableColumn<WalletTransactionRow>[] = [
    { key: "dateTime", title: "Date/Time" },
    { key: "transactionType", title: "Transaction Type" },
    { key: "itemSource", title: "Item/Source" },
    {
      key: "amount",
      title: "Amount",
      render: (_, row) => (
        <span className={`text-sm font-medium ${getAmountColor(row)}`}>
          {row.amount}
        </span>
      ),
    },
    { key: "runningBalance", title: "Running Balance" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {wardName}&apos;s Wallet (Canteen/Payments)
        </h1>
        <p className="text-gray-600">
          Monitor your ward&apos;s spending and top up their wallet.
        </p>
      </div>

      <div className="bg-main-blue text-white rounded-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-white/80 mb-1">Wallet Balance</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-white">
                  {balanceVisible ? balanceFormatted : "••••••"}
                </p>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setTopUpModalOpen(true)}
              className="bg-white text-main-blue hover:bg-gray-100 flex items-center gap-2"
            >
              <Icon icon={WalletAdd02Icon} size={18} />
              Top Up Wallet
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Transaction History
          </h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Icon icon={Download02Icon} size={18} />
            Print Statement
          </Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={transactions}
            showActionsColumn={false}
          />
        </div>
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>

      <TopUpWalletModal
        open={topUpModalOpen}
        onOpenChange={setTopUpModalOpen}
        wards={wards}
        currentBalance={balanceFormatted}
        onSuccess={() => {
          refetchWardWallet();
          refetchTx();
        }}
      />
    </div>
  );
}
