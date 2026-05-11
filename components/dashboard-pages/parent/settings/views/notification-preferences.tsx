import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { useGetNotificationsQuery } from "@/services/notifications/notification";

export default function NotificationPreferences() {
  const { data: notifications } = useGetNotificationsQuery();
  console.log("notifications: ", notifications);
  const notificationPreferences = [
    {
      field: "Attendance (Check-in/out)",
      appNotification: "Enabled",
      emailAlert: "Disabled",
    },
    {
      field: "Academic Results / Report Cards",
      appNotification: "Enabled",
      emailAlert: "Enabled",
    },
    {
      field: "Wallet 'Low Balance' Alert",
      appNotification: "Enabled",
      emailAlert: "Enabled",
    },
    {
      field: "School Fee Invoices",
      appNotification: "Enabled",
      emailAlert: "Disabled",
    },
    {
      field: "Emergency Broadcasts",
      appNotification: "Enabled",
      emailAlert: "Enabled",
    },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Notification Preferences
      </h2>
      {/* table data */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-main-blue/5">
              <TableHead className="w-[200px]">Form Field</TableHead>
              <TableHead>In-App Notification</TableHead>
              <TableHead>Email Alert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notificationPreferences.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-gray-700">
                  {row.field}
                </TableCell>
                <TableCell
                  className={`${row.appNotification.toLowerCase() === "disabled" ? "text-destructive" : "text-main-blue"}`}
                >
                  {row.appNotification}
                </TableCell>
                <TableCell
                  className={`${row.emailAlert.toLowerCase() === "disabled" ? "text-destructive" : "text-main-blue"}`}
                >
                  {row.emailAlert}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
