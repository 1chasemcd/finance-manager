import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Manager",
  description: "Track Spending and Manage Budgets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
