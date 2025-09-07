// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/shared/Header"; // <-- IMPORT THE HEADER

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Barber Shop",
  description: "Book your next appointment online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header /> {/* <-- ADD THE HEADER COMPONENT HERE */}
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
