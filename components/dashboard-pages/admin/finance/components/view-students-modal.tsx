"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import Link from "next/link";
import { useLazyGetStakeholderByIdQuery } from "@/services/stakeholders/stakeholders";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import type { FeeAgeingStudentSnapshot } from "@/services/transactions/transaction-types";
import type { ApiResponse } from "@/services/shared-types";
import { Spinner } from "@/components/ui/spinner";

interface Student {
  id: string;
  name: string;
  studentId: string;
  daysOverdue: number;
  overdueAmount: number;
  primaryContactName: string;
  primaryContactNumber: string;
  latestPayment: string;
}

interface ViewStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: string;
  /** Students returned on the fee-ageing row; each is refreshed by stakeholder fetch when possible. */
  stakeholdersSeed?: FeeAgeingStudentSnapshot[];
}

function formatName(s: Stakeholders): string {
  const u = s.user;
  if (!u) return "Unknown";
  return `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unknown";
}

function snapshotToRow(s: FeeAgeingStudentSnapshot): Student {
  const primary = s.primary_contact?.user;
  const primaryName = primary
    ? `${primary.first_name || ""} ${primary.last_name || ""}`.trim()
    : s.parent_name || "—";
  const phone = s.emergency_contact_and_phone || primary?.phone_number || "—";

  return {
    id: s.id,
    name: formatName(s),
    studentId: (s.admission_number || "").trim() || s.id,
    daysOverdue: s.days_overdue ?? 0,
    overdueAmount: s.overdue_amount ?? 0,
    primaryContactName: primaryName,
    primaryContactNumber: String(phone),
    latestPayment: s.latest_payment?.trim() || "—",
  };
}

function mergeSnapshot(
  fetched: Stakeholders,
  seed: FeeAgeingStudentSnapshot,
): FeeAgeingStudentSnapshot {
  const F = fetched as FeeAgeingStudentSnapshot;
  return {
    ...fetched,
    days_overdue: seed.days_overdue ?? F.days_overdue,
    overdue_amount: seed.overdue_amount ?? F.overdue_amount,
    latest_payment: seed.latest_payment ?? F.latest_payment,
  };
}

export function ViewStudentsModal({
  open,
  onOpenChange,
  period,
  stakeholdersSeed,
}: ViewStudentsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<Student[]>([]);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "success" | "empty" | "error"
  >("idle");

  const [fetchStakeholderById] = useLazyGetStakeholderByIdQuery();

  const idsKey = useMemo(
    () => (stakeholdersSeed ?? []).map((s) => s.id).join("|"),
    [stakeholdersSeed],
  );

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setRows([]);
      setLoadState("idle");
      return;
    }

    const seeds = stakeholdersSeed ?? [];
    if (seeds.length === 0) {
      setRows([]);
      setLoadState("empty");
      return;
    }

    let cancelled = false;
    setLoadState("loading");

    (async () => {
      try {
        const merged = await Promise.all(
          seeds.map(async (seed) => {
            try {
              const res = (await fetchStakeholderById(
                seed.id,
              ).unwrap()) as ApiResponse<Stakeholders>;
              const data = res?.data ?? null;
              if (!data) return seed;
              return mergeSnapshot(data, seed);
            } catch {
              return seed;
            }
          }),
        );
        if (cancelled) return;
        setRows(merged.map(snapshotToRow));
        setLoadState("success");
      } catch {
        if (!cancelled) {
          setRows(seeds.map(snapshotToRow));
          setLoadState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, idsKey, fetchStakeholderById]);

  const filteredStudents = rows.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.primaryContactName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.primaryContactNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={onOpenChange}
      title={`View Students: ${period}`}
      size="5xl"
      contentClassName="flex flex-col"
    >
      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        <div className="relative">
          <Input
            placeholder="Search by name, ID, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-5 text-sm text-gray-600">
          <div className="border px-4 py-2 rounded-md">
            <span>
              Total number of students:{" "}
              <span className="font-semibold">
                {rows.length} student{rows.length !== 1 ? "s" : ""}{" "}
              </span>
            </span>
          </div>
          <div className="border px-4 py-2 rounded-md">
            <span>
              Total amount:{" "}
              <span className="font-semibold text-gray-800">
                {formatCurrency(
                  filteredStudents.reduce((sum, s) => sum + s.overdueAmount, 0),
                )}
              </span>
            </span>
          </div>
        </div>
        <div className="relative border rounded-lg overflow-hidden flex-1 overflow-y-auto">
          {loadState === "loading" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60">
              <Spinner className="size-8 text-main-blue" />
            </div>
          )}
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="bg-main-blue/5">
                <TableHead>Full Name + School ID</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Overdue Amount</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Latest Payment</TableHead>
                <TableHead className="w-12">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "empty" ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-gray-500"
                  >
                    No students are linked to this ageing period in the current
                    report.
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 && loadState !== "loading" ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-gray-500"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="flex flex-col gap-1 font-medium text-xs border-r">
                      <span>{student.name}</span>
                      <span className="text-muted-foreground">
                        ({student.studentId})
                      </span>
                    </TableCell>
                    <TableCell className="text-xs border-r">
                      {student.daysOverdue} Days
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800 text-xs border-r">
                      {formatCurrency(student.overdueAmount)}
                    </TableCell>
                    <TableCell className="flex flex-col gap-1 text-xs border-r">
                      <span>{student.primaryContactName}</span>
                      <span className="text-muted-foreground">
                        {student.primaryContactNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs border-r">
                      {student.latestPayment}
                    </TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="text-main-blue hover:underline text-sm"
                      >
                        Send Reminder
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ModalContainer>
  );
}
