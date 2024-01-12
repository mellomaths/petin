import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { BrandColor } from './_config/branding';

export const metadata: Metadata = {
  title: "Petin",
  description: "Petin; adote seu Pet!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      {children}
    </html>
  );
}
