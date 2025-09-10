// src/lib/types.ts

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  tax_rate: number;
}

export interface Barber {
  id: string;
  name: string;
  contact_info: string | null;
}

export interface Customer {
  name: string;
  phone_number: string;
  gender?: string | null;
}

interface AppwriteDocument {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

// Specific raw document types that extend the base AppwriteDocument
export interface RawServiceDocument extends AppwriteDocument {
  name: string;
  price: number;
  duration: number;
}

export interface RawShopDocument extends AppwriteDocument {
  name: string;
  address: string;
  phone_number: string;
  tax_rate: number;
}

export interface RawBarberDocument extends AppwriteDocument {
  name: string;
  contact_info?: string;
}

export interface ServiceSnapshot {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface AppointmentPayload {
  customer_name: string;
  customer_phone: string;
  customer_gender: string | null;
  shop_id: string;
  shop_name: string;
  barber_id: string;
  barber_name: string;
  start_time: string; // ISO 8601 format
  service_snapshots: ServiceSnapshot[];
  tax_rate: number;
  is_walk_in?: boolean; // Optional fields
  status?: "Booked" | "InProgress";
}

export interface ManagerAppointment {
  id: string;
  shop_id: string;
  shop_name: string;
  barber_id: string;
  barber_name: string;
  customer_name: string;
  customer_phone: string;
  customer_gender: string | null;
  start_time: string; // UTC ISO string, e.g., "2025-09-15T10:30:00+00:00"
  end_time: string; // UTC ISO string
  status: AppointmentStatus;
  total_amount: number;
  services_snapshot: ServiceSnapshot[]; // We will parse the JSON string into this
}

// Interface for the raw data from the API before we process it
export interface RawManagerAppointment {
  $id: string; // The ID from Appwrite
  shop_id: string;
  shop_name: string;
  barber_id: string;
  barber_name: string;
  customer_name: string;
  customer_phone: string;
  customer_gender: string | null;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  total_amount: number;
  services_snapshot: string; // This is still a JSON string
  // Add any other fields that might be in the raw response, like bill_amount etc.
  bill_amount: number;
  tax_rate_snapshot: number;
  payment_status: boolean;
  is_walk_in: boolean;
}

export type AppointmentStatus =
  | "Booked"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface ScheduleDay {
  day_of_week: string;
  start_time: string; // e.g., "09:30"
  end_time: string; // e.g., "18:30"
  is_day_off: boolean;
}

// Represents the full API response for a barber's schedule
export interface BarberScheduleResponse {
  schedules: ScheduleDay[];
}

export interface UpdateSchedulePayload {
  schedules: {
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_day_off: boolean;
  }[];
}
