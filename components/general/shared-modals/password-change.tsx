"use client";
import {
  ModalStepId,
  PasswordHandler,
} from "@/app/(dashboard)/parent/settings/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalContainer } from "@/components/ui/modal-container";
import { ChangeEvent, FormEvent } from "react";

interface PasswordChangeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  passwordHandler: PasswordHandler;
  handlePasswordUpdate: (e: FormEvent<HTMLFormElement>) => void;
  handlePasswordVerification: (e: FormEvent<HTMLFormElement>) => void;
  modalStepsId: ModalStepId;
  errorText?: string | undefined;
  isLoading?: boolean;
}

export default function PasswordChange({
  onOpenChange,
  open,
  handleChange,
  passwordHandler,
  handlePasswordUpdate,
  handlePasswordVerification,
  modalStepsId,
  errorText,
  isLoading,
}: PasswordChangeProps) {
  return (
    <ModalContainer
      open={open}
      title={"System Verification"}
      onOpenChange={onOpenChange}
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
          {errorText && (
            <div className="py-2 px-4 text-destructive bg-destructive/10 text-sm w-full border border-destructive rounded-sm">
              <p>{errorText}</p>
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
