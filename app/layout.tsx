import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face Recognition",
  description: "A minimal Next.js face detection app using Luxand Cloud.",
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
