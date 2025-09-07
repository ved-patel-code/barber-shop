# backend/schemas.py

from pydantic import BaseModel, Field

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