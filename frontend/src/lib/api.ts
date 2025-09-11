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
  ManagerAppointment,
  RawManagerAppointment,
  AppointmentStatus,
  ScheduleDay,
  BarberScheduleResponse,
  UpdateSchedulePayload,
  FinancialsReport,
  OwnerStaffMember,
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
      contact_info: barber.contact_info || null,
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


export const getManagerAppointments = async (
  shopId: string,
  date: string // Date must be in "YYYY-MM-DD" format
): Promise<ManagerAppointment[]> => {
  try {
    // Tell axios to expect an array of our NEW RawManagerAppointment type
    const response = await api.get<RawManagerAppointment[]>("/api/manager/appointments", {
      params: {
        shop_id: shopId,
        date: date,
      },
    });

    // Process the raw data to create clean, usable objects
    const appointments: ManagerAppointment[] = response.data.map((rawAppointment) => {
      // The 'rawAppointment' object now correctly has a '$id' property
      return {
        // Explicitly map the fields from raw to clean
        id: rawAppointment.$id, // <-- THE CRITICAL FIX
        shop_id: rawAppointment.shop_id,
        shop_name: rawAppointment.shop_name,
        barber_id: rawAppointment.barber_id,
        barber_name: rawAppointment.barber_name,
        customer_name: rawAppointment.customer_name,
        customer_phone: rawAppointment.customer_phone,
        customer_gender: rawAppointment.customer_gender,
        start_time: rawAppointment.start_time,
        end_time: rawAppointment.end_time,
        status: rawAppointment.status,
        total_amount: rawAppointment.total_amount,
        // IMPORTANT: Parse the JSON string into a usable array of objects
        services_snapshot: JSON.parse(rawAppointment.services_snapshot || '[]'),
      };
    });

    return appointments;
  } catch (error) {
    console.error("Failed to fetch manager appointments:", error);
    return [];
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus
): Promise<ManagerAppointment> => {
  // We wrap this in a try...catch block to handle potential network errors
  try {
    const response = await api.patch<ManagerAppointment>(
      `/api/manager/appointments/${appointmentId}/status`,
      { status } // The request body as per the API docs
    );
    // The backend returns the full, updated appointment object, which we return
    return response.data;
  } catch (error) {
    console.error(`Failed to update status for appointment ${appointmentId}:`, error);
    // Re-throw the error to be caught by the component's logic
    throw error;
  }
};

export const getAvailableBarbers = async (
  shopId: string,
  duration: number
): Promise<Barber[]> => {
  // Don't make an API call if duration is zero or less
  if (duration <= 0) {
    return [];
  }
  try {
    // The backend expects `RawBarberDocument` which has `$id`
    const response = await api.get<RawBarberDocument[]>(
      "/api/manager/available-barbers",
      {
        params: {
          shop_id: shopId,
          duration: duration,
        },
      }
    );
    // Map the raw response to our clean `Barber` type
    const barbers = response.data.map((barber) => ({
      id: barber.$id,
      name: barber.name,
      contact_info: null,
    }));
    return barbers;
  } catch (error) {
    console.error("Failed to fetch available barbers:", error);
    return [];
  }
};

export const getShopById = async (shopId: string): Promise<Shop | null> => {
  try {
    // We don't have a direct /api/shops/{id} endpoint, so we fetch all
    // and find the one we need. This is acceptable since there are only 2 shops.
    // If there were many shops, a dedicated backend endpoint would be better.
    const allShops = await getAllShops();
    const shop = allShops.find((s) => s.id === shopId);
    return shop || null;
  } catch (error) {
    console.error(`Failed to fetch details for shop ${shopId}:`, error);
    return null;
  }
};

export const addStaff = async (
  shopId: string,
  payload: { name: string; contact_info: string }
): Promise<Barber> => {
  try {
    const response = await api.post<RawBarberDocument>(
      "/api/manager/staff",
      payload,
      {
        params: { shop_id: shopId },
      }
    );
    // Map the raw response to our clean Barber type
    return {
      id: response.data.$id,
      name: response.data.name,
      contact_info: response.data.contact_info || null,
    };
  } catch (error) {
    console.error("Failed to add staff:", error);
    throw error; // Re-throw to be handled by the component
  }
};

export const getBarberSchedule = async (
  barberId: string
): Promise<ScheduleDay[]> => {
  try {
    const response = await api.get<BarberScheduleResponse>(
      `/api/manager/staff/${barberId}/schedule`
    );
    // The API response nests the array inside a "schedules" key
    return response.data.schedules;
  } catch (error) {
    console.error(`Failed to fetch schedule for barber ${barberId}:`, error);
    // Return an empty array on error so the UI doesn't crash
    return [];
  }
};

export const updateBarberSchedule = async (
  barberId: string,
  shopId: string,
  payload: UpdateSchedulePayload
): Promise<any> => {
  try {
    const response = await api.post(
      `/api/manager/staff/${barberId}/schedule`,
      payload,
      {
        params: { shop_id: shopId }, // <-- ADD shop_id as a query parameter
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update schedule for barber ${barberId}:`, error);
    throw error; // Re-throw to be handled by the component
  }
};

export const getFinancials = async (
  shopId: string,
  // Use an object for filters to make it clean
  filters: { date?: string; month?: string } // date: "YYYY-MM-DD", month: "YYYY-MM"
): Promise<FinancialsReport | null> => {
  try {
    const response = await api.get<FinancialsReport>(
      "/api/manager/financials",
      {
        params: {
          shop_id: shopId,
          ...filters, // Spread the date or month filter into the params
        },
      }
    );
    return response.data;
  } catch (error) {
    // Check if the error is an Axios error to inspect the response
    if (axios.isAxiosError(error) && error.response) {
      console.error("Failed to fetch financials:", error.response.data);
    } else {
      console.error("Failed to fetch financials:", error);
    }
    // Return null on failure so the UI can handle it gracefully
    return null;
  }
};

export const getOwnerShops = async (): Promise<Shop[]> => {
  try {
    const response = await api.get<RawShopDocument[]>("/api/owner/shops");
    const shops = response.data.map((shop: RawShopDocument) => ({
      id: shop.$id, // map $id → id
      name: shop.name,
      address: shop.address,
      phone_number: shop.phone_number,
      tax_rate: shop.tax_rate,
    }));
    return shops;
  } catch (error) {
    console.error("Failed to fetch owner shops:", error);
    return [];
  }
};

export const getOwnerStaff = async (
  shopId?: string
): Promise<OwnerStaffMember[]> => {
  try {
    const response = await api.get<OwnerStaffMember[]>("/api/owner/staff", {
      // Axios will automatically omit the 'shop_id' param if `shopId` is undefined
      params: { shop_id: shopId },
    });
    // The API response matches our type, so no mapping is needed.
    return response.data;
  } catch (error) {
    console.error("Failed to fetch owner staff list:", error);
    // Return an empty array on failure so the UI doesn't crash
    return [];
  }
};

export const getOwnerFinancials = async (
  filters: { shop_id?: string; date?: string; month?: string } // date: "YYYY-MM-DD", month: "YYYY-MM"
): Promise<FinancialsReport | null> => {
  try {
    const response = await api.get<FinancialsReport>(
      "/api/owner/financials", // Owner specific endpoint
      {
        params: {
          ...filters, // Spread the shop_id, date or month filter into the params
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Failed to fetch owner financials:", error.response.data);
      // Re-throw specific error for bad requests if needed for UI messaging
      if (error.response.status === 400) {
        throw new Error(
          error.response.data.detail || "Invalid filter combination."
        );
      }
    } else {
      console.error("Failed to fetch owner financials:", error);
    }
    return null; // Return null on failure so the UI can handle it gracefully
  }
};

export default api;
