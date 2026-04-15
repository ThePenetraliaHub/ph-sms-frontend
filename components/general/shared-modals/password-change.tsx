"use client";
import {
  ModalStepId,
  PasswordHandler,
} from "@/app/(dashboard)/parent/settings/page";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalContainer } from "@/components/ui/modal-container";
import { useChangePasswordMutation } from "@/services/auth/auth";
import { toast } from "sonner";

interface PasswordChangeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setModalStepsId: Dispatch<SetStateAction<ModalStepId>>;
  modalStepsId: ModalStepId;
}

export default function PasswordChange({
  onOpenChange,
  open,
  setModalStepsId,
  modalStepsId,
}: PasswordChangeProps) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [passwordErr, setPasswordErr] = useState<string>();
  const [passwordHandler, setPasswordHandler] = useState<PasswordHandler>({
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });

  const handleModalClose = () => {
    setModalStepsId("verify-password");
    if (
      passwordHandler.oldPass ||
      passwordHandler.newPass ||
      passwordHandler.confirmPass
    ) {
      setPasswordHandler({
        oldPass: "",
        newPass: "",
        confirmPass: "",
      });
    }
    onOpenChange(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordHandler((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const handlePasswordVerification = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(passwordHandler.oldPass);
    //validate
    //call-endpoint
    setModalStepsId("change-password");
  };

  const handlePasswordUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //validate
    if (
      !passwordHandler.oldPass ||
      !passwordHandler.newPass ||
      !passwordHandler.confirmPass
    ) {
      setPasswordErr("One or more field(s) missing");
      return;
    }

    if (passwordHandler.confirmPass !== passwordHandler.newPass) {
      setPasswordErr("Password mismatched");
      return;
    }

    if (passwordErr) setPasswordErr(undefined);

    //call endpoint
    //notify
    try {
      const res = await changePassword({
        old_password: passwordHandler.oldPass,
        new_password: passwordHandler.newPass,
        confirm_password: passwordHandler.confirmPass,
      }).unwrap();
      toast.success(
        res.message ? res.message : "Password Changed Successfully ✅",
      );
      setModalStepsId("verify-password");
      handleModalClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <ModalContainer
      open={open}
      title={"System Verification"}
      onOpenChange={handleModalClose}
      size="3xl"
    >
      {modalStepsId === "verify-password" && (
        <form
          onSubmit={handlePasswordVerification}
          className="mt-3 flex flex-col gap-y-7 items-center"
        >
          <div className="flex flex-col gap-y-3 w-full">
            <Label htmlFor="password">Enter Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              className="lg:h-12 lg:px-5"
              onChange={handleChange}
              value={passwordHandler.oldPass}
              name="oldPass"
            />
          </div>
          <Button className="h-12 w-1/2 lg:w-[394px]">Continue</Button>
        </form>
      )}
      {modalStepsId === "change-password" && (
        <form
          onSubmit={handlePasswordUpdate}
          className="mt-3 flex flex-col gap-y-7 items-center"
        >
          {passwordErr && (
            <div className="py-2 px-4 text-destructive bg-destructive/10 text-sm w-full border border-destructive rounded-sm">
              <p>{passwordErr}</p>
            </div>
          )}
          <div className="flex flex-col gap-y-3 w-full">
            <Label htmlFor="password">Enter New Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              className="lg:h-12 lg:px-5"
              onChange={handleChange}
              value={passwordHandler.newPass}
              name="newPass"
            />
          </div>
          <div className="flex flex-col gap-y-3 w-full">
            <Label htmlFor="password">Confirm Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              className="lg:h-12 lg:px-5"
              value={passwordHandler.confirmPass}
              name="confirmPass"
              onChange={handleChange}
            />
          </div>
          <Button
            disabled={isLoading}
            className="h-12 w-1/2 lg:w-[394px] disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}
    </ModalContainer>
  );
}
