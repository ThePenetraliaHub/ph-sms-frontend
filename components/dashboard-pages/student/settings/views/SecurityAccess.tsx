"use client";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EyeOff, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, useState } from "react";

interface showPasswords {
  currPassword: boolean;
  wallet: boolean;
}

interface Props {
  setOpenModal: Dispatch<SetStateAction<boolean>>;
}

export default function SecurityAccess({ setOpenModal }: Props) {
  const [showPass, setShowPass] = useState<showPasswords>({
    currPassword: false,
    wallet: false,
  });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Security & Access</h2>
      {/* table data */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-main-blue/5">
              <TableHead className="w-[200px]">Active Sessions</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-gray-700">
                Chrome on Windows -{" "}
                <span className="font-normal italic">Last Updated 12:03PM</span>
              </TableCell>
              <TableCell className="text-destructive font-medium">
                <p className="hover:underline w-fit cursor-pointer">Logout</p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {/* curr password */}
      <div className="relative space-y-3 mt-8">
        <Label>Current Password</Label>
        <Input
          defaultValue={"xxxxxxxxxx"}
          type={showPass.currPassword ? "text" : "password"} //or password
          placeholder="Enter value"
          className="md:h-12 md:px-5"
        />
        <button
          type="button"
          onClick={() => {
            setShowPass((prevState) => {
              return {
                ...prevState,
                currPassword: !prevState.currPassword,
              };
            });
          }}
          // disabled={isLoading || isLoginLoading}
          className="cursor-pointer absolute right-3 top-8 md:top-9 lg:top-10 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors disabled:opacity-50"
        >
          {!showPass.currPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {/* effect change button */}
        <div className="w-full flex justify-end">
          <Button
            onClick={() => setOpenModal(true)}
            className="w-fit h-10 px-5 mt-3"
            variant={"default"}
          >
            Change Password
          </Button>
        </div>
      </div>
      {/* recovery contact */}
      <div className="relative space-y-3 mt-5">
        <div className="flex items-center justify-between w-full">
          <Label>Recovery Contact</Label>
          <CardDescription className="italic text-sm">
            Email/Parent Phone Number
          </CardDescription>
        </div>
        <Input
          value={"+234 098 765 4321"}
          readOnly
          type="text"
          placeholder="Enter value"
          className="md:h-12 md:px-5 cursor-not-allowed"
        />
      </div>
    </div>
  );
}
