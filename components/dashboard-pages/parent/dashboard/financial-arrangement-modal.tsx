/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useRef, useEffect } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateUserRequestRequest } from "@/services/user-requests/user-request-types";
import { useCreateUserRequestMutation } from "@/services/user-requests/user-requests";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { useCreateAttachmentMutation } from "@/services/attachment/attachment";

interface FinancialArrangementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FinancialArrangementModal({
  open,
  onOpenChange,
}: FinancialArrangementModalProps) {
  const [requestType, setRequestType] = useState("");
  const [attachmentId, setAttachmentId] = useState<string>();
  const [hasUploadedAttachment, setHasUploadedAttachment] =
    useState<boolean>(false);
  const [justification, setJustification] = useState("");
  const [proposedPlan, setProposedPlan] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createUserRequest, { isLoading: isCreatingFinReq }] =
    useCreateUserRequestMutation();
  const [createAttachment, { isLoading: isCreatingAttachment }] =
    useCreateAttachmentMutation();
  const user = useAppSelector(selectUser);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setRequestType("");
      setJustification("");
      setProposedPlan("");
      setSelectedFile(null);
    }
    onOpenChange(isOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleAttachmentUpload = async () => {
    if (!user) return;
    if (!selectedFile) return toast.error("Invalid file");
    const formData = new FormData();

    formData.append("file", selectedFile as Blob);
    formData.append("school_id", `${user.school_id}`);
    formData.append("name", "financial_arrangement_request");
    try {
      const res = await createAttachment(formData).unwrap();
      if (res.data.id) setAttachmentId(res.data.id);
      setHasUploadedAttachment(true);
    } catch {
      //base api catches error
    }
  };

  const handleRequestSubmission = async () => {
    //AFTER FILE MUST HAVE BEEN UPLOADED SUCCESFULLY TO ATTACHMENTS
    if (!user) return;
    if (!requestType.trim() || !justification.trim() || !proposedPlan.trim()) {
      return toast.error("Invalid field(s)");
    }
    if (!attachmentId) return toast.error("File not found!");
    try {
      const payload: CreateUserRequestRequest = {
        school_id: user.school_id ?? "",
        title: proposedPlan,
        type: "others",
        description: justification,
        attachment_id: attachmentId,
      };
      const res = await createUserRequest(payload).unwrap();
      if (res.status) {
        toast.success(
          res.message
            ? res.message
            : "New Financial Arrangement Request created successfully",
        );
        //reset upload document with id flag
        setHasUploadedAttachment(false);
      }
      //close modal
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
      title="New Financial Arrangement Request"
      size="xl"
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
              isCreatingFinReq || isCreatingAttachment || hasUploadedAttachment
            }
            onClick={handleAttachmentUpload}
            className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Request to Bursar
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
              <SelectValue placeholder="Dropdown Select: Fee Discount / Installment Plan / Late Payment Extension" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fee-discount">Fee Discount</SelectItem>
              <SelectItem value="installment-plan">Installment Plan</SelectItem>
              <SelectItem value="late-payment-extension">
                Late Payment Extension
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="justification"
            className="text-sm font-medium text-gray-700"
          >
            Justification
          </Label>
          <Textarea
            id="justification"
            placeholder="Detailed explanation of the circumstances necessitating the request."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="proposedPlan"
            className="text-sm font-medium text-gray-700"
          >
            Proposed Plan
          </Label>
          <Input
            id="proposedPlan"
            type="text"
            placeholder="Text Input: e.g., Pay in three equal installments by Jan 30, Mar 30, May 30."
            value={proposedPlan}
            onChange={(e) => setProposedPlan(e.target.value)}
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
