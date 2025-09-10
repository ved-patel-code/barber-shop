// src/app/manager/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllShops } from "@/lib/api";
import type { Shop } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerShopSelectionPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This function runs when the component is first loaded.
    const fetchShops = async () => {
      try {
        const fetchedShops = await getAllShops();
        setShops(fetchedShops);
      } catch (error) {
        // The error is already logged in the api.ts file
        // You could add UI feedback here, like a toast notification
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []); // The empty array [] means this effect runs only once.

  const handleShopSelect = (shopId: string) => {
    if (!shopId) return;
    // Redirect the manager to the dashboard for the selected shop.
    // We default to the 'active-appointments' page as planned.
    router.push(`/manager/${shopId}/active-appointments`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Manager Dashboard</CardTitle>
          <CardDescription>Please select a shop to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              // Display a skeleton loader while fetching data
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                onValueChange={handleShopSelect}
                disabled={shops.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      shops.length > 0
                        ? "Select a shop..."
                        : "No shops available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
