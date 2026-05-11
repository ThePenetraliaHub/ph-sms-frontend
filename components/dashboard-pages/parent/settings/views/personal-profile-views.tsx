import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { AuthUser } from "@/services/auth/auth-type";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";

interface Props {
  uploadImg: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  user: AuthUser | null;
  parent: Stakeholders | undefined;
  isLoading: boolean;
}

export default function PersonalProfileViews({
  uploadImg,
  loading,
  // parent,
  isLoading,
}: Props) {
  const user = useAppSelector(selectUser);
  // console.log("Parent: ", parent);
  console.log("User: ", user);
  const isLoadingImgChange = (): boolean => {
    if (loading || isLoading) return true;
    return false;
  };

  const personalProfileRows = [
    {
      field: "Display Name",
      content:
        user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : user?.first_name || user?.last_name || "—",
    },
    {
      field: "Phone Number",
      content: user?.phone_number || "—",
    },
    {
      field: "Email Contact",
      content: user?.email || "—",
    },
    {
      field: "Linked Students",
      content: "Tunde [ Go to Profile ], Seyi [ Go to Profile ]", //ATTACH PARENTS CHILDREN HERE
    },
    {
      field: "Home Address",
      content: user?.residential_address || "—",
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
                {isLoadingImgChange()
                  ? "-"
                  : `${user?.last_name.charAt(0)}${user?.first_name.charAt(0)}`}
              </span>
            </div>
          )}
        </div>
        <div>
          <div className="relative w-fit">
            <Button className="w-fit h-13 cursor-pointer" variant={"outline"}>
              Change Profile Image
            </Button>
            {!isLoadingImgChange() && (
              <input
                className="absolute top-0 right-0 left-0 bottom-0 opacity-0"
                type="file"
                accept="image/*"
                multiple={false}
                onChange={uploadImg}
              />
            )}
          </div>
          <p className="text-sm hidden italic text-[#DC3545] mt-1">
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
