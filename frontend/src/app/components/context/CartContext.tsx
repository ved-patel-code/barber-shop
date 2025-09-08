"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Service } from "@/lib/types";

// -------------------------------
// Define the CartContext shape
// -------------------------------
interface CartContextType {
  selectedServices: Service[];
  totalPrice: number;
  totalDuration: number;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  clearCart: () => void;
  bookingSelections: BookingSelections;
  setBookingSelections: (selections: Partial<BookingSelections>) => void;
}

export interface BookingSelections {
  shopId: string | null;
  barberId: string | null;
  date: string | null;
  time: string | null;
}

// -------------------------------
// Create Context
// -------------------------------
const CartContext = createContext<CartContextType | undefined>(undefined);

// -------------------------------
// Provider Component
// -------------------------------
export function CartProvider({ children }: { children: ReactNode }) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [bookingSelections, setSelections] = useState<BookingSelections>({
     shopId: null,
     barberId: null,
     date: null,
     time: null,
   });
   const setBookingSelections = (selections: Partial<BookingSelections>) => {
      setSelections((prev) => ({ ...prev, ...selections }));
    };

  const addService = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        // If already in cart, remove it (toggle behavior)
        return prev.filter((s) => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const removeService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const clearCart = () => {
    setSelectedServices([]);
  };

  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  const totalDuration = selectedServices.reduce(
    (sum, service) => sum + service.duration,
    0
  );

  return (
    <CartContext.Provider
      value={{
        selectedServices,
        totalPrice,
        totalDuration,
        addService,
        removeService,
        clearCart,
        bookingSelections,
        setBookingSelections,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// -------------------------------
// Hook for consuming the Cart
// -------------------------------
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
