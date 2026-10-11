import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sync Academy Tutor",
  description: "An AI tutor for IGCSE Computer Science that teaches, not tells",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
