"use client";

import { useState } from "react";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/general/huge-icon";
import { AddSquareIcon, PolicyIcon } from "@hugeicons/core-free-icons";
import { FinancialArrangementModal } from "@/components/dashboard-pages/parent/dashboard/financial-arrangement-modal";
import { DiscountPolicyModal } from "@/components/dashboard-pages/parent/fee-request-portal/discount-policy-modal";
import {
  useGetUserRequestByIdQuery,
  useGetUserRequestsQuery,
} from "@/services/user-requests/user-requests";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  useGetParentByUserIdQuery,
  useGetStudentByQueryParamQuery,
} from "@/services/stakeholders/stakeholders";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";

interface Request {
  id: string;
  requestType: string;
  childName: string;
  date: string;
  status: "Pending Approval" | "Completed" | "Rejected" | "Approved";
}

// const requests: Request[] = [
//   {
//     id: "1",
//     requestType: "Installment Plan",
//     childName: "Oluwole, Tunde",
//     date: "Nov. 10, 2025",
//     status: "Pending Approval",
//   },
//   {
//     id: "2",
//     requestType: "Transcript Request",
//     childName: "Oluwole, Kehinde",
//     date: "Aug. 20, 2025",
//     status: "Completed",
//   },
//   {
//     id: "3",
//     requestType: "Sibling Discount Appeal",
//     childName: "Oluwole, Tunde",
//     date: "Jul. 01, 2025",
//     status: "Rejected",
//   },
//   {
//     id: "4",
//     requestType: "Late Payment Extension",
//     childName: "Oluwole, Kehinde",
//     date: "May. 14, 2025",
//     status: "Approved",
//   },
// ];

const getStatusColor = (status: Request["status"]) => {
  switch (status) {
    case "Pending Approval":
      return "text-orange-600";
    case "Completed":
    case "Approved":
      return "text-green-600";
    case "Rejected":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export default function FeeRequestPortalPage() {
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const user = useAppSelector(selectUser);
  //fetch stakeholder
  const { data: parent } = useGetParentByUserIdQuery(user?.id ?? "");
  const stakeParent: Stakeholders | undefined = parent?.data;
  //fetch request
  const {
    data: userRequests,
    isLoading: isGettingRequests,
    // error,
  } = useGetUserRequestsQuery();
  const allRequests = userRequests?.data;
  const rawRequests = allRequests?.filter(
    (request) => request.creator_id === stakeParent?.id, //or user ID
  );

  const requests: Request[] =
    rawRequests?.map((item) => {
      return {
        id: item.id,
        requestType: item.type,
        childName: item.title, // change later
        date: item.end_date as string,
        status: item.status as Request["status"], // cross check later
      };
    }) ?? [];

  const columns: TableColumn<Request>[] = [
    {
      key: "requestType",
      title: "Request Type",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "childName",
      title: "Child Name",
    },
    {
      key: "date",
      title: "Date",
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as Request["status"];
        return (
          <span className={`text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      },
    },
  ];

  const actions: TableAction<Request>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View Details",
            onClick: (row) => {
              console.log("View details for:", row.id);
            },
          },
          {
            label: "Download Receipt",
            onClick: (row) => {
              console.log("Download receipt for:", row.id);
            },
            separator: true,
          },
        ],
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Fee & Administrative Request Portal
        </h1>
        <p className="text-gray-600">
          This screen allows parents to submit formal requests to the school
          administration (HR, Bursar, Registrar) and track the status of those
          submissions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Pending Requests"
          value="1 Request Awaiting Review"
          trend="up"
        />
        <MetricCard title="Requests Approved" value="2 Requests" trend="up" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => setSubmitModalOpen(true)}
          className="h-11 flex items-center gap-2"
        >
          <Icon icon={AddSquareIcon} size={18} />
          Submit New Request
        </Button>
        <Button
          variant="outline"
          onClick={() => setPolicyModalOpen(true)}
          className="h-11 flex items-center gap-2"
        >
          <Icon icon={PolicyIcon} size={18} />
          View Discount Policy
        </Button>
      </div>

      {/* Request History Table */}
      <div className="bg-background rounded-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Request History Table
        </h2>
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={requests}
            actions={actions}
            showActionsColumn={true}
            actionsColumnTitle="Action"
            isLoading={isGettingRequests}
          />
        </div>
      </div>

      {/* Modals */}
      <FinancialArrangementModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
      />
      <DiscountPolicyModal
        open={policyModalOpen}
        onOpenChange={setPolicyModalOpen}
      />
    </div>
  );
}
