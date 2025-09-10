// src/app/components/context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { Service, Shop, Barber } from "@/lib/types";

export interface BookingSelections {
  shop: Shop | null;
  barber: Barber | null;
  date: string | null;
  time: string | null;
}

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

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "barberShopCart";

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state from a function to read from localStorage ONLY ONCE on mount.
  const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
    // This check is for Next.js Server-Side Rendering (SSR), where localStorage is not available.
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored).services || [] : [];
    } catch (error) {
      console.error("Failed to load services from localStorage", error);
      return [];
    }
  });

  const [bookingSelections, setSelections] = useState<BookingSelections>(() => {
    if (typeof window === "undefined") {
      return { shop: null, barber: null, date: null, time: null };
    }
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const initialSelections = {
        shop: null,
        barber: null,
        date: null,
        time: null,
      };
      return stored
        ? JSON.parse(stored).selections || initialSelections
        : initialSelections;
    } catch (error) {
      console.error("Failed to load selections from localStorage", error);
      return { shop: null, barber: null, date: null, time: null };
    }
  });

  // This single useEffect is ONLY for saving the state to localStorage whenever it changes.
  useEffect(() => {
    // This check prevents running on the server.
    if (typeof window !== "undefined") {
      try {
        const stateToStore = {
          services: selectedServices,
          selections: bookingSelections,
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error("Failed to save cart to localStorage", error);
      }
    }
  }, [selectedServices, bookingSelections]);

  const addService = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        // If the service is already in the cart, remove it (toggle behavior).
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
    setSelections({ shop: null, barber: null, date: null, time: null });
    // This function will trigger the save useEffect, which will overwrite localStorage with the empty state.
  };

  const setBookingSelections = (selections: Partial<BookingSelections>) => {
    setSelections((prev) => ({ ...prev, ...selections }));
  };

  // Derived state is calculated on every render.
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

// Custom hook for consuming the CartContext.
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
