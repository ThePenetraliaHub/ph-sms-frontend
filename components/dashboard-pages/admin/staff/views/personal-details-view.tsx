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

export function PersonalDetailsView({ stakeholder }: PersonalDetailsViewProps) {
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

  // Format date of birth
  const formatDateOfBirth = (dateOfBirth?: string | null) => {
    if (!dateOfBirth) return "—";
    try {
      const date = new Date(dateOfBirth);
      const age = getAge(dateOfBirth);
      const formattedDate = format(date, "MMMM d, yyyy");
      return age ? `${formattedDate} (Age: ${age})` : formattedDate;
    } catch {
      return dateOfBirth;
    }
  };

  // Format emergency contact
  const formatEmergencyContact = () => {
    if (stakeholder?.emergency_contact_and_phone) {
      return stakeholder.emergency_contact_and_phone;
    }
    if (stakeholder?.emergency_contact) {
      const contact = stakeholder.emergency_contact;
      const name = contact ? contact : "Unknown"
      const phone = contact;
      const relationship = contact || "";
      return `${name}${relationship ? ` (${relationship})` : ""}${phone ? ` - ${phone}` : ""}`;
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
      field: "Date of Birth",
      content: formatDateOfBirth(stakeholder?.user?.date_of_birth),
    },
    {
      field: "Gender",
      content: stakeholder?.user?.gender
        ? stakeholder.user.gender.charAt(0).toUpperCase() +
          stakeholder.user.gender.slice(1)
        : "—",
    },
    {
      field: "Qualifications",
      content: stakeholder?.qualification || "—",
    },
    {
      field: "Emergency Contact",
      content: formatEmergencyContact(),
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
