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