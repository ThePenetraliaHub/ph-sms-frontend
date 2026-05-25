/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/general/huge-icon";
import { cn } from "@/lib/utils";

interface InfoRow {
  field: string;
  content: string | any[];
  status?: "verified" | "pending" | "missing";
}

interface InfoTableProps {
  rows: InfoRow[];
  className?: string;
}

export function InfoTable({ rows, className }: InfoTableProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-main-blue/5">
            <TableHead className="w-[200px]">Form Field</TableHead>
            <TableHead>Content</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-gray-700 border-r">
                {row.field}
              </TableCell>
              <TableCell className="text-gray-600 border-r">
                {row.content}
              </TableCell>
              <TableCell>
                {row.status === "verified" && (
                  <div className="flex items-center gap-2 ">
                    <Icon
                      icon={CheckmarkBadge01Icon}
                      size={20}
                      className="text-green-600"
                    />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
                {row.status === "pending" && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                )}
                {row.status === "missing" && (
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="text-xs font-medium">Missing</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
