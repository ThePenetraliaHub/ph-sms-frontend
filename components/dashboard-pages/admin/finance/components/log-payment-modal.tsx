"use client";

import { useMemo, useState, Dispatch, SetStateAction } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DatePickerIcon from "@/components/ui/date-picker";
import { Search } from "lucide-react";
import { SelectItem } from "@/components/ui/select";

import { useAppSelector } from "@/store/hooks";
import { selectSchoolID } from "@/store/slices/schoolSlice";
import { useCreateTransactionMutation } from "@/services/transactions/transactions";
import { useGetAllStudentsQuery } from "@/services/stakeholders/stakeholders";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { toast } from "sonner";

const initialData = {
  searchQuery: "",
  payerName: "",
  paymentDate: undefined as Date | undefined,
  paymentMethod: "",
  transactionRef: "",
  amountReceived: "",
  isOutstandingBalance: false,
  isVerified: false,
  sendReceipt: false,
};

function getStudentDisplayName(s: Stakeholders): string {
  const u = s.user;
  if (!u) return "Unknown student";
  return (
    `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unknown student"
  );
}

function formatStudentOption(s: Stakeholders): string {
  const name = getStudentDisplayName(s);
  const idLabel = s.admission_number?.trim() || s.id;
  return `${name} · ${idLabel}`;
}

interface LogPaymentForm {
  searchQuery: string;
  payerName: string;
  paymentDate: Date | undefined;
  paymentMethod: string;
  transactionRef: string;
  amountReceived: string;
  isOutstandingBalance: boolean;
  isVerified: boolean;
  sendReceipt: boolean;
}

interface LogPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogPaymentModal({ open, onOpenChange }: LogPaymentModalProps) {
  const schoolID = useAppSelector(selectSchoolID);
  const [formData, setFormData] = useState<LogPaymentForm>(initialData);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<
    string | null
  >(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const { data: studentsResponse, isFetching: isLoadingStudents } =
    useGetAllStudentsQuery(undefined, { skip: !open });

  const [createTransaction, { isLoading }] = useCreateTransactionMutation();

  const studentsInSchool = useMemo(() => {
    const list = studentsResponse?.data ?? [];
    if (!schoolID) return list;
    return list.filter((s) => String(s.school_id) === String(schoolID));
  }, [studentsResponse?.data, schoolID]);

  const searchTrim = formData.searchQuery.trim();
  const normalizedQuery = searchTrim.toLowerCase();

  const matchingStudents = useMemo(() => {
    if (!normalizedQuery) return [];
    return studentsInSchool
      .filter((s) => {
        const name = getStudentDisplayName(s).toLowerCase();
        const admission = (s.admission_number || "").toLowerCase();
        const sid = s.id.toLowerCase();
        return (
          name.includes(normalizedQuery) ||
          admission.includes(normalizedQuery) ||
          sid.includes(normalizedQuery)
        );
      })
      .slice(0, 25);
  }, [studentsInSchool, normalizedQuery]);

  const showLoadingDropdown =
    suggestionsOpen && searchTrim.length > 0 && isLoadingStudents;

  const showSuggestions =
    suggestionsOpen &&
    searchTrim.length > 0 &&
    !isLoadingStudents &&
    matchingStudents.length > 0;

  const showNoResults =
    suggestionsOpen &&
    searchTrim.length > 0 &&
    !isLoadingStudents &&
    matchingStudents.length === 0;

  const handleDateChange: Dispatch<SetStateAction<Date | undefined>> = (
    date,
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentDate: typeof date === "function" ? date(prev.paymentDate) : date,
    }));
  };

  const selectStudent = (s: Stakeholders) => {
    setSelectedStakeholderId(s.id);
    setFormData((prev) => ({
      ...prev,
      searchQuery: formatStudentOption(s),
      payerName: getStudentDisplayName(s),
    }));
    setSuggestionsOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedStakeholderId) {
      toast.error("Please select a student from the search results.");
      return;
    }
    const amount = parseFloat(formData.amountReceived);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!schoolID) {
      toast.error("School context is missing.");
      return;
    }

    const payload = {
      school_id: schoolID,
      stakeholder_id: selectedStakeholderId,
      amount,
    };

    try {
      await createTransaction(payload).unwrap();
      toast.success("Payment logged successfully.");
      setFormData(initialData);
      setSelectedStakeholderId(null);
      onOpenChange(false);
    } catch (error) {}
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormData(initialData);
      setSelectedStakeholderId(null);
      setSuggestionsOpen(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Log Payment (Manual Entry)"
      size="2xl"
    >
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="search-account" className="text-sm font-medium">
            Search Student Account
          </Label>
          <div className="relative">
            <Input
              id="search-account"
              placeholder="Search by student name or student ID"
              value={formData.searchQuery}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedStakeholderId(null);
                setFormData((prev) => ({
                  ...prev,
                  searchQuery: v,
                  payerName: "",
                }));
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setSuggestionsOpen(false), 150);
              }}
              autoComplete="off"
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            {showLoadingDropdown && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2.5 text-sm text-muted-foreground shadow-md">
                Loading students…
              </div>
            )}
            {showSuggestions && (
              <ul
                className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
                role="listbox"
              >
                {matchingStudents.map((s) => (
                  <li key={s.id} role="option">
                    <button
                      type="button"
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectStudent(s)}
                    >
                      <span className="font-medium text-foreground">
                        {getStudentDisplayName(s)}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        ID: {s.admission_number?.trim() || s.id}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showNoResults && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2.5 text-sm text-muted-foreground shadow-md">
                No students match this search.
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Type a name, admission number, or stakeholder ID; pick a row from
            the list.
          </p>
        </div>

        <InputField
          label="Payer/Student Name"
          placeholder="Pre-filled after search"
          value={formData.payerName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, payerName: e.target.value }))
          }
          disabled
        />

        <DatePickerIcon
          label="Date of Payment"
          date={formData.paymentDate}
          setDate={handleDateChange}
          open={datePickerOpen}
          setOpen={setDatePickerOpen}
          placeholder="mm/dd/yy"
        />

        <SelectField
          label="Payment Method"
          value={formData.paymentMethod}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, paymentMethod: value }))
          }
          placeholder="placeholder"
        >
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
          <SelectItem value="pos">POS Card</SelectItem>
          <SelectItem value="cheque">Cheque</SelectItem>
          <SelectItem value="online">Online Payment</SelectItem>
        </SelectField>

        <InputField
          label="Amount Received (₦)"
          placeholder="placeholder"
          type="number"
          value={formData.amountReceived}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              amountReceived: e.target.value,
            }))
          }
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center gap-2">
            <div className="space-y-1">
              <Label
                htmlFor="outstanding-balance"
                className="text-sm font-normal cursor-pointer"
              >
                Payment for an Outstanding Balance
              </Label>
              <p className="text-xs text-gray-600">
                Payment for the student&apos;s current debt.
              </p>
            </div>
            <Checkbox
              id="outstanding-balance"
              checked={formData.isOutstandingBalance}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isOutstandingBalance: checked === true,
                }))
              }
            />
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          <Label
            htmlFor="verified"
            className="text-sm font-normal cursor-pointer"
          >
            I verify this amount has been deposited/verified by the Finance
            Team.
          </Label>
          <Checkbox
            id="verified"
            checked={formData.isVerified}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                isVerified: checked === true,
              }))
            }
          />
        </div>

        <div className="flex justify-between items-center gap-2">
          <Label
            htmlFor="send-receipt"
            className="text-sm font-normal cursor-pointer"
          >
            Send Payment Confirmation Receipt to Parent/Payer.
          </Label>
          <Checkbox
            id="send-receipt"
            checked={formData.sendReceipt}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                sendReceipt: checked === true,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isLoading ? "Loading..." : "Log Payment"}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
