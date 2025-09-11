// src/app/(owner)/owner/staff/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getOwnerStaff, getOwnerShops } from "@/lib/api"; // <-- 1. Import getOwnerShops
import type { OwnerStaffMember, Shop } from "@/lib/types"; // <-- 2. Import Shop type
import { StaffTable } from "../../_components/StaffTable";
import { StaffCardGrid } from "../../_components/StaffCardGrid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <-- 3. Import Select components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // <-- For filter card styling

export default function StaffPage() {
  const [staff, setStaff] = useState<OwnerStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4. Add state for shops and the selected shop filter
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);
  const [selectedShopId, setSelectedShopId] = useState<string | undefined>(
    undefined
  );

  // 5. useEffect to fetch staff based on the selectedShopId
  useEffect(() => {
    const loadStaff = async () => {
      setIsLoading(true);
      // Pass selectedShopId to the API call. If it's undefined, all staff are fetched.
      const fetchedStaff = await getOwnerStaff(selectedShopId);
      setStaff(fetchedStaff);
      setIsLoading(false);
    };

    loadStaff();
  }, [selectedShopId]);

  // 6. useEffect to fetch the list of shops for the filter dropdown
  useEffect(() => {
    const loadShops = async () => {
      setIsLoadingShops(true);
      const fetchedShops = await getOwnerShops();
      setShops(fetchedShops);
      setIsLoadingShops(false);
    };
    loadShops();
  }, []); // Runs once on page load

  // Handler for the shop filter dropdown
  const handleShopSelect = (shopValue: string) => {
    // This directly triggers the useEffect for loading staff
    setSelectedShopId(shopValue === "all" ? undefined : shopValue);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <p className="text-muted-foreground">
          View and manage staff members across all shops.
        </p>
      </div>

      {/* 7. Filter Card Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={handleShopSelect}
            value={selectedShopId || "all"}
            disabled={isLoadingShops || isLoading}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="All Shops" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shops</SelectItem>
              {isLoadingShops ? (
                <SelectItem value="loading-shops" disabled>
                  Loading shops...
                </SelectItem>
              ) : (
                shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-lg" />
      ) : (
        <div>
          {/* Desktop View */}
          <div className="hidden md:block">
            <StaffTable staff={staff} />
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <StaffCardGrid staff={staff} />
          </div>
        </div>
      )}
    </div>
  );
}
