"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAssignChildToParentMutation,
  useGetStakeholdersQuery,
  useUnlinkChildFromParentMutation,
} from "@/services/stakeholders/stakeholders";
import { GuardiansTable } from "@/components/dashboard-pages/admin/guardians/guardians-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AssignWards from "@/components/dashboard-pages/admin/guardians/modals/assign-wards";
import { toast } from "sonner";
import { SkChildDetails } from "@/services/stakeholders/stakeholder-types";
import ViewWards from "@/components/dashboard-pages/admin/guardians/modals/view-wards";

export type Parent = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  wards: string[];
  children_details: SkChildDetails[];
  dateJoined: string;
  status: string;
};

export type Ward = {
  id: string;
  first_name: string;
  last_name: string;
  class_assigned: string;
  email: string;
  status: string;
  dateJoined: string;
};

export default function Page() {
  const { push } = useRouter();
  const [openAssignWardsMod, setOpenAssignWardsMod] = useState<boolean>(false);
  const [openViewWardsMod, setOpenViewWardsMod] = useState<boolean>(false);
  const [wardIds, setWardIds] = useState<string[]>([]);
  const [parWardsOnSel, setParWardsOnSel] = useState<Array<string>>([]);
  const [selectedParent, setSelectedParent] = useState<Parent>();

  const {
    data: stakeholders,
    isLoading,
    isError,
  } = useGetStakeholdersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [
    associateChildToParent,
    { isLoading: isLinkingChildToParent, isError: errLinkingChildToParent },
  ] = useAssignChildToParentMutation();

  const [
    deleteWard,
    { isLoading: isRemovingWard, isError: isRemovingWardErr },
  ] = useUnlinkChildFromParentMutation();

  const all_parents: Parent[] = useMemo(() => {
    if (!stakeholders?.data) return [] as Parent[];
    const sk_with_user_obj = stakeholders.data.filter((sk) => sk.user);
    const sk_parents = sk_with_user_obj.filter(
      (sk) => sk.user.role === "parent",
    );
    const all_parents: Parent[] = sk_parents.map((sk) => {
      return {
        id: sk.id ?? "",
        first_name: sk.user.first_name ?? "",
        last_name: sk.user.last_name ?? "",
        email: sk.user.email ?? "",
        wards: sk.children ?? ([] as string[]),
        children_details: sk.children_details ?? ([] as SkChildDetails[]),
        dateJoined: sk.date_joined ?? "",
        status: sk.status ?? "",
      };
    });
    return all_parents;
  }, [stakeholders?.data]);

  const students: Ward[] = useMemo(() => {
    if (!stakeholders?.data) return [] as Ward[];
    const sk_with_user_obj = stakeholders.data.filter((sk) => sk.user);
    const sk_wards = sk_with_user_obj.filter(
      (sk) => sk.user.role === "student",
    );
    const wards: Ward[] = sk_wards.map((sk) => {
      return {
        id: sk.id ?? "",
        first_name: sk.user.first_name ?? "-",
        last_name: sk.user.last_name ?? "-",
        class_assigned: sk.class_assigned ?? "-",
        email: sk.user.email ?? "-",
        dateJoined: sk.date_joined ?? "-",
        status: sk.status ?? "-",
      };
    });
    return wards;
  }, [stakeholders?.data]);

  const isSameSet = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sorted = (arr: string[]) => [...arr].sort();
    return sorted(a).every((val, i) => val === sorted(b)[i]);
  };

  //assign children to parents
  const assignWards = async () => {
    if (!selectedParent?.id) return toast.error("No parent selected");
    if (wardIds.length === 0)
      return toast.error("Please select at least a child");
    if (isSameSet(wardIds, parWardsOnSel))
      return toast.warning("Children same as before");

    const payload = {
      parent_id: selectedParent.id,
      data: {
        children: [...wardIds],
      },
    };

    try {
      const res = await associateChildToParent(payload).unwrap();
      toast.success(
        res.message ? res.message : "Children assigned to parent successfully",
      );
      setSelectedParent(undefined);
      setParWardsOnSel([]);
      setWardIds([]);
      setOpenAssignWardsMod(false);
    } catch {}
  };

  //remove children from parents
  const removeWard = async (id: string) => {
    if (!selectedParent?.id) return;
    if (!id) return;

    const payload = {
      parent_id: selectedParent.id,
      child_ids: [id],
    };

    try {
      const res = await deleteWard(payload).unwrap();
      toast.success(res.message ? res.message : "Child removed successfully ");
      setSelectedParent(undefined);
      setOpenViewWardsMod(false);
    } catch {}
  };

  useEffect(() => {
    if (!selectedParent) return;
    if (selectedParent.wards.length === 0) return;
    setWardIds((prev) => [...prev, ...selectedParent.wards]);
  }, [selectedParent]);

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-md mb-6 p-6">
        <h2 className="text-2xl font-bold text-gray-800">All Guardians List</h2>
        <p className="text-gray-600 mt-1">
          Manage Guardians Records and Ward Association
        </p>
      </div>

      <div className="bg-background rounded-md p-6 w-full">
        <div className="flex items-center gap-4">
          <div className="h-12 w-1 bg-orange-500 rounded"></div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Total Guardians: {isLoading ? "Loading..." : all_parents.length}
            </h3>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">All Parents</CardTitle>
            <Button
              onClick={() => push("/admin/guardians/add")}
              className="h-10"
            >
              + Add New Guardian
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading guardians...
            </div>
          ) : (
            <GuardiansTable
              setFilterModal={() => {}}
              parents={all_parents}
              isLoading={isLoading}
              setOpenAssignWardsMod={setOpenAssignWardsMod}
              setSelectedParent={setSelectedParent}
              setParWardsOnSel={setParWardsOnSel}
              setOpenViewWardsMod={setOpenViewWardsMod}
            />
          )}
        </CardContent>
      </Card>

      {/* assign wards modal */}
      <AssignWards
        open={openAssignWardsMod}
        onOpenChange={setOpenAssignWardsMod}
        wardIds={wardIds}
        setWardIds={setWardIds}
        setParWardsOnSel={setParWardsOnSel}
        isLoading={isLoading}
        isError={isError}
        wards={students}
        setSelectedParent={setSelectedParent}
        parentName={
          selectedParent
            ? `${selectedParent.last_name} ${selectedParent.first_name}`
            : ""
        }
        assignWards={assignWards}
        isLinkingChildToParent={isLinkingChildToParent}
      />

      {/* view wards */}
      <ViewWards
        open={openViewWardsMod}
        onOpenChange={setOpenViewWardsMod}
        selectedParent={selectedParent}
        setSelectedParent={setSelectedParent}
        isLoading={isRemovingWard}
        isError={isRemovingWardErr}
        removeWard={removeWard}
      />
    </div>
  );
}
