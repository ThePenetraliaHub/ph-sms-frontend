import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChangeEvent } from "react";
import { AuthUser } from "@/services/auth/auth-type";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import Image from "next/image";

interface Props {
  uploadImg: (e: ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  user: AuthUser | null;
  currStudent: Stakeholders | undefined;
  isLoading: boolean;
  isUpdatingImg: boolean;
}

export default function PersonalProfileViews({
  uploadImg,
  loading,
  user,
  currStudent,
  isLoading,
  isUpdatingImg,
}: Props) {
  const personalProfileRows = [
    {
      field: "Display Name",
      content: `${user?.last_name} ${user?.first_name}`,
    },
    {
      field: "Class / Student ID",
      content: isLoading
        ? "-"
        : `${currStudent ? (currStudent.class_assigned ? currStudent.class_assigned : "Class N/A") : "-"} / ${`${user?.last_name.toLowerCase()}.${user?.gender === "female" ? "f" : "m"}${currStudent && currStudent.id}`}`,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Personal Profile</h2>
      <div className="flex items-center gap-x-5">
        {/* Profile Picture */}
        <div className="shrink-0">
          {user?.profile_image_url ? (
            <Image
              src={user.profile_image_url}
              alt={"profile-img"}
              width={120}
              height={120}
              className="rounded-md object-cover object-top w-30 h-30"
            />
          ) : (
            <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-400">
                {`${user?.last_name.charAt(0)}${user?.first_name.charAt(0)}`}
              </span>
            </div>
          )}
        </div>
        {/* <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-400">
            {loading || isUpdatingImg ? "-" : "S"}
          </span>
        </div> */}
        <div>
          <div className="relative w-fit">
            <Button className="w-fit h-13" variant={"outline"}>
              Change Profile Image
            </Button>
            {!loading && (
              <input
                className="absolute top-0 right-0 left-0 bottom-0 opacity-0"
                type="file"
                accept="image/*"
                multiple={false}
                onChange={uploadImg}
              />
            )}
          </div>
          <p className="text-sm italic text-[#DC3545] mt-1">
            Profile change is subject to admin approval
          </p>
        </div>
      </div>
      {/* table data */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-main-blue/5">
              <TableHead className="w-[200px]">Form Field</TableHead>
              <TableHead>Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personalProfileRows.map((row, index) => (
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
      {/* save button */}
      <div className="w-full flex justify-end">
        <Button className="w-fit h-10 px-5 mt-3" variant={"default"}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
