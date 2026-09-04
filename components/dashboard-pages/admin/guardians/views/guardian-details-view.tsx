"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { format } from "date-fns";

interface PersonalDetailsViewProps {
  stakeholder?: Stakeholders;
}

export function GuardianDetailsView({ stakeholder }: PersonalDetailsViewProps) {
  // Calculate age from date of birth
  const getAge = (dateOfBirth?: string | null) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Format emergency contact
  const formatEmergencyContact = () => {
    if (stakeholder?.emergency_contact_and_phone) {
      return stakeholder.emergency_contact_and_phone;
    }
    if (stakeholder?.emergency_contact) {
      // const contact = stakeholder.emergency_contact;
      // const name = contact.user
      //   ? `${contact.user.first_name} ${contact.user.last_name}`.trim()
      //   : "Unknown";
      // const phone = contact.user?.phone_number || "";
      // const relationship = contact.relationship_to_student || "";
      // return `${name}${relationship ? ` (${relationship})` : ""}${phone ? ` - ${phone}` : ""}`;
      return stakeholder.emergency_contact;
    }
    return "—";
  };

  const personalDetailsRows = [
    {
      field: "Primary Phone Number",
      content: stakeholder?.user?.phone_number || "—",
    },
    {
      field: "School Email",
      content: stakeholder?.school_email || stakeholder?.user?.email || "—",
    },
    {
      field: "Residential Address",
      content: stakeholder?.user?.residential_address || "—",
    },
    {
      field: "Email",
      content: stakeholder?.user?.email || "—",
    },
    {
      field: "Gender",
      content: stakeholder?.user?.gender
        ? stakeholder.user.gender.charAt(0).toUpperCase() +
          stakeholder.user.gender.slice(1)
        : "—",
    },
    {
      field: "Guardian's Username",
      content: stakeholder?.user.username || "—",
    },
    {
      field: "Emergency Contact",
      content: formatEmergencyContact(),
    },
    {
      field: "No. of Children",
      content: stakeholder?.children_details?.length ?? 0,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-main-blue/5">
              <TableHead className="w-[200px]">Form Field</TableHead>
              <TableHead>Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personalDetailsRows.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-gray-700">
                  {row.field}
                </TableCell>
                <TableCell className="text-gray-600">{row.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
