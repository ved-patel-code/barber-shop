// src/app/book/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCart } from "../components/context/CartContext";
import { useRouter } from "next/navigation";
import {
  getAllShops,
  getBarbersByShopId,
  getAvailableDates,
  getAvailableSlots,
} from "@/lib/api";
import type { Shop, Barber } from "@/lib/types";
import { formatInTimeZone } from "date-fns-tz";
import { SHOP_TIMEZONE } from "@/lib/utils";

export default function BookingPage() {
  const { selectedServices, totalPrice, totalDuration, setBookingSelections } =
    useCart();
  const router = useRouter();

  // State to hold selected IDs for UI dropdowns
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // State to hold fetched data as full objects/strings
  const [shops, setShops] = useState<Shop[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState({
    shops: false,
    barbers: false,
    dates: false,
    times: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch all shops on component mount
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading((prev) => ({ ...prev, shops: true }));
      setError(null);
      try {
        const fetchedShops = await getAllShops();
        setShops(fetchedShops);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops.");
      } finally {
        setIsLoading((prev) => ({ ...prev, shops: false }));
      }
    };
    fetchShops();
  }, []);

  // Fetch barbers when selectedShopId changes
  useEffect(() => {
    if (selectedShopId) {
      const fetchBarbers = async () => {
        setIsLoading((prev) => ({ ...prev, barbers: true }));
        setError(null);
        try {
          const fetchedBarbers = await getBarbersByShopId(selectedShopId);
          setBarbers(fetchedBarbers);
          // Reset subsequent selections
          setSelectedBarberId(null);
          setSelectedDate(null);
          setSelectedTime(null);
        } catch (err) {
          console.error(
            `Error fetching barbers for shop ${selectedShopId}:`,
            err
          );
          setError(`Failed to load barbers for selected shop.`);
          setBarbers([]);
        } finally {
          setIsLoading((prev) => ({ ...prev, barbers: false }));
        }
      };
      fetchBarbers();
    } else {
      setBarbers([]);
      setSelectedBarberId(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedShopId]);

  // Fetch dates when selectedBarberId changes
  useEffect(() => {
    if (selectedShopId && selectedBarberId) {
      const fetchDates = async () => {
        setIsLoading((prev) => ({ ...prev, dates: true }));
        setError(null);
        try {
          const fetchedDates = await getAvailableDates(
            selectedShopId,
            selectedBarberId
          );
          setDates(fetchedDates);
          // Reset subsequent selections
          setSelectedDate(null);
          setSelectedTime(null);
        } catch (err) {
          console.error(
            `Error fetching dates for barber ${selectedBarberId}:`,
            err
          );
          setError(`Failed to load available dates.`);
          setDates([]);
        } finally {
          setIsLoading((prev) => ({ ...prev, dates: false }));
        }
      };
      fetchDates();
    } else {
      setDates([]);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedShopId, selectedBarberId]);

  // Fetch time slots when selectedDate changes
  useEffect(() => {
    if (
      selectedShopId &&
      selectedBarberId &&
      selectedDate &&
      totalDuration > 0
    ) {
      const fetchTimes = async () => {
        setIsLoading((prev) => ({ ...prev, times: true }));
        setError(null);
        try {
          const fetchedTimes = await getAvailableSlots(
            selectedShopId,
            selectedBarberId,
            selectedDate,
            totalDuration
          );
          setTimes(fetchedTimes);
          // Reset subsequent selections
          setSelectedTime(null);
        } catch (err) {
          console.error(`Error fetching times for date ${selectedDate}:`, err);
          setError(`Failed to load available time slots.`);
          setTimes([]);
        } finally {
          setIsLoading((prev) => ({ ...prev, times: false }));
        }
      };
      fetchTimes();
    } else {
      setTimes([]);
      setSelectedTime(null);
    }
  }, [selectedShopId, selectedBarberId, selectedDate, totalDuration]);

  // Helper to format date string for display
  const formatDateForDisplay = (dateStr: string) => {
    return formatInTimeZone(dateStr, SHOP_TIMEZONE, "EEE, MMM d");
  };

  const handleNextClick = () => {
    // Find the full shop and barber objects from our state arrays
    const shop = shops.find((s) => s.id === selectedShopId);
    const barber = barbers.find((b) => b.id === selectedBarberId);

    if (shop && barber && selectedDate && selectedTime) {
      // Save the FULL objects to the context
      setBookingSelections({
        shop: shop,
        barber: barber,
        date: selectedDate,
        time: selectedTime,
      });
      router.push("/confirm");
    } else {
      alert("Please complete all selections before proceeding.");
    }
  };

  // Ensure services are selected before allowing booking flow
  if (selectedServices.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center space-y-4">
        <h1 className="text-3xl font-bold">Book Your Appointment</h1>
        <p className="text-muted-foreground">
          Please select services first from the{" "}
          <Link href="/services" className="text-primary hover:underline">
            Services Page
          </Link>
          .
        </p>
        <Button onClick={() => router.push("/services")}>Go to Services</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Book Your Appointment</h1>

      {error && <div className="text-red-500 text-center">{error}</div>}
      <Card>
        <CardHeader>
          <CardTitle>Cart Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServices.length === 0 ? (
            <p className="text-muted-foreground">No services selected yet.</p>
          ) : (
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between">
                  <span>{service.name}</span>
                  <span>${service.price.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Duration</span>
                <span>{totalDuration} mins</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Price</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 1: Choose a Shop */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Choose a Shop</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading.shops ? (
            <p>Loading shops...</p>
          ) : (
            <Select
              onValueChange={(value) => setSelectedShopId(value)}
              value={selectedShopId ?? ""}
              disabled={isLoading.shops || shops.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Shop" />
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
        </CardContent>
      </Card>

      {/* Step 2: Choose a Barber (conditionally rendered) */}
      {selectedShopId && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Choose a Barber</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading.barbers ? (
              <p>Loading barbers...</p>
            ) : (
              <Select
                onValueChange={(value) => setSelectedBarberId(value)}
                value={selectedBarberId ?? ""}
                disabled={isLoading.barbers || barbers.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Barber" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Choose a Date (conditionally rendered) */}
      {selectedBarberId && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Choose a Date</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading.dates ? (
              <p>Loading dates...</p>
            ) : dates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {dates.map((date) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    onClick={() => setSelectedDate(date)}
                  >
                    {formatDateForDisplay(date)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No available dates found for this barber in the next 7 days.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Choose a Time Slot (conditionally rendered) */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Choose a Time Slot</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading.times ? (
              <p>Loading times...</p>
            ) : times.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {times.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No available time slots for this date. This may be due to the
                total duration of your selected services.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Final Step: Next Button */}
      <div className="flex justify-end">
        <Button onClick={handleNextClick} disabled={!selectedTime}>
          Next
        </Button>
      </div>
    </div>
  );
}
