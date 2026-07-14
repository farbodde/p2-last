"use client";

import Button from "@/components/base/Button";
import InputController from "@/components/base/Form/InputController";
import Alert from "@/components/common/Alert";
import AuthBackground from "@/components/common/Auth/AuthBackground";
import BackButton from "@/components/common/BackButton";
import { useForm } from "react-hook-form";

type SignUpDisplayNameFormValues = {
  display_name: string;
};

type SignUpDisplayNameViewProps = {
  defaultValue?: string;
  onBack: () => void;
  onSubmit: (display_name: string) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string[];
};

const SignUpDisplayNameView = ({
  defaultValue = "",
  onBack,
  onSubmit,
  isSubmitting = false,
  submitError = [],
}: SignUpDisplayNameViewProps) => {
  const { control, handleSubmit } = useForm<SignUpDisplayNameFormValues>({
    defaultValues: {
      display_name: defaultValue,
    },
  });

  const handleCreateAccount = handleSubmit(async ({ display_name }) => {
    await onSubmit(display_name);
  });

  return (
    <AuthBackground className="flex min-h-screen flex-col gap-10 p-6">
      <header className="z-20 flex w-full items-center">
        <BackButton onClose={onBack} />
      </header>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Display Name</h1>
          <p className="text-lg text-gray-300/80">Visible to other players</p>
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
          onSubmit={handleCreateAccount}
          className="flex flex-col gap-8"
        >
          <InputController
            control={control}
            label="Display Name"
            name="display_name"
            classes={{
              wrapper: "bg-background/80",
              label: "bg-transparent",
              labelFocused: "text-white/40",
            }}
            rules={{
              required: "Display Name field is required!",
              minLength: {
                value: 3,
                message: "Display Name must be at least 3 characters.",
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
          isDisabled={isSubmitting}
        >
          Create Account
        </Button>
      </section>
    </AuthBackground>
  );
};

export default SignUpDisplayNameView;
