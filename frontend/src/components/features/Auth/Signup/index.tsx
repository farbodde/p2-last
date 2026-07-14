"use client";

import SignUpDisplayNameView from "@/components/features/Auth/SignUpDisplayName";
import SignUpEmailPasswordView from "@/components/features/Auth/SignUpEmailPassword";
import { getApiErrorList } from "@/helpers/api-error";
import {
  useGoogleLoginMutation,
  useSignupMutation,
} from "@/hooks/mutations/useAuthMutations";
import { persistAuthSession } from "@/lib/auth";
import { requestGoogleCredential } from "@/services/google-auth.service";
import type { SignupPayload } from "@/types/auth.types";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SignupStep = "credentials" | "displayName";

type SignupCredentialsValues = Pick<
  SignupPayload,
  "email" | "password" | "confirm_password"
>;

const SignUpView = () => {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("credentials");
  const [submitError, setSubmitError] = useState<string[]>([]);
  const signupMutation = useSignupMutation();
  const googleLoginMutation = useGoogleLoginMutation();
  const [signupValues, setSignupValues] = useState<SignupPayload>({
    email: "",
    display_name: "",
    password: "",
    confirm_password: "",
  });

  const handleAuthError = (error: any, fallbackMessage: string) => {
    setSubmitError(getApiErrorList(error, fallbackMessage));
  };

  const handleCredentialsSubmit = (values: SignupCredentialsValues) => {
    setSubmitError([]);
    setSignupValues((currentValues) => ({
      ...currentValues,
      ...values,
    }));
    setStep("displayName");
  };

  const handleBackToCredentials = () => {
    setSubmitError([]);
    setStep("credentials");
  };

  const handleGoogleSignup = async () => {
    if (googleLoginMutation.isPending) {
      return;
    }

    setSubmitError([]);

    try {
      const token = await requestGoogleCredential();
      const response = await googleLoginMutation.mutateAsync({
        token,
      });

      persistAuthSession(response);
      router.push("/");
    } catch (error: any) {
      handleAuthError(error, "Google signup failed. Please try again.");
    }
  };

  const handleDisplayNameSubmit = async (display_name: string) => {
    setSubmitError([]);

    try {
      const response = await signupMutation.mutateAsync({
        ...signupValues,
        display_name,
      });

      router.push(
        `/auth/signin?message=${encodeURIComponent(response.message)}`,
      );
    } catch (error: any) {
      handleAuthError(error, "Signup failed. Please try again.");
    }
  };

  if (step === "displayName") {
    return (
      <SignUpDisplayNameView
        defaultValue={signupValues.display_name}
        onBack={handleBackToCredentials}
        onSubmit={handleDisplayNameSubmit}
        isSubmitting={signupMutation.isPending}
        submitError={submitError}
      />
    );
  }

  return (
    <SignUpEmailPasswordView
      defaultValues={signupValues}
      onSubmit={handleCredentialsSubmit}
      onGoogleSignup={handleGoogleSignup}
      isGoogleSubmitting={googleLoginMutation.isPending}
      submitError={submitError}
    />
  );
};

export default SignUpView;
