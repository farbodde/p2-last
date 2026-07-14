"use client";

import Button from "@/components/base/Button";
import InputController from "@/components/base/Form/InputController";
import Alert from "@/components/common/Alert";
import AuthBackground from "@/components/common/Auth/AuthBackground";
import BackButton from "@/components/common/BackButton";
import { getApiErrorList } from "@/helpers/api-error";
import {
  useGoogleLoginMutation,
  useLoginMutation,
} from "@/hooks/mutations/useAuthMutations";
import { EMAIL_REGEX } from "@/helpers/regex";
import { persistAuthSession } from "@/lib/auth";
import type { LoginPayload } from "@/types/auth.types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SIGN_IN_TIMEOUT = 15000;

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google login is only available in the browser."),
    );
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Sign-In.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const SignInView = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string[]>([]);
  const loginMutation = useLoginMutation();
  const googleLoginMutation = useGoogleLoginMutation();
  const { control, handleSubmit } = useForm<LoginPayload>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    loadGoogleScript().catch(() => {});
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError([]);

    try {
      const response = await loginMutation.mutateAsync(values);

      persistAuthSession(response);
      router.push("/");
    } catch (error) {
      setSubmitError(getApiErrorList(error, "Login failed. Please try again."));
    }
  });

  const handleGoogleSignIn = async () => {
    if (googleLoginMutation.isPending) {
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setSubmitError(["Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID."]);
      return;
    }

    setSubmitError([]);

    try {
      await loadGoogleScript();

      await new Promise<void>((resolve, reject) => {
        let isSettled = false;
        const timeoutId = window.setTimeout(() => {
          if (isSettled) {
            return;
          }

          isSettled = true;
          reject(
            new Error(
              "Google sign-in did not complete. Check Google OAuth origin settings and try again.",
            ),
          );
        }, GOOGLE_SIGN_IN_TIMEOUT);

        const resolveOnce = () => {
          if (isSettled) {
            return;
          }

          isSettled = true;
          window.clearTimeout(timeoutId);
          resolve();
        };

        const rejectOnce = (error: Error) => {
          if (isSettled) {
            return;
          }

          isSettled = true;
          window.clearTimeout(timeoutId);
          reject(error);
        };

        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            if (!credential) {
              rejectOnce(new Error("Google did not return an ID token."));
              return;
            }

            try {
              const response = await googleLoginMutation.mutateAsync({
                token: credential,
              });

              persistAuthSession(response);
              router.push("/");
              resolveOnce();
            } catch (requestError) {
              rejectOnce(
                requestError instanceof Error
                  ? requestError
                  : new Error("Google login failed. Please try again."),
              );
            }
          },
          error_callback: () => {
            rejectOnce(new Error("Google sign-in was cancelled."));
          },
        });

        if (!window.google?.accounts.id) {
          rejectOnce(new Error("Google Sign-In client failed to initialize."));
          return;
        }

        window.google.accounts.id.prompt();
      });
    } catch (error: any) {
      setSubmitError(
        getApiErrorList(error, "Google login failed. Please try again."),
      );
    }
  };

  return (
    <AuthBackground className="flex min-h-screen flex-col gap-10 p-6">
      <header className="z-20 flex w-full items-center">
        <BackButton />
      </header>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Sign In</h1>
          <p className="text-lg text-gray-300/80">Hey! Welcome Back</p>
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
            }}
          />

          <Button
            as={Link}
            href="/auth/forgot"
            variant="light"
            className="mx-auto w-fit font-medium text-white/30"
          >
            Forgot Password?
          </Button>
        </form>
      </section>
      <section className="mt-auto flex flex-col gap-6 py-6">
        <Button
          type="submit"
          form="authForm"
          color="primary"
          isLoading={loginMutation.isPending}
          isDisabled={loginMutation.isPending || googleLoginMutation.isPending}
        >
          Log in
        </Button>
        <span className="relative flex items-center justify-center">
          <span className="absolute block h-0.5 w-full bg-white/30" />
          <span className="relative z-10 bg-background px-2 text-center text-sm text-white/60">
            OR LOGIN WITH
          </span>
        </span>
        <Button
          className="bg-[#252932] h-12 flex items-center justify-between text-white"
          onPress={handleGoogleSignIn}
          isLoading={googleLoginMutation.isPending}
          isDisabled={loginMutation.isPending || googleLoginMutation.isPending}
        >
          <Image
            src="/images/google-icon.png"
            alt="Google"
            width={32}
            height={32}
            className="w-8"
          />
          <span>Continue with Google</span>
          <span className="w-8" />
        </Button>
      </section>
    </AuthBackground>
  );
};

export default SignInView;
