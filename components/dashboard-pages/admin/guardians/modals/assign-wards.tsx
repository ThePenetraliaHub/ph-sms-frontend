"use client";
import { Button } from "@/components/ui/button";
import { DataTable, TableColumn } from "@/components/ui/data-table";
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
import { Dispatch, SetStateAction, useState } from "react";
import { usePagination } from "@/hooks/use-pagination";
// import { Pagination } from "@/common/types";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/utils/helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
// import { toast } from "sonner";
import { Parent, Ward } from "@/app/(dashboard)/admin/guardians/page";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wardIds: string[];
  setWardIds: Dispatch<SetStateAction<string[]>>;
  setSelectedParent: Dispatch<SetStateAction<Parent | undefined>>;
  setParWardsOnSel: Dispatch<SetStateAction<string[]>>;
  wards: Ward[];
  isLoading: boolean;
  isError: boolean;
  parentName: string;
  assignWards: () => Promise<string | number | undefined>;
  isLinkingChildToParent: boolean;
}

export default function AssignWards({
  onOpenChange,
  open,
  wards,
  wardIds,
  setWardIds,
  setSelectedParent,
  setParWardsOnSel,
  assignWards,
  isLoading,
  isError,
  parentName,
  isLinkingChildToParent,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  //handle modal close
  const handleCancel = () => {
    onOpenChange(false);
    setWardIds([]);
    setParWardsOnSel([]);
    setSelectedParent(undefined);
  };

  //add/remove question from list
  const toggleWardToArr = (selectedWardId: string, checked: CheckedState) => {
    if (!checked) {
      setWardIds((prev) => [...prev.filter((item) => item !== selectedWardId)]);
      return;
    }

    //add ward to list
    setWardIds((prev) => [...prev, selectedWardId]);
  };

  //resolve checked state
  const checkWard = (id: string): boolean => {
    const wardId = wardIds.some((item) => item === id);
    if (wardId) return true;
    return false;
  };

  //handle question addition
  const columns: TableColumn<Ward>[] = [
    {
      key: "",
      title: "",
      render: (value, row) => (
        <span className="text-gray-700">
          <Checkbox
            onCheckedChange={(checked) => toggleWardToArr(row.id, checked)}
            checked={checkWard(row.id)}
          />
        </span>
      ),
    },
    {
      key: "first_name",
      title: "First Name",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "last_name",
      title: "Last Name",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "email",
      title: "email",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "class_assigned",
      title: "Class Assigned",
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
    {
      key: "dateJoined",
      title: "Date Joined",
      render: (value: string) => (
        <span className="text-gray-700">{value.split("T")[0]}</span>
      ),
    },
  ];

  const filteredWards = wards.filter((ward) => {
    const matchesSearch =
      !searchQuery ||
      ward.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ward.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ward?.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const {
    displayedData: questions,
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
      title={`Assign Students to ${parentName}`}
      onOpenChange={handleCancel}
      className="max-h-[400px] overflow-y-scroll"
      size="3xl"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            className="h-9 disabled:opacity-70"
            disabled={isLinkingChildToParent}
            variant={"outline"}
            onClick={handleCancel}
          >
            Close
          </Button>
          <Button
            className="h-9 disabled:opacity-70"
            disabled={isLinkingChildToParent}
            variant={"default"}
            onClick={assignWards}
          >
            {isLinkingChildToParent ? "Assigning..." : "Assign Wards"}
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
          isLoading={isLoading}
          emptyMessage={
            isError
              ? "Failed to load students"
              : "No students registered in this school yet."
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
