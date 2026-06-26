"use client";

import { useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";

interface Invoice {
  id: string;
  name: string;
  amount: string;
}

interface OutstandingFeesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalOutstanding?: string;
  invoices?: Invoice[];
  parent: Stakeholders | null;
}

const defaultInvoices: Invoice[] = [
  {
    id: "1",
    name: "Tuition Fee (Term 2)",
    amount: "₦ 200,000.00",
  },
  {
    id: "2",
    name: "Extracurricular Activities",
    amount: "₦ 50,000.00",
  },
];

export function OutstandingFeesModal({
  open,
  onOpenChange,
  totalOutstanding = "₦ 0.00",
  invoices = defaultInvoices,
  parent,
}: OutstandingFeesModalProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set(),
  );
  const handleToggleInvoice = (invoiceId: string) => {
    setSelectedInvoices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log("Download invoice:", invoiceId);
  };

  const handlePayFees = () => {
    console.log("Pay outstanding fees");
    onOpenChange(false);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={onOpenChange}
      title="Outstanding School Fees"
      size="xl"
      footer={
        <div
          className={`gap-2 w-full ${parent?.school_fees?.total ? "grid grid-cols-2" : "hidden"}`}
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handlePayFees} className="flex-1">
            Pay Outstanding Fees
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Total Outstanding Fees Due
          </Label>
          <Input
            value={totalOutstanding}
            readOnly
            className="bg-gray-100 cursor-not-allowed rounded-md"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            List of all active invoices:
          </Label>
          {parent?.school_fees?.total ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-main-blue/5">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedInvoices.size === invoices.length &&
                          invoices.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedInvoices(
                              new Set(invoices.map((inv) => inv.id)),
                            );
                          } else {
                            setSelectedInvoices(new Set());
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Invoice</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedInvoices.has(invoice.id)}
                          onCheckedChange={() =>
                            handleToggleInvoice(invoice.id)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.name}
                      </TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-main-blue underline"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          Download Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="w-full text-muted-foreground text-sm border rounded-lg p-5 text-center">
              No active invoices.
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  );
}
