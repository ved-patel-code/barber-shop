// src/app/(manager)/manager/_components/ActiveAppointmentCard.tsx
"use client";

import { Clock, DollarSign, Loader2, User, Phone } from "lucide-react";

import type { ManagerAppointment } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ActiveAppointmentCardProps {
  appointment: ManagerAppointment;
  onComplete: (appointmentId: string) => void;
  isCompleting: boolean;
}

export function ActiveAppointmentCard({
  appointment,
  onComplete,
  isCompleting,
}: ActiveAppointmentCardProps) {
  // Calculate the total duration from all the services in the snapshot
  const totalDuration = appointment.services_snapshot.reduce(
    (total, service) => total + service.duration,
    0
  );

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{appointment.customer_name}</CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{appointment.customer_gender || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>{appointment.customer_phone}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-sm mb-2">
              {appointment.barber_name}
            </p>
            <Separator />
          </div>

          {/* Scrollable Service List */}
          <ScrollArea className="h-24 pr-4">
            <div className="space-y-2">
              {appointment.services_snapshot.map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span className="truncate pr-2">{service.name}</span>
                  <span className="font-mono">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Total Price</span>
            </div>
            <span>{formatCurrency(appointment.total_amount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Total Duration</span>
            </div>
            <span>{totalDuration} mins</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onComplete(appointment.id)}
          disabled={isCompleting}
        >
          {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Appointment
        </Button>
      </CardFooter>
    </Card>
  );
}
