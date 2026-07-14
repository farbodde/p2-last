"use client";

import Button from "@/components/base/Button";
import InputController from "@/components/base/Form/InputController";
import AuthBackground from "@/components/common/Auth/AuthBackground";
import BackButton from "@/components/common/BackButton";
import { getApiErrorList } from "@/helpers/api-error";
import { useForgotPasswordMutation } from "@/hooks/mutations/useAuthMutations";
import { EMAIL_REGEX } from "@/helpers/regex";
import type { ForgotPasswordPayload } from "@/types/auth.types";
import { useState } from "react";
import { useForm } from "react-hook-form";

const ForgotPasswordView = () => {
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();
  const {
    control,
    handleSubmit,
  } = useForm<ForgotPasswordPayload>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const response = await forgotPasswordMutation.mutateAsync(values);
      setSubmitSuccess(response.message);
    } catch (error) {
      setSubmitError(
        getApiErrorList(
          error,
          "Failed to send recovery email. Please try again.",
        )[0],
      );
    }
  });

  return (
    <AuthBackground className="flex min-h-screen flex-col gap-10 p-6">
      <header className="z-20 flex w-full items-center">
        <BackButton />
      </header>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Forgot Password</h1>
          <p className="text-lg text-gray-300/80">
            We&apos;ll help you reset it
          </p>
        </div>

        <form id="authForm" onSubmit={onSubmit} className="flex flex-col gap-8">
          <InputController
            type="email"
            control={control}
            label="Email"
            name="email"
            classes={{
              wrapper: "bg-background/80",
              label: "bg-transparent",
              labelFocused: "text-white/40",
            }}
            rules={{
              required: "Email field is required!",
              pattern: {
                value: EMAIL_REGEX,
                message: "Enter a valid email address.",
              },
            }}
          />
          {(submitError || submitSuccess) && (
            <p
              className={
                submitError
                  ? "text-sm text-danger"
                  : "text-sm text-success"
              }
            >
              {submitError || submitSuccess}
            </p>
          )}
        </form>
      </section>
      <section className="mt-auto flex flex-col gap-6 py-6">
        <Button
          type="submit"
          form="authForm"
          color="primary"
          isLoading={forgotPasswordMutation.isPending}
          isDisabled={forgotPasswordMutation.isPending}
        >
          Send Recovery Email
        </Button>
      </section>
    </AuthBackground>
  );
};

export default ForgotPasswordView;
