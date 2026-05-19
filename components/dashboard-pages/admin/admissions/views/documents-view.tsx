"use client";

import { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import {
  CheckmarkBadge01Icon,
  InformationDiamondIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { useCreateAttachmentMutation } from "@/services/attachment/attachment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectToken } from "@/store/slices/authSlice";

interface Document {
  type: string;
  fileName: string;
  status: "verified" | "pending" | "missing";
  fileUrl?: string;
  attachmentId?: string;
}

interface DocumentsViewProps {
  stakeholder: Stakeholders;
}

// Expected document types for admissions
const EXPECTED_DOCUMENT_TYPES = [
  "birth certificate",
  "previous grade final report",
  "degree certificate",
  "medical report",
  "passport photo",
];

export function DocumentsView({ stakeholder }: DocumentsViewProps) {
  const router = useRouter();
  const token = useAppSelector(selectToken);
  const [createAttachment, { isLoading: isUploading }] =
    useCreateAttachmentMutation();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Map existing attachments by type
  const existingAttachmentsMap = new Map<string, any>();
  stakeholder.attachments?.forEach((att: any) => {
    const docType = (att.type || "").toLowerCase();
    existingAttachmentsMap.set(docType, att);
  });

  // Create documents list with all expected types
  const documents: Document[] = EXPECTED_DOCUMENT_TYPES.map((expectedType) => {
    const attachment = existingAttachmentsMap.get(expectedType.toLowerCase());

    if (attachment) {
      // Document exists
      const fileUrl = attachment.file || attachment.file_url || "";
      return {
        type: attachment.type || expectedType,
        fileName:
          attachment.file_name ||
          attachment.name ||
          fileUrl.split("/").pop() ||
          "file",
        status: attachment.status === "pending" ? "pending" : "verified",
        fileUrl: fileUrl,
        attachmentId: attachment.id,
      };
    } else {
      // Document is missing
      return {
        type: expectedType,
        fileName: "Not uploaded",
        status: "missing" as const,
      };
    }
  });

  const handleViewDocument = async (attachmentId: string) => {
    if (!attachmentId) return;

    try {
      // Fetch the file through the authenticated endpoint
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL ||
        "";
      const fileUrl = `${apiBaseUrl}/attachments/${attachmentId}`;

      //token assigned from top
      const apiKey = process.env.NEXT_PUBLIC_AUTH_API_KEY || "";

      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          ...(apiKey && { "x-api-key": apiKey }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Get the file link after redirects (signed S3 URL)
      const data = await response.json();
      const fileLink = data.data.file;

      // Open in new tab
      window.open(fileLink, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Failed to open document. Please try again.");
    }
  };

  const handleUploadClick = (docType: string) => {
    fileInputRefs.current[docType]?.click();
  };

  const handleFileChange = async (
    docType: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", docType);
      formData.append("user_id", stakeholder.user_id);
      formData.append("status", "pending");

      const response = await createAttachment(formData).unwrap();
      toast.success("Document uploaded successfully");
      // Refresh the page to show the new document
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to upload document. Please try again.";
      toast.error(errorMessage);
    } finally {
      // Reset file input
      if (fileInputRefs.current[docType]) {
        fileInputRefs.current[docType]!.value = "";
      }
    }
  };
  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "verified":
        return (
          <Icon
            icon={CheckmarkBadge01Icon}
            size={20}
            className="text-green-600"
          />
        );
      case "pending":
        return (
          <Icon
            icon={InformationDiamondIcon}
            size={20}
            className="text-orange-600"
          />
        );
      case "missing":
        return <Icon icon={Alert02Icon} size={20} className="text-red-600" />;
    }
  };

  const getStatusText = (status: Document["status"]) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "pending":
        return "Pending";
      case "missing":
        return "Missing";
    }
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "verified":
        return "text-green-600";
      case "pending":
        return "text-orange-600";
      case "missing":
        return "text-red-600";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
      {documents.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-lg">
          No documents uploaded
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-main-blue/5">
                <TableHead>Document Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-gray-700 border-r capitalize">
                    {doc.type}
                  </TableCell>
                  <TableCell className="text-gray-600 border-r">
                    {doc.fileName}
                  </TableCell>
                  <TableCell className="border-r">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className={cn("text-xs font-medium")}>
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.status === "missing" ? (
                      <>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[doc.type] = el;
                          }}
                          type="file"
                          accept=".pdf,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleFileChange(doc.type, e)}
                          disabled={isUploading}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleUploadClick(doc.type)}
                          disabled={isUploading}
                        >
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          doc.attachmentId &&
                          handleViewDocument(doc.attachmentId)
                        }
                        disabled={!doc.attachmentId}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
