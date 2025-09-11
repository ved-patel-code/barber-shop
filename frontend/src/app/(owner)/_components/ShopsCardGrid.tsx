// src/app/(owner)/_components/ShopsCardGrid.tsx
"use client";

import type { Shop } from "@/lib/types";
import { ShopsCard } from "./ShopsCard";

interface ShopsCardGridProps {
  shops: Shop[];
}

export function ShopsCardGrid({ shops }: ShopsCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {shops.length > 0 ? (
        shops.map((shop) => <ShopsCard key={shop.id} shop={shop} />)
      ) : (
        <p className="text-center text-muted-foreground col-span-full">
          No shops found.
        </p>
      )}
    </div>
  );
}
