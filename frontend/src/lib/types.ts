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
}

export interface RawBarberDocument extends AppwriteDocument {
  name: string;
}