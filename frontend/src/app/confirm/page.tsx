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
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { SHOP_TIMEZONE } from "@/lib/utils";
import { AxiosError } from "axios";

export default function ConfirmPage() {
  const router = useRouter();
  const { selectedServices, bookingSelections, clearCart } = useCart();
  // --- NEW: State for form inputs ---
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState(""); // Can be an empty string

  // --- NEW: State for submission status ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Button is enabled only if name and phone are filled ---
  const isFormValid = name.trim() !== "" && phone.trim() !== "";

  const handleBookAppointment = async () => {
    if (
      !isFormValid ||
      !bookingSelections.shopId ||
      !bookingSelections.barberId ||
      !bookingSelections.date ||
      !bookingSelections.time
    ) {
      setError("Booking information is incomplete. Please start over.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Combine date and time to create the ISO 8601 start_time string
    const localDateTimeString = `${bookingSelections.date}T${bookingSelections.time}`;

    // 2. Interpret this string as a date/time in the SHOP's timezone.
    const utcDate = zonedTimeToUtc(localDateTimeString, SHOP_TIMEZONE);

    // 3. Format this UTC date into the ISO string the backend expects.
    const startTimeISO = utcDate.toISOString();

    try {
      // Construct the payload for the API
      const payload = {
        customer: { name, phone_number: phone, gender: gender || null },
        shop_id: bookingSelections.shopId,
        barber_id: bookingSelections.barberId,
        start_time: startTimeISO,
        service_ids: selectedServices.map((s) => s.id),
      };

      // Make the API call
      await createAppointment(payload);

      // On success: clear the cart and redirect
      clearCart();
      router.push("/success");
    } catch (err) {
      // <-- The 'err' is now of type 'unknown' by default in modern TS

      let errorMessage = "An unexpected error occurred.";

      // --- NEW: Type guard to check if it's an AxiosError ---
      if (err instanceof AxiosError) {
        // Now TypeScript knows that 'err' has a 'response' property
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
          {/* Name Field */}
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

          {/* Phone Field */}
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

          {/* Gender Dropdown */}
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

          {/* Display API Error if any */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* Book Appointment Button */}
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
