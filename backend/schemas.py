# backend/schemas.py

from pydantic import BaseModel, Field, EmailStr # <-- Added EmailStr for future-proofing, if you add email
from typing import List, Optional , Literal 
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
    customer: CustomerCreate
    shop_id: str
    barber_id: str # No longer optional, must be a specific ID
    start_time: datetime
    service_ids: List[str]
    is_walk_in: bool = False
    # --- NEW: Add an optional status field ---
    status: Optional[Literal["Booked", "InProgress"]] = "Booked" # Default to "Booked"


class AppointmentDetails(AppwriteBaseModel):
    customer_id: str
    barber_id: str
    shop_id: str
    start_time: datetime # Pydantic will parse the ISO string from Appwrite
    end_time: datetime
    status: str
    bill_amount: float
    total_amount: float
    payment_status: bool
    is_walk_in: bool


class AppointmentStatusUpdate(BaseModel):
    status: Literal["InProgress", "Completed", "Cancelled", "Booked"]

class BarberCreate(BaseModel):
    name: str
    contact_info: Optional[str] = None

# For the OUTGOING response after creating a new barber
class BarberDetails(AppwriteBaseModel):
    name: str
    contact_info: Optional[str] = None
    shop_id: str


class DailySchedule(BaseModel):
    day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    start_time: str # e.g., "09:00"
    end_time: str   # e.g., "17:00"
    is_day_off: bool

# Represents the full weekly schedule payload for a barber
class WeeklyScheduleUpdate(BaseModel):
    schedules: List[DailySchedule]

class FinancialsReport(BaseModel):
    total_revenue_before_tax: float
    total_tax_collected: float
    total_revenue_after_tax: float
    total_appointments: int
    filter_period: str