// src/app/confirm/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useCart } from "../components/context/CartContext";
import { createAppointment } from "@/lib/api";
import { zonedTimeToUtc } from "date-fns-tz";
import { SHOP_TIMEZONE } from "@/lib/utils";
import { AxiosError } from "axios";
import type { AppointmentPayload } from "@/lib/types";

export default function ConfirmPage() {
  const router = useRouter();
  const {selectedServices,bookingSelections,clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = name.trim() !== "" && phone.trim() !== "";

  const handleBookAppointment = async () => {
    const { shop, barber, date, time } = bookingSelections;

    if (
      !isFormValid ||
      !shop ||
      !barber ||
      !date ||
      !time ||
      selectedServices.length === 0
    ) {
      setError("Booking information is incomplete. Please start over.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const utcDate = zonedTimeToUtc(`${date}T${time}`, SHOP_TIMEZONE);
    const startTimeISO = utcDate.toISOString();

    try {
      const payload: AppointmentPayload = {
        customer_name: name,
        customer_phone: phone,
        customer_gender: gender || null,
        shop_id: shop.id,
        shop_name: shop.name,
        barber_id: barber.id,
        barber_name: barber.name,
        start_time: startTimeISO,
        service_snapshots: selectedServices.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          price: s.price,
        })),
        tax_rate: shop.tax_rate,
        is_walk_in: false,
        status: "Booked",
      };

      await createAppointment(payload);
      clearCart();
      router.push("/success");
    } catch (err) {
      let errorMessage = "An unexpected error occurred.";

      if (err instanceof AxiosError) {
        errorMessage =
          err.response?.data?.detail || "An error occurred during booking.";
      }

      console.error("Booking failed:", err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Confirm Your Appointment</h1>

      <Card className="max-w-lg mx-auto shadow-md">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-muted-foreground"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-muted-foreground"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-muted-foreground"
            >
              Gender
            </label>
            <Select
              onValueChange={(value) => setGender(value)}
              value={gender}
              disabled={isSubmitting}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleBookAppointment}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}