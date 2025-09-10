import React from "react";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner"; // <-- Import Toaster

export default function ManagerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster richColors /> {/* <-- Add Toaster component here */}
    </>
  );
}
