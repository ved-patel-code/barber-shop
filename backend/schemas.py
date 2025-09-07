# backend/schemas.py

from pydantic import BaseModel, Field, EmailStr # <-- Added EmailStr for future-proofing, if you add email
from typing import List, Optional
from datetime import datetime

# --- Base Schema for Appwrite Documents ---
# Appwrite uses '$id' for its document ID. Pydantic can map this
# to a more standard 'id' field in our API.
class AppwriteBaseModel(BaseModel):
    id: str = Field(..., alias='$id')

# --- Service Schemas ---
class Service(AppwriteBaseModel):
    name: str
    duration: int
    price: float

# --- Shop Schemas ---
class Shop(AppwriteBaseModel):
    name: str
    address: str
    phone_number: str

# --- Barber Schemas ---
class Barber(AppwriteBaseModel):
    name: str


class CustomerCreate(BaseModel):
    """Schema for customer data when creating or finding an appointment."""
    name: str
    phone_number: str
    gender: Optional[str] = None # Gender is optional

class AppointmentCreate(BaseModel):
    """Schema for the full appointment booking request body."""
    customer: CustomerCreate # Nested Pydantic model for customer info
    shop_id: str
    barber_id: Optional[str] = None # Will be null if "Any Barber" was chosen by user
    start_time: datetime # Full datetime object expected
    service_ids: List[str] # List of Appwrite Document IDs for selected services
    is_walk_in: bool = False # Default to false for online bookings