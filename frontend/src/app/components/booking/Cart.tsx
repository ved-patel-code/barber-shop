// src/app/components/booking/Cart.tsx
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="container mx-auto max-w-4xl shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <ScrollArea className="h-24 w-full max-w-md">
              <div className="space-y-2 pr-4">
                {selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator orientation="vertical" className="h-24 mx-4" />

            <div className="flex flex-col items-end justify-between h-24 min-w-[200px]">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Total Duration:{" "}
                  <span className="font-bold text-foreground">
                    {totalDuration} mins
                  </span>
                </p>
                <p className="text-lg font-bold">
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>
              <Button onClick={handleNextClick} className="w-full cursor-pointer">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
