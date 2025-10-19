import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/lib/providers/client-providers";

export const metadata: Metadata = {
  title: "Health Platform",
  description: "Your personalized health journey platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
