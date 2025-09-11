// src/app/(owner)/_components/ShopsCard.tsx
"use client";

import type { Shop } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShopCardProps {
  shop: Shop;
}

export function ShopsCard({ shop }: ShopCardProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg">{shop.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Address
          </span>
          <p className="text-base">{shop.address}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Contact Info
          </span>
          <p className="text-base">{shop.phone_number}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Tax Rate
          </span>
          <p className="text-base">{(shop.tax_rate * 100).toFixed(0)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
