"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DatePickerIcon from "@/components/ui/date-picker";
import { SelectItem } from "@/components/ui/select";

import { useAppSelector } from "@/store/hooks";
import { selectSchoolID } from "@/store/slices/schoolSlice";
import { useGetAllStudentsQuery } from "@/services/stakeholders/stakeholders";
import {
  useRecordManualPaymentMutation,
  useViewStudentFeesQuery,
} from "@/services/schools/schools";
import {
  RecordManualPaymentPayload,
  ViewStudentFeeStructure,
} from "@/services/schools/schools-type";
import { toast } from "sonner";
import { format } from "date-fns";

interface LogPaymentForm {
  student_id: string;
  amount: number;
  fee_ids: string;
  payment_method: string;
  bank_name: string;
  teller_number: string;
  deposit_date: string;
  notes: string;
}

const initialData: LogPaymentForm = {
  student_id: "",
  amount: 0,
  fee_ids: "",
  payment_method: "",
  bank_name: "",
  teller_number: "",
  deposit_date: "",
  notes: "",
};

interface LogPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogPaymentModal({ open, onOpenChange }: LogPaymentModalProps) {
  const schoolID = useAppSelector(selectSchoolID);
  const [formData, setFormData] = useState<LogPaymentForm>(initialData);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [selStudId, setSelStudId] = useState<string>();

  //log payment
  const [logPayment, { isLoading: isRecordingPayment }] =
    useRecordManualPaymentMutation();

  //all students
  const { data: studentsResponse, isFetching: isLoadingStudents } =
    useGetAllStudentsQuery(undefined, { skip: !open });

  const studentsInSchool = useMemo(() => {
    const list = studentsResponse?.data ?? [];
    if (!schoolID) return list;
    return list.filter((s) => String(s.school.id) === String(schoolID));
  }, [studentsResponse?.data, schoolID]);

  console.log(studentsInSchool);

  //figuring out students fees
  const { data: studentFeesData, isLoading: isFetchingStudentFees } =
    useViewStudentFeesQuery(
      { student_id: selStudId ?? "" },
      { skip: !selStudId || !selStudId.trim() },
    );

  const student_fee_records: ViewStudentFeeStructure[] = useMemo(() => {
    if (!studentFeesData?.data) return [] as ViewStudentFeeStructure[];
    const feeslist = studentFeesData?.data.fees;
    if (!feeslist) return [] as ViewStudentFeeStructure[];
    const unpaid_fees = feeslist.filter((fee) => fee.status === "unpaid");
    return unpaid_fees;
  }, [studentFeesData]);

  const handleSubmit = async () => {
    //run validations
    if (!isVerified) return toast.error("Please tick the verified checkbox");
    if (isNaN(Number(formData.amount))) return toast.error("Invalid amount");
    if (!formData.bank_name.trim() || !formData.teller_number.trim())
      return toast.error("Invalid bank details");

    //construct payload
    const {
      student_id,
      amount,
      fee_ids,
      payment_method,
      bank_name,
      teller_number,
      deposit_date,
      notes,
    } = formData;
    const payment: RecordManualPaymentPayload = {
      student_id,
      amount: Number(amount),
      fee_ids: [fee_ids],
      payment_method,
      bank_name,
      teller_number,
      deposit_date,
      notes: notes.trim() ? notes : undefined,
    };

    //fire endpoint
    try {
      const res = await logPayment(payment).unwrap();
      console.log("Response: ", res);
    } catch {}
  };

  const handleClose = (open: boolean) => {
    if (isRecordingPayment) return;
    if (!open) {
      setFormData(initialData);
      setDate(undefined);
      setIsVerified(false);
    }
    onOpenChange(open);
  };

  //track date changes
  useEffect(() => {
    if (!date) return;
    const formattedDate = format(date, "yyyy-MM-dd");
    setFormData((prev) => ({ ...prev, deposit_date: formattedDate }));
  }, [date]);

  //track amount changes
  useEffect(() => {
    if (!formData.fee_ids) return;
    const selectedFee = student_fee_records.find(
      (fee) => fee.id === formData.fee_ids,
    );
    if (!selectedFee) return;
    setFormData((prev) => ({
      ...prev,
      amount: Number(selectedFee.amount_owed),
    }));
  }, [formData.fee_ids]);

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Log Payment (Manual Entry)"
      size="2xl"
    >
      <div className="space-y-6 py-4 max-h-[500px] lg:max-h-[500px]">
        {/* student */}
        <SelectField
          label="Select Student *"
          value={formData.student_id}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, student_id: value }));
            setSelStudId(value);
          }}
          disabled={isLoadingStudents}
          placeholder="Select student"
        >
          {studentsInSchool.map((student, index) => {
            return (
              <SelectItem key={index} value={student.id}>
                {student.full_name ?? ""}
              </SelectItem>
            );
          })}
        </SelectField>

        {/* fee */}
        <SelectField
          label="Select Fee *"
          disabled={
            isLoadingStudents ||
            studentsInSchool.length === 0 ||
            isFetchingStudentFees
          }
          value={formData.fee_ids}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, fee_ids: value }))
          }
          placeholder="Select fee"
        >
          {student_fee_records.map((fee, index) => {
            return (
              <SelectItem key={index} value={fee.id}>
                {fee.fee_name}
              </SelectItem>
            );
          })}
        </SelectField>

        {/* date of payment */}
        <DatePickerIcon
          label="Date of Payment *"
          date={date}
          setDate={setDate}
          open={datePickerOpen}
          setOpen={setDatePickerOpen}
          placeholder="mm/dd/yy"
        />

        {/* payment method */}
        <SelectField
          label="Payment Method *"
          value={formData.payment_method}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, payment_method: value }))
          }
          placeholder="placeholder"
        >
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          <SelectItem value="bank_deposit">Bank Deposit</SelectItem>
          <SelectItem value="pos">POS Machine</SelectItem>
          <SelectItem value="online_banking">Online Banking</SelectItem>
        </SelectField>

        {/* bank name */}
        <InputField
          label="Bank Name *"
          placeholder="Enter bank"
          type="text"
          value={formData.bank_name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              bank_name: e.target.value,
            }))
          }
        />

        {/* teller number */}
        <InputField
          label="Teller Number *"
          placeholder="Enter number"
          type="text"
          value={formData.teller_number}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              teller_number: e.target.value,
            }))
          }
        />

        {/* amount received */}
        <InputField
          label="Fee Amount (₦) *"
          placeholder="placeholder"
          type="number"
          className="cursor-not-allowed"
          value={formData.amount}
          readOnly
          // onChange={(e) =>
          //   setFormData((prev) => ({
          //     ...prev,
          //     amount: e.target.value,
          //   }))
          // }
        />

        {/* notes */}
        <TextareaField
          label="Notes"
          placeholder="Enter notes"
          className="resize-none h-30"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
        />

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
            checked={isVerified}
            onCheckedChange={(checked) => setIsVerified(checked ? true : false)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              !formData.student_id ||
              !formData.fee_ids ||
              !date ||
              !formData.payment_method ||
              !formData.bank_name.trim() ||
              !formData.teller_number.trim() ||
              !formData.amount ||
              !isVerified ||
              isRecordingPayment
            }
            onClick={handleSubmit}
          >
            {isRecordingPayment ? "Loading..." : "Log Payment"}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
