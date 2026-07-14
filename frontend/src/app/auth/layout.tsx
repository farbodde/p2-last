import AuthGuard from "@/components/common/Auth/AuthGuard";


export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard mode="guest-only" redirectTo="/">
      {children}
    </AuthGuard>
  );
}
