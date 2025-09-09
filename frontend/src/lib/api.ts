// src/lib/api.ts
import axios from "axios";
// Import all our types
import type {
  Service,
  Shop,
  Barber,
  RawServiceDocument, // <-- NEW
  RawShopDocument, // <-- NEW
  RawBarberDocument, // <-- NEW
  AppointmentPayload,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// API function to get all services
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const response = await api.get<RawServiceDocument[]>("/api/services"); // <-- Specify response type
    // The 'service' parameter is now strongly typed
    const services = response.data.map((service: RawServiceDocument) => ({
      id: service.$id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    }));
    return services;
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
};

// API function to get all shops
export const getAllShops = async (): Promise<Shop[]> => {
  try {
    const response = await api.get<RawShopDocument[]>("/api/shops");
    const shops = response.data.map((shop: RawShopDocument) => ({
      id: shop.$id,
      name: shop.name,
      address: shop.address,
      phone_number: shop.phone_number,
      tax_rate: shop.tax_rate, // <-- ADDED
    }));
    return shops;
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return [];
  }
};

// API function to get barbers by shop ID
export const getBarbersByShopId = async (shopId: string): Promise<Barber[]> => {
  try {
    const response = await api.get<RawBarberDocument[]>(
      `/api/shops/${shopId}/barbers`
    ); // <-- Specify response type
    // The 'barber' parameter is now strongly typed
    const barbers = response.data.map((barber: RawBarberDocument) => ({
      id: barber.$id,
      name: barber.name,
    }));
    return barbers;
  } catch (error) {
    console.error(`Failed to fetch barbers for shop ${shopId}:`, error);
    return [];
  }
};

// API function to get available dates (no mapping needed)
export const getAvailableDates = async (
  shopId: string,
  barberId: string
): Promise<string[]> => {
  try {
    const response = await api.get<string[]>("/api/availability/dates", {
      params: { shop_id: shopId, barber_id: barberId },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch available dates:", error);
    return [];
  }
};

// API function to get available time slots (no mapping needed)
export const getAvailableSlots = async (
  shopId: string,
  barberId: string,
  dateStr: string,
  totalDuration: number
): Promise<string[]> => {
  try {
    const response = await api.get<string[]>("/api/availability/slots", {
      params: {
        shop_id: shopId,
        barber_id: barberId,
        date_str: dateStr,
        total_duration: totalDuration,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    return [];
  }
};



export const createAppointment = async (payload: AppointmentPayload) => {
  // The old AppointmentPayload interface is now defined in types.ts
  const response = await api.post("/api/appointments", payload);
  return response.data;
};

export default api;
