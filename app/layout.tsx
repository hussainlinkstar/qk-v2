import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joe — WhatsApp Sales",
  description: "Joseph Mews WhatsApp Sales Agent preview",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
