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
    tax_rate: float 

# --- Barber Schemas ---
class Barber(AppwriteBaseModel):
    name: str
    contact_info: Optional[str] = None


class CustomerCreate(BaseModel):
    """Schema for customer data when creating or finding an appointment."""
    name: str
    phone_number: str
    gender: Optional[str] = None # Gender is optional


class ServiceSnapshot(BaseModel):
    id: str
    name: str
    duration: int
    price: float

class AppointmentCreate(BaseModel):
    """Schema for the new, denormalized appointment booking request body."""
    # Customer info is now flat
    customer_name: str
    customer_phone: str
    customer_gender: Optional[str] = None
    
    # Shop and Barber info
    shop_id: str
    shop_name: str
    barber_id: str
    barber_name: str
    
    # Time and services
    start_time: datetime
    service_snapshots: List[ServiceSnapshot] # Frontend sends a list of service objects
    tax_rate: float # Frontend sends the tax rate
    
    # Status flags
    is_walk_in: bool = False
    status: Optional[Literal["Booked", "InProgress"]] = "Booked"



class AppointmentDetails(AppwriteBaseModel):
    shop_id: str
    shop_name: str
    barber_id: str
    barber_name: str
    customer_name: str
    customer_phone: str
    customer_gender: Optional[str] = None
    
    start_time: datetime
    end_time: datetime
    status: str
    
    bill_amount: float
    total_amount: float
    tax_rate_snapshot: float
    payment_status: bool
    is_walk_in: bool
    
    services_snapshot: str # The response will contain the JSON string


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

class DailyScheduleResponse(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    is_day_off: bool

# Represents the full weekly schedule response
class WeeklyScheduleResponse(BaseModel):
    schedules: List[DailyScheduleResponse]

class ShopCreate(BaseModel):
    name: str
    address: str
    phone_number: str
    # Add validation to ensure tax_rate is a sensible percentage (e.g., between 0 and 1)
    tax_rate: float = Field(..., gt=0, lt=1)