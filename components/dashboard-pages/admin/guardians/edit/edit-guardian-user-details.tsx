import { Guardian } from "@/app/(dashboard)/admin/guardians/[id]/edit/page";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface Props {
  guardian: Guardian;
  setGuardian: Dispatch<SetStateAction<Guardian>>;
  onSubmit: () => Promise<string | number | undefined>;
  isLoading: boolean;
  school_name: string;
  // parent: Stakeholders | undefined
}

export default function EditGuardianUserDetails({
  guardian,
  setGuardian,
  onSubmit,
  isLoading,
  school_name,
}: Props) {
  //fetch schools
  const { replace } = useRouter();
  return (
    <div>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Edit Guardian Primary Details
        </h2>

        <InputField
          id="school"
          label="School"
          type="text"
          value={school_name}
          readOnly
        />

        <div className="space-y-6">
          <div className="flex flex-row gap-2">
            <InputField
              id="firstName"
              label="First Name"
              placeholder="E.g., Aisha"
              value={guardian.first_name}
              onChange={(e) =>
                setGuardian((prev) => ({ ...prev, first_name: e.target.value }))
              }
            />

            <InputField
              id="lastName"
              label="Last Name"
              placeholder="E.g., Bello"
              value={guardian.last_name}
              onChange={(e) =>
                setGuardian((prev) => ({ ...prev, last_name: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-row gap-2">
            <InputField
              id="middleName"
              label="Middle Name"
              placeholder="E.g., Simbiat"
              value={guardian.middle_name}
              onChange={(e) =>
                setGuardian((prev) => ({
                  ...prev,
                  middle_name: e.target.value,
                }))
              }
            />

            <InputField
              id="username"
              label="Username"
              placeholder="E.g. parent@example.com"
              value={guardian.username}
              onChange={(e) =>
                setGuardian((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="male"
                  checked={guardian.gender === "male" ? true : false}
                  onCheckedChange={(checked) =>
                    setGuardian((prev) => ({
                      ...prev,
                      gender: checked === true ? "male" : "female",
                    }))
                  }
                />
                <Label htmlFor="male" className="font-normal cursor-pointer">
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="female"
                  checked={guardian.gender === "female" ? true : false}
                  onCheckedChange={(checked) =>
                    setGuardian((prev) => ({
                      ...prev,
                      gender: checked === true ? "female" : "male",
                    }))
                  }
                />
                <Label htmlFor="female" className="font-normal cursor-pointer">
                  Female
                </Label>
              </div>
            </div>
          </div>

          <InputField
            id="email"
            label="Email Address"
            type="email"
            placeholder="E.g., aisha.bello@example.com"
            value={guardian.email}
            onChange={(e) =>
              setGuardian((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />

          <InputField
            id="phoneNumber"
            label="Primary Phone Number"
            placeholder="e.g. +23412347890"
            value={guardian.phone_number}
            onChange={(e) =>
              setGuardian((prev) => ({
                ...prev,
                phone_number: e.target.value,
              }))
            }
          />
        </div>

        <TextareaField
          id="residentialAddress"
          label="Residential Address"
          className="resize-none h-30"
          placeholder="Enter address"
          value={guardian.residential_address}
          onChange={(e) =>
            setGuardian((prev) => ({
              ...prev,
              residential_address: e.target.value,
            }))
          }
          rows={4}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => replace("/admin/guardians")}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="w-60 bg-main-blue disabled:opacity-70 hover:bg-main-blue/90"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
