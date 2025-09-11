// src/app/(owner)/owner/shops/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle } from "lucide-react";
import { getOwnerShops } from "@/lib/api";
import type { Shop } from "@/lib/types";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShopsTable } from "../../_components/ShopsTable";
import { ShopsCardGrid } from "../../_components/ShopsCardGrid";
import { AddShopDialog } from "../../_components/AddShopDialog";

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShops = useCallback(async () => {
    setIsLoading(true);
    const fetchedShops = await getOwnerShops();
    setShops(fetchedShops);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shops</h1>
          <p className="text-muted-foreground">
            View and manage your business locations.
          </p>
        </div>
        <div>
          <AddShopDialog onShopAdded={loadShops}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Shop
            </Button>
          </AddShopDialog>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-lg" />
      ) : (
        <div>
          {/* Desktop View: Correctly hidden on small screens */}
          <div className="hidden md:block">
            <ShopsTable shops={shops} />
          </div>

          {/* Mobile View: FIX IS HERE */}
          <div className="md:hidden">
            {" "}
            {/* Changed "md-hidden" to "md:hidden" */}
            <ShopsCardGrid shops={shops} />
          </div>
        </div>
      )}
    </div>
  );
}
