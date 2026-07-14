"use client";

import Button from "@/components/base/Button";
import InputController from "@/components/base/Form/InputController";
import Alert from "@/components/common/Alert";
import AuthBackground from "@/components/common/Auth/AuthBackground";
import BackButton from "@/components/common/BackButton";
import { EMAIL_REGEX, isCommonPassword } from "@/helpers/regex";
import type { SignupPayload } from "@/types/auth.types";
import Image from "next/image";
import { useForm } from "react-hook-form";

type SignupCredentialsValues = Pick<
  SignupPayload,
  "email" | "password" | "confirm_password"
>;

type SignUpEmailPasswordViewProps = {
  defaultValues?: Partial<SignupPayload>;
  onSubmit: (values: SignupCredentialsValues) => void;
  onGoogleSignup?: () => Promise<void> | void;
  isGoogleSubmitting?: boolean;
  submitError?: string[];
};

const SignUpEmailPasswordView = ({
  defaultValues,
  onSubmit,
  onGoogleSignup,
  isGoogleSubmitting = false,
  submitError = [],
}: SignUpEmailPasswordViewProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupCredentialsValues>({
    defaultValues: {
      email: defaultValues?.email ?? "",
      password: defaultValues?.password ?? "",
      confirm_password: defaultValues?.confirm_password ?? "",
    },
  });

  const handleNextStep = handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <AuthBackground className="flex min-h-screen flex-col gap-10 p-6">
      <header className="z-20 flex w-full items-center">
        <BackButton />
      </header>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Sign Up</h1>
          <p className="text-lg text-gray-300/80">Lets Get Started!</p>
        </div>

        {submitError.length > 0 && (
          <Alert
            type="error"
            title="Unable to create account"
            message={
              <ul className="list-disc pl-5">
                {submitError.map((errorMessage) => (
                  <li key={errorMessage}>{errorMessage}</li>
                ))}
              </ul>
            }
            dismissible={false}
          />
        )}

        <form
          id="authForm"
          onSubmit={handleNextStep}
          className="flex flex-col gap-8"
        >
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
          <InputController
            type="password"
            control={control}
            label="Password"
            name="password"
            classes={{
              wrapper: "bg-background/80",
              label: "bg-transparent",
              labelFocused: "text-white/40",
            }}
            rules={{
              required: "Password field is required!",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters.",
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
            label="Confirm Password"
            classes={{
              wrapper: "bg-background/80",
              label: "bg-transparent",
              labelFocused: "text-white/40",
            }}
            rules={{
              required: "Confirm Password is required",
              validate: (value, formFields) => {
                if (formFields.password !== value) {
                  return "Passwords do not match";
                }

                return true;
              },
            }}
          />
        </form>
      </section>
      <section className="mt-auto flex flex-col gap-6 py-6">
        <Button
          type="submit"
          form="authForm"
          color="primary"
          isLoading={isSubmitting}
          isDisabled={isSubmitting || isGoogleSubmitting}
        >
          Continue
        </Button>
        <span className="relative flex items-center justify-center">
          <span className="absolute block h-0.5 w-full bg-white/30" />
          <span className="relative z-10 bg-background px-2 text-center text-sm text-white/60">
            OR REGISTER WITH
          </span>
        </span>
        <Button
          className="bg-[#252932] h-12 flex items-center justify-between text-white"
          onPress={onGoogleSignup}
          isLoading={isGoogleSubmitting}
          isDisabled={isSubmitting || isGoogleSubmitting}
        >
          <Image
            src="/images/google-icon.png"
            alt="Google"
            width={32}
            height={32}
            className="w-8"
          />
          <span>Sign up with Google</span>
          <span className="w-8" />
        </Button>
      </section>
    </AuthBackground>
  );
};

export default SignUpEmailPasswordView;
