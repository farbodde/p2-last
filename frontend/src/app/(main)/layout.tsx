import WelcomeModal from "@/components/common/Auth/WelcomeModal";
import MainTab from "@/components/layouts/MainTab";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <WelcomeModal />
      <MainTab />
    </div>
  );
}
