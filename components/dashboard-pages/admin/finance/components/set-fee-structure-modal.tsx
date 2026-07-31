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

const initialData = {
  feeName: "",
  applicableTerm: "",
  applicableStudent: "",
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
  applicableStudent: string;
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
  console.log("Admin School: ", user?.school);
  const [formData, setFormData] = useState<FeeStructureForm>(initialData);
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);

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

  const handleSubmit = () => {
    console.log("Set fee structure submitted", {
      ...formData,
    });
    setFormData(initialData);
    onOpenChange(false);
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
          placeholder="E.g 'Full SS1 Fee Structure (2025/2026)"
          type="text"
          value={formData.feeName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, feeName: e.target.value }))
          }
        />

        <SelectField
          label="Applicable Term"
          value={formData.applicableTerm}
          onValueChange={(term) =>
            setFormData((prev) => ({ ...prev, applicableTerm: term }))
          }
          placeholder="Select academic level"
        >
          {["first", "second", "third"].map((term, index) => (
            <SelectItem className={"capitalize"} key={index} value={term}>
              {term}
            </SelectItem>
          ))}
        </SelectField>

        <InputField
          label="Applicable Students"
          placeholder="E.g SS1 ONLY, All Students (Non-boarding)"
          type="text"
          value={formData.applicableStudent}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              applicableStudent: e.target.value,
            }))
          }
        />

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
          <Button onClick={handleSubmit}>Save Fee Structure</Button>
        </div>
      </div>
    </ModalContainer>
  );
}
