import AuthGuard from "@/components/common/Auth/AuthGuard";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard mode="protected" redirectTo="/auth">
      {children}
    </AuthGuard>
  );
}
