# backend/routers/booking.py

import asyncio
import json
from fastapi import APIRouter, HTTPException
from typing import List
from appwrite.query import Query
from datetime import datetime, timedelta, timezone
from logic.availability import calculate_barber_availability
from logic.availability import is_barber_working_on_date, is_any_barber_working_on_date, get_weekly_available_dates_for_barber
from logic.any_barber import calculate_any_barber_availability
from datetime import timedelta
import uuid
# Import our new utils function
from utils import parse_iso_to_datetime
from utils import TARGET_TIMEZONE
# Import the new Pydantic model for the request body
import schemas

# Import our Pydantic models and Appwrite client details
import schemas
from appwrite_client import (
    databases, 
    APPWRITE_DATABASE_ID, 
    COLLECTION_SERVICES, 
    COLLECTION_SHOPS,
    COLLECTION_BARBERS,
    COLLECTION_APPOINTMENTS,
    COLLECTION_CUSTOMERS,
    COLLECTION_APPOINTMENT_SERVICES 

)

# Create a new router object
router = APIRouter(
    prefix="/api", # All routes in this file will be prefixed with /api
    tags=["Website Booking"] # Group these endpoints in the Swagger UI
)

@router.get("/services", response_model=List[schemas.Service])
async def get_all_services():
    """Fetches a list of all available services from the database."""
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SERVICES
        )
        return response['documents']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shops", response_model=List[schemas.Shop])
async def get_all_shops():
    """Fetches a list of all shop locations from the database."""
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOPS
        )
        return response['documents']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shops/{shopId}/barbers", response_model=List[schemas.Barber])
async def get_barbers_for_shop(shopId: str):
    """Fetches a list of barbers for a specific shop ID."""
    try:
        queries = [Query.equal("shop_id", [shopId])]
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_BARBERS,
            queries=queries
        )
        return response['documents']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/availability/dates", response_model=List[str])
async def get_available_dates(shop_id: str, barber_id: str):
    """
    Calculates the available DATES for the next 7 days by checking
    if the shop is open and the barber is scheduled to work.
    """
    # 1. Generate the list of dates to check (no change here)
    now_utc = datetime.now(timezone.utc)
    now_local_to_shop = now_utc.astimezone(TARGET_TIMEZONE)
    today_local_to_shop = now_local_to_shop.date()
    date_strs_to_check = [(today_local_to_shop + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    
    # 2. Decide which logic path to take
    if barber_id.lower() == "any":
        # --- ANY BARBER LOGIC (Still uses the old, slower method for now) ---
        tasks = []
        for date_str in date_strs_to_check:
            tasks.append(is_any_barber_working_on_date(shop_id=shop_id, date_str=date_str))
        results = await asyncio.gather(*tasks)
        available_dates = [date_str for date_str, is_available in zip(date_strs_to_check, results) if is_available]
        return available_dates
    else:
        # --- SPECIFIC BARBER LOGIC (Uses the new, fast method) ---
        # Make one single call to our new efficient function
        return await get_weekly_available_dates_for_barber(
            barber_id=barber_id,
            shop_id=shop_id,
            date_strs_to_check=date_strs_to_check
        )


@router.get("/availability/slots", response_model=List[str])
async def get_available_slots(shop_id: str, barber_id: str, date_str: str, total_duration: int):
    """
    Calculates the available TIME SLOTS for a specific date based on the 
    selected shop, barber ("any" or a specific ID), and total service duration.
    """
    # The endpoint logic is a simple conditional dispatcher
    if barber_id.lower() == "any":
        # Use the "any barber" logic to calculate and return the unified slots
        return await calculate_any_barber_availability(
            shop_id=shop_id,
            date_str=date_str,
            total_duration=total_duration
        )
    else:
        # Use the single barber logic to calculate and return their specific slots
        return await calculate_barber_availability(
            barber_id=barber_id,
            shop_id=shop_id,
            date_str=date_str,
            total_duration=total_duration
        )
    

@router.post("/appointments", response_model=schemas.AppointmentDetails, status_code=201)
async def create_appointment(appointment_data: schemas.AppointmentCreate):
    """
    Creates a new, denormalized appointment record in a single database call
    after performing a final double-booking check.
    """
    # --- Part 1: Calculate Totals from Incoming Data ---
    # No database calls needed here anymore!
    total_duration = sum(service.duration for service in appointment_data.service_snapshots)
    bill_amount = sum(service.price for service in appointment_data.service_snapshots)
    total_amount = bill_amount * (1 + appointment_data.tax_rate)
    
    appointment_end_time = appointment_data.start_time + timedelta(minutes=total_duration)

    try:
        # --- Part 2: Final Double-Booking Check (No change in logic) ---
        local_start_check = appointment_data.start_time.replace(tzinfo=TARGET_TIMEZONE)
        local_end_check = appointment_end_time.replace(tzinfo=TARGET_TIMEZONE)
        utc_start_check = local_start_check.astimezone(timezone.utc)
        utc_end_check = local_end_check.astimezone(timezone.utc)
        
        overlapping_appointments_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            queries=[
                Query.equal("barber_id", [appointment_data.barber_id]),
                Query.not_equal("status", "Cancelled"),
                Query.less_than("start_time", utc_end_check.isoformat()),
                Query.greater_than("end_time", utc_start_check.isoformat())
            ]
        )

        if overlapping_appointments_response['documents']:
            raise HTTPException(status_code=409, detail="This time slot has just been booked. Please select another slot.")
        
        # --- Part 3: Create the Single, Denormalized Appointment Document ---
        
        # Convert the list of service snapshots to a JSON string for storage
        services_json_string = json.dumps([s.dict() for s in appointment_data.service_snapshots])
        
        new_appointment_data = {
            "shop_id": appointment_data.shop_id,
            "shop_name": appointment_data.shop_name,
            "barber_id": appointment_data.barber_id,
            "barber_name": appointment_data.barber_name,
            "customer_name": appointment_data.customer_name,
            "customer_phone": appointment_data.customer_phone,
            "customer_gender": appointment_data.customer_gender,
            "start_time": utc_start_check.isoformat(),
            "end_time": utc_end_check.isoformat(),
            "status": appointment_data.status,
            "is_walk_in": appointment_data.is_walk_in,
            "payment_status": False,
            "bill_amount": bill_amount,
            "total_amount": round(total_amount, 2),
            "tax_rate_snapshot": appointment_data.tax_rate,
            "services_snapshot": services_json_string
        }

        created_document = databases.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            document_id='unique()',
            data=new_appointment_data
        )

        print(f"Successfully created denormalized appointment with ID: {created_document['$id']}")
        
        return created_document # FastAPI will validate this against AppointmentDetails

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"An error occurred during booking: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")