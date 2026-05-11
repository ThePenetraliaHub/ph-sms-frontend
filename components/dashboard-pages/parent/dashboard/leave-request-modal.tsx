/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useRef, useEffect } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePickerIcon from "@/components/ui/date-picker";
import { CreateUserRequestRequest } from "@/services/user-requests/user-request-types";
import { useCreateUserRequestMutation } from "@/services/user-requests/user-requests";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { useCreateAttachmentMutation } from "@/services/attachment/attachment";

interface LeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveRequestModal({
  open,
  onOpenChange,
}: LeaveRequestModalProps) {
  const [requestType, setRequestType] = useState("");
  const [leaveStartDate, setLeaveStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [leaveEndDate, setLeaveEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentId, setAttachmentId] = useState<string>();
  const [hasUploadedAttachment, setHasUploadedAttachment] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createUserRequest, { isLoading: isCreatingLeaveReq }] =
    useCreateUserRequestMutation();
  const [createAttachment, { isLoading: isCreatingAttachment }] =
    useCreateAttachmentMutation();
  const user = useAppSelector(selectUser);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setRequestType("");
      setLeaveStartDate(undefined);
      setLeaveEndDate(undefined);
      setReason("");
      setSelectedFile(null);
    }
    onOpenChange(isOpen);
  };

  const formatPeriod = (date: Date | undefined): string => {
    if (!date) return "";
    const formattedStr = new Date(date).toISOString().split("T")[0];
    return formattedStr;
  };

  const handleAttachmentUpload = async () => {
    if (!user) return;
    if (!selectedFile) return toast.error("Invalid file");
    const formData = new FormData();

    formData.append("file", selectedFile as Blob);
    formData.append("school_id", `${user.school_id}`);
    formData.append("type", "others");
    formData.append("name", "leave_request_form");
    try {
      const res = await createAttachment(formData).unwrap();
      if (res.data.id) setAttachmentId(res.data.id);
      setHasUploadedAttachment(true);
    } catch {
      //base api catches error
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleRequestSubmission = async () => {
    if (!leaveStartDate && !leaveEndDate) return;
    const leaveStartDateFormatted = formatPeriod(leaveStartDate);
    const leaveEndDateFormatted = formatPeriod(leaveEndDate);
    if (!user) return;
    if (
      !requestType.trim() ||
      !leaveStartDateFormatted.trim() ||
      !leaveEndDateFormatted.trim() ||
      !reason.trim()
    ) {
      return toast.error("Invalid field(s)");
    }
    try {
      const payload: CreateUserRequestRequest = {
        school_id: user.school_id ?? "",
        title: requestType,
        type: "leave",
        description: reason,
        attachment_id: attachmentId,
        start_date: leaveStartDateFormatted,
        end_date: leaveEndDateFormatted,
      };
      const res = await createUserRequest(payload).unwrap();
      if (res.status) {
        toast.success(res.message ? res.message : "Request Form submitted");
        setHasUploadedAttachment(false);
      }
      handleClose(false);
    } catch (err) {
      console.error("ERROR: ", err);
      return;
    }
  };

  useEffect(() => {
    if (!hasUploadedAttachment) return;
    handleRequestSubmission();
  }, [hasUploadedAttachment]);

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Leave Request Form"
      size="lg"
      footer={
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            disabled={
              isCreatingLeaveReq ||
              isCreatingAttachment ||
              hasUploadedAttachment
            }
            onClick={handleAttachmentUpload}
            className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed ease-in-out transition delay-100"
          >
            Submit Leave Request
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="requestType"
            className="text-sm font-medium text-gray-700"
          >
            Request Type
          </Label>
          <Select value={requestType} onValueChange={setRequestType}>
            <SelectTrigger id="requestType" className="w-full">
              <SelectValue placeholder="Select request type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student-leave">
                Student Leave of Absence
              </SelectItem>
              <SelectItem value="medical-leave">Medical Leave</SelectItem>
              <SelectItem value="emergency-leave">Emergency Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerIcon
            label="Leave Start Date"
            date={leaveStartDate}
            setDate={setLeaveStartDate}
            placeholder="Placeholder"
          />
          <DatePickerIcon
            label="Leave End Date"
            date={leaveEndDate}
            setDate={setLeaveEndDate}
            placeholder="Placeholder"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
            Reason for Absence
          </Label>
          <Textarea
            id="reason"
            placeholder="Detailed explanation of the circumstances necessitating the request."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Attachment Field
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-auto min-h-[60px] py-4 px-4 border-dashed bg-gray-50 hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center w-full text-center">
              {selectedFile ? (
                <span className="text-sm text-gray-600">
                  {selectedFile.name}
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  Upload Supporting Documents (e.g., Medical Bills, Income
                  Proof)
                </span>
              )}
            </div>
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
