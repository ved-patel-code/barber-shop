// src/app/manager/[shop_id]/layout.tsx
import React from "react";
import { ManagerHeader } from "../_components/ManagerHeader";

interface ManagerLayoutProps {
  children: React.ReactNode;
  params: {
    shop_id: string;
  };
}

interface ManagerLayoutProps {
  children: React.ReactNode;
  params: {
    shop_id: string;
  };
}

// This is a Server Component. It fetches the `shop_id` from the URL params
// and passes it down to the client-side Header component.
export default async function ManagerLayout({
  children,
  params,
}: ManagerLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <ManagerHeader shopId={params.shop_id} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}