import "./globals.css";
import { Providers } from "@/providers";
import { siteMetadata } from "@/config/metadata.config";

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="ltr"
      className="flex min-h-screen items-center justify-center"
    >
      <body className="width-screen min-h-screen bg-background dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
