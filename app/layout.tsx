import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strata — Layered Data Intelligence",
  description: "Enterprise analytics and data intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
