"use client";

import { hasAuthSession, subscribeToAuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

type AuthGuardMode = "protected" | "guest-only";

type AuthGuardProps = {
  children: React.ReactNode;
  mode: AuthGuardMode;
  redirectTo: string;
};

const shouldRedirect = (mode: AuthGuardMode, isAuthenticated: boolean) => {
  if (mode === "protected") {
    return !isAuthenticated;
  }

  return isAuthenticated;
};

const subscribeToClientReady = () => () => undefined;

const AuthGuard = ({ children, mode, redirectTo }: AuthGuardProps) => {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthSession,
    hasAuthSession,
    () => false,
  );
  const isAllowed = isClient && !shouldRedirect(mode, isAuthenticated);

  useEffect(() => {
    if (isClient && !isAllowed) {
      router.replace(redirectTo);
    }
  }, [isAllowed, isClient, redirectTo, router]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
