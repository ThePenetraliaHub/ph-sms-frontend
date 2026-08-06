"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { ModalContainer } from "@/components/ui/modal-container";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import DatePickerIcon from "@/components/ui/date-picker";
import { Icon } from "@/components/general/huge-icon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { FeeStructurePayload } from "@/services/schools/schools-type";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCreateFeeStructureMutation } from "@/services/schools/schools";

const initialData = {
  feeName: "",
  applicableTerm: "",
  applicableClass: "",
  applicableSession: "",
  item: [
    {
      itemName: "",
      itemPrice: "",
    },
  ],
  dueDate: undefined,
};

interface FeeStructureForm {
  feeName: string;
  applicableTerm: string;
  applicableClass: string;
  applicableSession: string;
  item: {
    itemName: string;
    itemPrice: string;
  }[];
  dueDate: Date | undefined;
}

interface SetFeeStructureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetFeeStructureModal({
  open,
  onOpenChange,
}: SetFeeStructureModalProps) {
  const user = useAppSelector(selectUser);
  const classes: string[] = user?.school ? user.school?.classes : [];
  const [formData, setFormData] = useState<FeeStructureForm>(initialData);
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);

  const [createFeeStructure, { isLoading: isCreatingFeeStructure }] =
    useCreateFeeStructureMutation();

  const handleDateChange: Dispatch<SetStateAction<Date | undefined>> = (
    date,
  ) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: typeof date === "function" ? date(prev.dueDate) : date,
    }));
  };

  const handleAddLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      item: [
        ...prev.item,
        {
          itemName: "",
          itemPrice: "",
        },
      ],
    }));
  };

  const handleUpdateLineItem = (
    index: number,
    field: "itemName" | "itemPrice",
    value: string,
  ) => {
    setFormData((prev) => {
      const updatedItems = [...prev.item];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
      return {
        ...prev,
        item: updatedItems,
      };
    });
  };

  const handleRemoveLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      item: prev.item.filter((_, i) => i !== index),
    }));
  };

  const isValidSession = (session: string): boolean => {
    if (!session.trim()) return false;
    if (!session.includes("/")) {
      // console.log("No separator found");
      return false;
    }
    const sessionYears = session.split("/");
    const preceedingYear = sessionYears[0];
    const suceedingYear = sessionYears[1];
    if (
      preceedingYear.toString().length !== 4 ||
      suceedingYear.toString().length !== 4
    ) {
      // console.log("Preceeding or Suceeding year length is not equals to 4");
      return false;
    }
    if (isNaN(Number(preceedingYear)) || isNaN(Number(suceedingYear))) {
      // console.log("Preceeding or Suceeding year is not a number");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const schoolId = user?.school_id;
    const {
      feeName,
      applicableClass,
      applicableTerm,
      applicableSession: session,
      item: items,
      dueDate,
    } = formData;
    if (!schoolId) return toast.error("School is missing");
    if (!feeName.trim()) return toast.error("Please enter a fee name");
    if (!dueDate) return toast.error("Please select a due date");
    if (!isValidSession(session)) return toast.error("Invalid session");

    //if typeof price is number
    // const updatedArr = item.map((prev) => ({
    //   ...prev,
    //   itemName: prev.itemName,
    //   itemPrice: Number(prev.itemPrice),
    // }));

    const payload: FeeStructurePayload = {
      feeName,
      applicableClass,
      applicableTerm,
      // items: updatedArr,
      items,
      dueDate: format(dueDate, "yyyy-MM-dd"),
      school_id: schoolId,
      assignToAll: true,
      session,
    };

    try {
      const res = await createFeeStructure(payload).unwrap();
      console.log("Response: ", res);
      // setFormData(initialData);
      // onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData(initialData);
    }
    onOpenChange(open);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={handleClose}
      title="Set Fee Structures"
      size="2xl"
    >
      <div className="space-y-6 py-4 lg:max-h-[500px]">
        <InputField
          label="Fee Name"
          placeholder="E.g 'Full SS1 Fee Structure"
          type="text"
          value={formData.feeName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, feeName: e.target.value }))
          }
        />

        <InputField
          label="Academic Session"
          placeholder="E.g. '2025/2026"
          type="text"
          value={formData.applicableSession}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              applicableSession: e.target.value,
            }))
          }
        />

        <SelectField
          label="Applicable Term"
          value={formData.applicableTerm}
          onValueChange={(term) =>
            setFormData((prev) => ({ ...prev, applicableTerm: term }))
          }
          placeholder="Select academic term"
        >
          {[
            { value: "first-term", label: "First Term" },
            { value: "second-term", label: "Second Term" },
            { value: "third-term", label: "Third Term" },
          ].map((term, index) => (
            <SelectItem className={"capitalize"} key={index} value={term.value}>
              {term.label}
            </SelectItem>
          ))}
        </SelectField>

        <SelectField
          label="Applicable Class"
          value={formData.applicableClass}
          onValueChange={(e) =>
            setFormData((prev) => ({ ...prev, applicableClass: e }))
          }
          placeholder="Select Class"
        >
          {classes.map((cls, index) => (
            <SelectItem className={"capitalize"} key={index} value={cls}>
              {cls}
            </SelectItem>
          ))}
        </SelectField>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">Line Items</p>
          {formData.item.map((item, index) => (
            <div key={index} className="flex flex-row items-end gap-3">
              <div className="w-[95%] grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <InputField
                  label="Item Name"
                  placeholder="E.g Tuition Fee, Library Fee"
                  className="w-full"
                  type="text"
                  value={item.itemName}
                  onChange={(e) =>
                    handleUpdateLineItem(index, "itemName", e.target.value)
                  }
                />

                <InputField
                  label="Item Price (₦)"
                  placeholder="Enter item price"
                  type="number"
                  value={item.itemPrice}
                  onChange={(e) =>
                    handleUpdateLineItem(index, "itemPrice", e.target.value)
                  }
                />
              </div>
              {formData.item.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mb-0"
                  onClick={() => handleRemoveLineItem(index)}
                >
                  <Icon icon={Cancel01Icon} size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddLineItem}
          className="w-full"
        >
          Add New Line Item
        </Button>

        <DatePickerIcon
          label="Due Date"
          open={openDatePicker}
          setOpen={setOpenDatePicker}
          date={formData.dueDate}
          setDate={handleDateChange}
        />

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            disabled={isCreatingFeeStructure}
            className="disabled:opacity-50 transition ease-in-out delay-100"
            onClick={handleSubmit}
          >
            {isCreatingFeeStructure ? "Saving..." : "Save Fee Structure"}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
