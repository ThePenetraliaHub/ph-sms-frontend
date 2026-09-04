"use client";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  TableAction,
  TableColumn,
} from "@/components/ui/data-table";
import { ModalContainer } from "@/components/ui/modal-container";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { usePagination } from "@/hooks/use-pagination";
// import { Pagination } from "@/common/types";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/utils/helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
// import { toast } from "sonner";
import { Parent } from "@/app/(dashboard)/admin/guardians/page";
import { SkChildDetails } from "@/services/stakeholders/stakeholder-types";
import { Icon } from "@/components/general/huge-icon";
import { Delete01FreeIcons, ViewIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";

interface Ward {
  full_name: string;
  id: string;
  status: string;
  has_outstanding: boolean;
  total_fees: number;
  total_owed: number;
  total_paid: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setSelectedParent: Dispatch<SetStateAction<Parent | undefined>>;
  selectedParent: Parent | undefined;
  isLoading: boolean;
  isError: boolean;
  removeWard: (id: string) => Promise<void>;
}

export default function ViewWards({
  onOpenChange,
  open,
  setSelectedParent,
  selectedParent,
  isLoading,
  isError,
  removeWard,
}: Props) {
  const { push } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  //handle modal close
  const handleCancel = () => {
    if (isLoading) return;
    onOpenChange(false);
    setSelectedParent(undefined);
  };

  const wards: Ward[] = useMemo(() => {
    if (!selectedParent?.children_details) return [] as Ward[];
    const red_arr: Ward[] = selectedParent.children_details.map((child) => ({
      full_name: child.full_name,
      id: child.id,
      status: child.status,
      has_outstanding: child.fee_summary.has_outstanding,
      total_fees: child.fee_summary.total_fees,
      total_owed: child.fee_summary.total_owed,
      total_paid: child.fee_summary.total_paid,
    }));
    return red_arr;
  }, [selectedParent]);

  const columns: TableColumn<Ward>[] = [
    {
      key: "full_name",
      title: "Full Name",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "has_outstanding",
      title: "Has Outstanding",
      render: (value, row) => (
        <span className="text-gray-700">
          {row.has_outstanding ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "total_fees",
      title: "Tot. Fees",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "total_owed",
      title: "Tot. Fees Owed",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "total_paid",
      title: "Tot. Fees Paid",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span className={cn("text-sm capitalize", getStatusColor(value))}>
          {value as string}
        </span>
      ),
    },
  ];

  const actions: TableAction<Ward>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View student profile",
            onClick: (row) => push(`/admin/students/${row.id}`),
            icon: <Icon icon={ViewIcon} size={16} />,
          },
          {
            separator: true,
            label: "Remove Child",
            onClick: (row) => removeWard(row.id),
            variant: "destructive",
            icon: <Icon icon={Delete01FreeIcons} size={16} />,
          },
        ],
      },
    },
  ];

  const filteredWards = wards.filter((ward) => {
    const matchesSearch =
      !searchQuery ||
      ward.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ward.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ward?.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const {
    displayedData: children,
    hasMore,
    loadMore,
  } = usePagination({
    data: filteredWards,
    initialItemsPerPage: 4,
    itemsPerPage: 4,
  });

  return (
    <ModalContainer
      open={open}
      title={`View Wards of ${selectedParent?.last_name} ${selectedParent?.first_name}`}
      onOpenChange={handleCancel}
      className="max-h-[400px] overflow-y-scroll"
      size="3xl"
      footer={
        <div className={`grid gap-3 w-full ${isLoading ? "grid-cols-2" : "grid-cols-1"}`}>
          <Button
            className="h-9 disabled:opacity-70"
            disabled={isLoading}
            variant={"outline"}
            onClick={handleCancel}
          >
            Close
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        Click as many as you want to add
      </p>
      <div className="flex items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by names or email"
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter: Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* data table */}
      <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredWards}
          actions={actions}
          showActionsColumn={true}
          isLoading={isLoading}
          emptyMessage={
            isError
              ? "Failed to load students"
              : "No assigned students to this parent"
          }
        />
      </div>
      {/* load more button */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </ModalContainer>
  );
}
