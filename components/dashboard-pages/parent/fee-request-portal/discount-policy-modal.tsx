"use client";

import { ModalContainer } from "@/components/ui/modal-container";
import { DataTable, TableColumn } from "@/components/ui/data-table";

interface PolicySection {
  formField: string;
  content: string;
}

interface DiscountPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const policySections: PolicySection[] = [
  {
    formField: "Section 1: Sibling Discount",
    content:
      "Criteria: 5% reduction for the second child, 10% for the third, if all are enrolled concurrently.",
  },
  {
    formField: "Section 2: Hardship Discount",
    content:
      "Process: Requires formal submission via the portal, along with documentary proof of income change (e.g., job loss letter, medical certificate).",
  },
  {
    formField: "Section 3: Installment Plans",
    content:
      "Policy: Available only for Tuition Fees. A maximum of 3 installments is allowed per term, with a 2% administrative fee applied to the remaining balance.",
  },
];

export function DiscountPolicyModal({
  open,
  onOpenChange,
}: DiscountPolicyModalProps) {
  const columns: TableColumn<PolicySection>[] = [
    {
      key: "formField",
      title: "Form Field",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "content",
      title: "Content",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
  ];

  return (
    <ModalContainer
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="pr-8">
          Official School Fee Discount & Installment Policy (2025/2026)
        </div>
      }
      size="2xl"
    >
      <div className="border rounded-lg overflow-x-auto max-h-[60vh]">
        <DataTable
          columns={columns}
          data={policySections}
          showActionsColumn={false}
          className="w-full"
          tableClassName="min-w-full"
        />
      </div>
    </ModalContainer>
  );
}
