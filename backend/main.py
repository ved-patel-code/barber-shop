# backend/main.py

from fastapi import FastAPI, HTTPException
from typing import List
from appwrite.query import Query
# Import schemas and appwrite_client as before
import schemas
from routers import booking, manager, owner 
from appwrite_client import (
    databases, 
    APPWRITE_DATABASE_ID, 
    COLLECTION_SERVICES, 
    COLLECTION_SHOPS,
    COLLECTION_BARBERS
)

# --- NEW: Import our availability logic function ---
from logic.availability import calculate_barber_availability


app = FastAPI(
    title="Barber Shop API",
    description="Backend API for the Barber Shop Appointment System",
    version="0.1.0",
)

# --- Include API Routers ---
# Tell the main app to use the routes defined in the booking router
app.include_router(booking.router)
app.include_router(manager.router)
app.include_router(owner.router)

# --- API Endpoints ---
@app.get("/")
async def read_root():
    return {"message": "Barber Shop Backend is Running!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}
