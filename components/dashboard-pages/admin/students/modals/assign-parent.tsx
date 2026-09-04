"use client";

import { ModalContainer } from "@/components/ui/modal-container";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { Stakeholders } from "@/services/stakeholders/stakeholder-types";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Student } from "../components/student-table";
import {
  useAssignParentToChildMutation,
  useGetStakeholdersQuery,
} from "@/services/stakeholders/stakeholders";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: Student | undefined;
  setSelectedStudent: Dispatch<SetStateAction<Student | undefined>>;
}

export function AssignParent({
  open,
  onOpenChange,
  setSelectedStudent,
  selectedStudent,
}: Props) {
  const { push } = useRouter();
  const [parentId, setParentId] = useState<string>("");

  //fetch all stakeholders
  const {
    data: stakeholders,
    isLoading: isFetchingStakeholders,
    isError: fetchStakeholdersErr,
  } = useGetStakeholdersQuery(undefined, { skip: !selectedStudent?.id });

  const [associateParentToChild, { isLoading }] =
    useAssignParentToChildMutation();

  const registered_parents: Stakeholders[] = useMemo(() => {
    if (!stakeholders?.data) return [] as Stakeholders[];
    const sk_with_user_obj: Stakeholders[] = stakeholders.data.filter(
      (sk) => sk.user,
    );
    const all_parents: Stakeholders[] = sk_with_user_obj.filter(
      (sk) => sk.user.role === "parent",
    );
    return all_parents;
  }, [stakeholders?.data]);

  const handleClose = (isOpen: boolean) => {
    if (isLoading) return;
    setSelectedStudent(undefined);
    setParentId("");
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!selectedStudent?.id) return;
    if (!parentId) return toast.error("Please select a parent");

    const payload = {
      parent_id: parentId,
      child_ids: [selectedStudent.id],
    };

    try {
      const res = await associateParentToChild(payload).unwrap();
      toast.success(res.message ? res.message : "Parent assigned successfully");
      setSelectedStudent(undefined);
      setParentId("");
      onOpenChange(false);
      push("/admin/students");
    } catch {}
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title={`Assign Parent to ${selectedStudent?.last_name} ${selectedStudent?.first_name}`}
      size="3xl"
      maxHeight="lg"
      footer={
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => handleClose(false)}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex-1 opacity-100 disabled:opacity-50"
          >
            {isLoading ? "Assigning Parent..." : "Assign Parent"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 h-full">
        <SelectField
          label={
            isFetchingStakeholders
              ? "Loading Parents..."
              : fetchStakeholdersErr
                ? "Failed to fetch parents"
                : "Select Parent"
          }
          value={parentId}
          onValueChange={(e) => setParentId(e)}
          disabled={isFetchingStakeholders || fetchStakeholdersErr}
          placeholder="Select Parent"
        >
          {registered_parents.map((parent, index) => (
            <SelectItem className={"capitalize"} key={index} value={parent.id}>
              {`${parent.user.last_name} ${parent.user.first_name}`}
            </SelectItem>
          ))}
        </SelectField>
      </div>
    </ModalContainer>
  );
}
