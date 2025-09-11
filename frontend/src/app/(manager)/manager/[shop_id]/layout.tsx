// src/app/(manager)/manager/[shop_id]/layout.tsx
import React from "react";
import { ManagerHeader } from "../_components/ManagerHeader";
import { getShopById } from "@/lib/api";
import type { Shop } from "@/lib/types";

interface ManagerLayoutProps {
  children: React.ReactNode;
  params:
    | {
        shop_id: string;
      }
    | Promise<{ shop_id: string }>; // <-- Accept Promise
}

export default async function ManagerLayout({
  children,
  params,
}: ManagerLayoutProps) {
  // Await params before using it
  const { shop_id } = await params;

  // Fetch shop data from your API
  const shop: Shop | null = await getShopById(shop_id);

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold">Shop not found</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ManagerHeader shopId={shop.id} />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
