"use client";
import { useForm } from "react-hook-form";
import Header from "@/components/layouts/Header";
import InputController from "@/components/base/Form/InputController";
import Button from "@/components/base/Button";
import { isCommonPassword } from "@/helpers/regex";
import Alert from "@/components/common/Alert";
import { getApiErrorList } from "@/helpers/api-error";
import { useChangePasswordMutation } from "@/hooks/mutations/useAuthMutations";
import type { ChangePasswordPayload } from "@/types/auth.types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ChangePasswordPage = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string[]>([]);
  const changePasswordMutation = useChangePasswordMutation();
  const {
    control,
    handleSubmit,
  } = useForm<ChangePasswordPayload>({
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError([]);

    try {
      await changePasswordMutation.mutateAsync(values);
      router.back();
    } catch (error) {
      setSubmitError(
        getApiErrorList(error, "Failed to change password. Please try again."),
      );
    }
  });

  return (
    <section className="flex flex-col min-h-screen">
      <Header title="Change Password" hasBack />
      <form onSubmit={onSubmit} className="flex flex-1 flex-col p-4 gap-6">
        {submitError.length > 0 ? (
          <Alert
            type="error"
            title="Unable to change password"
            message={
              <ul className="list-disc pl-5">
                {submitError.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            }
            className="grow-0"
            dismissible={false}
          />
        ) : null}

        <InputController
          type="password"
          control={control}
          name="old_password"
          label="Old Password"
          isDisabled={changePasswordMutation.isPending}
          rules={{
            required: "Old Password is required",
          }}
        />
        <InputController
          type="password"
          control={control}
          name="new_password"
          label="New Password"
          isDisabled={changePasswordMutation.isPending}
          rules={{
            required: "New Password is required",
            minLength: {
              value: 6,
              message: "New Password must be at least 6 characters",
            },
            validate: (value) =>
              !isCommonPassword(value) ||
              "Please choose a less common password.",
          }}
        />
        <InputController
          type="password"
          control={control}
          name="confirm_password"
          label="Repeat New Password"
          isDisabled={changePasswordMutation.isPending}
          rules={{
            required: "Confirm Password is required",
            validate: (value, formFields) => {
              if (formFields.new_password !== value)
                return "Confirm password does not match";
              return true;
            },
          }}
        />

        <Button
          type="submit"
          className="mt-auto"
          color="primary"
          isLoading={changePasswordMutation.isPending}
          isDisabled={changePasswordMutation.isPending}
        >
          Update Password
        </Button>
      </form>
    </section>
  );
};

export default ChangePasswordPage;
