// src/app/(public)/components/booking/Cart.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Service } from "@/lib/types";
import { useRouter } from "next/navigation";

export interface CartProps {
  selectedServices: Service[];
  totalPrice: number;
  totalDuration: number;
}

export default function Cart({
  selectedServices,
  totalPrice,
  totalDuration,
}: CartProps) {
  const router = useRouter();

  if (selectedServices.length === 0) {
    return null;
  }

  const handleNextClick = () => {
    router.push("/book");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4">
      <Card className="container mx-auto max-w-4xl shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* --- 1. SERVICE LIST (Desktop/Tablet View Only) --- */}
            {/* This entire section is hidden on screens smaller than 640px */}
            <ScrollArea className="hidden sm:block flex-1 h-24 pr-4">
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <p className="font-medium truncate pr-2">{service.name}</p>
                    <p className="text-muted-foreground whitespace-nowrap">
                      ${service.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* --- 2. VERTICAL SEPARATOR (Desktop/Tablet View Only) --- */}
            <Separator
              orientation="vertical"
              className="h-24 mx-2 hidden sm:block"
            />

            {/* --- 3. TOTALS & BUTTON (Adapts to Screen Size) --- */}
            {/* On mobile, this div expands to fill the entire cart. */}
            {/* On larger screens, it shrinks to fit its content. */}
            <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              {/* Totals Section */}
              <div className="text-left">
                <p className="text-sm text-muted-foreground">
                  Duration:{" "}
                  <span className="font-bold text-foreground">
                    {totalDuration} mins
                  </span>
                </p>
                <p className="text-lg font-bold">
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNextClick}
                className="cursor-pointer"
                size="lg"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
