"use client";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { AppQueryProvider } from "@/lib/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppQueryProvider>
      <HeroUIProvider>
        <ToastProvider placement="top-center" maxVisibleToasts={3} />
        {children}
      </HeroUIProvider>
    </AppQueryProvider>
  );
}
