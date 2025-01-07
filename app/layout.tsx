import type { Metadata } from "next";
import { ClientWalletProvider } from "@/provider/ClientWalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIPI Assistant",
  description: "Your friendly frog assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWalletProvider>
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  );
}
