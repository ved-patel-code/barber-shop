// src/app/(manager)/manager/[shop_id]/layout.tsx
import React from "react";
import { ManagerHeader } from "../_components/ManagerHeader";

interface ManagerLayoutProps {
  children: React.ReactNode;
  params: {
    shop_id: string;
  };
}

// Make layout async
export default async function ManagerLayout({
  children,
  params,
}: ManagerLayoutProps) {
  // Await params before using
  const awaitedParams = await params;
  const { shop_id } = awaitedParams;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ManagerHeader shopId={shop_id} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
