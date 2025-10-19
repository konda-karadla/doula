import type { Metadata } from "next";
import { ClientProviders } from "@/lib/providers/client-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Portal - Health Platform",
  description: "Administrative dashboard for Health Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
