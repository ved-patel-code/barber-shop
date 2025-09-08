// src/app/book/page.tsx
"use client";

import { useEffect, useState } from "react"; // <-- ADD useEffect
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
// --- NEW IMPORTS ---
import {
  getAllShops,
  getBarbersByShopId,
  getAvailableDates,
  getAvailableSlots,
} from "@/lib/api";
import type { Shop, Barber } from "@/lib/types";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { SHOP_TIMEZONE } from "@/lib/utils";
// --- END NEW IMPORTS ---

export default function BookingPage() {
  const { selectedServices, totalPrice, totalDuration, setBookingSelections } =
    useCart();
  const router = useRouter();

  // --- State Management for Booking Flow ---
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // --- State for holding fetched data from API ---
  const [shops, setShops] = useState<Shop[]>([]); // <-- USE Shop type
  const [barbers, setBarbers] = useState<Barber[]>([]); // <-- USE Barber type
  const [dates, setDates] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState({
    shops: false,
    barbers: false,
    dates: false,
    times: false,
  });
  const [error, setError] = useState<string | null>(null); // <-- Add error state

  // --- NEW useEffect 1: Fetch all shops on component mount ---
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
  }, []); // Empty dependency array means this runs only once on mount

  // --- NEW useEffect 2: Fetch barbers when selectedShop changes ---
  useEffect(() => {
    if (selectedShop) {
      const fetchBarbers = async () => {
        setIsLoading((prev) => ({ ...prev, barbers: true }));
        setError(null);
        try {
          const fetchedBarbers = await getBarbersByShopId(selectedShop);
          setBarbers(fetchedBarbers);
          // Reset subsequent selections
          setSelectedBarber(null);
          setSelectedDate(null);
          setSelectedTime(null);
        } catch (err) {
          console.error(
            `Error fetching barbers for shop ${selectedShop}:`,
            err
          );
          setError(`Failed to load barbers for selected shop.`);
          setBarbers([]); // Clear barbers on error
        } finally {
          setIsLoading((prev) => ({ ...prev, barbers: false }));
        }
      };
      fetchBarbers();
    } else {
      setBarbers([]); // Clear barbers if no shop is selected
      setSelectedBarber(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedShop]); // Reruns whenever selectedShop changes

  // --- NEW useEffect 3: Fetch dates when selectedBarber changes ---
  useEffect(() => {
    if (selectedShop && selectedBarber) {
      const fetchDates = async () => {
        setIsLoading((prev) => ({ ...prev, dates: true }));
        setError(null);
        try {
          const fetchedDates = await getAvailableDates(
            selectedShop,
            selectedBarber
          );
          setDates(fetchedDates);
          // Reset subsequent selections
          setSelectedDate(null);
          setSelectedTime(null);
        } catch (err) {
          console.error(
            `Error fetching dates for barber ${selectedBarber}:`,
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
      setDates([]); // Clear dates if no barber is selected
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedShop, selectedBarber]); // Reruns when shop OR barber changes

  // --- NEW useEffect 4: Fetch time slots when selectedDate changes ---
  useEffect(() => {
    if (selectedShop && selectedBarber && selectedDate && totalDuration > 0) {
      const fetchTimes = async () => {
        setIsLoading((prev) => ({ ...prev, times: true }));
        setError(null);
        try {
          const fetchedTimes = await getAvailableSlots(
            selectedShop,
            selectedBarber,
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
      setTimes([]); // Clear times if dependencies are missing
      setSelectedTime(null);
    }
  }, [selectedShop, selectedBarber, selectedDate, totalDuration]); // Reruns if any of these change

  // --- Helper to format date string for display ---
  const formatDateForDisplay = (dateStr: string) => {
    return formatInTimeZone(dateStr, SHOP_TIMEZONE, "EEE, MMM d");
  };

  const handleNextClick = () => {
    if (selectedShop && selectedBarber && selectedDate && selectedTime) {
      setBookingSelections({
        shopId: selectedShop,
        barberId: selectedBarber,
        date: selectedDate,
        time: selectedTime,
      });
      router.push("/confirm");
    } else {
      // This is a safety check, should not happen if button is disabled correctly
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
          {/* ... your existing cart summary JSX ... */}
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
              onValueChange={(value) => setSelectedShop(value)}
              value={selectedShop ?? ""}
              disabled={isLoading.shops || shops.length === 0} // Disable if loading or no shops
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
      {selectedShop && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Choose a Barber</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading.barbers ? (
              <p>Loading barbers...</p>
            ) : (
              <Select
                onValueChange={(value) => setSelectedBarber(value)}
                value={selectedBarber ?? ""}
                disabled={isLoading.barbers || barbers.length === 0} // Disable if loading or no barbers
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
      {selectedBarber && (
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

      {/* Step 4: Choose a Time Slot (UPDATED) */}
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
