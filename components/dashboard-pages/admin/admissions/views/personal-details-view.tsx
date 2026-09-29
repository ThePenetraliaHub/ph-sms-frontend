"use client";

import { format } from "date-fns";
import { InfoTable } from "../components/info-table";
import type { Stakeholders } from "@/services/stakeholders/stakeholder-types";

interface PersonalDetailsViewProps {
  stakeholder: Stakeholders;
}

export function PersonalDetailsView({ stakeholder }: PersonalDetailsViewProps) {
  const dob = stakeholder.user.date_of_birth
    ? format(new Date(stakeholder.user.date_of_birth), "MMMM d, yyyy")
    : "—";
  const age = stakeholder.age ? `(Age ${stakeholder.age})` : "";
  const primaryContact = stakeholder.primary_contact
    ? `${stakeholder.primary_contact} ${stakeholder.primary_contact}`
    : stakeholder.parent_name || "—";
  const emergencyContact = stakeholder.emergency_contact
    ? `${stakeholder.emergency_contact} ${stakeholder.emergency_contact}${stakeholder.emergency_contact_and_phone ? ` - ${stakeholder.emergency_contact_and_phone}` : ""}`
    : stakeholder.emergency_contact_and_phone || "—";

  const rows = [
    {
      field: "Date of Birth",
      content: dob ? `${dob} ${age}`.trim() : "—",
      status: stakeholder.user.date_of_birth
        ? ("verified" as const)
        : undefined,
    },
    {
      field: "Gender",
      content: stakeholder.user.gender || "—",
      status: stakeholder.user.gender ? ("verified" as const) : undefined,
    },
    {
      field: "Residential Address",
      content: stakeholder.user.residential_address || "—",
      status: stakeholder.user.residential_address
        ? ("verified" as const)
        : undefined,
    },
    {
      field: "Primary Contact",
      content: primaryContact,
      status: primaryContact !== "—" ? ("verified" as const) : undefined,
    },
    {
      field: "Email",
      content: stakeholder.user.email || "—",
      status: stakeholder.user.email ? ("verified" as const) : undefined,
    },
    {
      field: "Phone Number",
      content: stakeholder.user.phone_number || "—",
      status: stakeholder.user.phone_number ? ("verified" as const) : undefined,
    },
    {
      field: "Emergency Contact",
      content: emergencyContact,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
      <InfoTable rows={rows} />
    </div>
  );
}
