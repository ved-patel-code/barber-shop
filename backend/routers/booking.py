# backend/routers/booking.py

import asyncio
from fastapi import APIRouter, HTTPException
from typing import List
from appwrite.query import Query
from datetime import datetime, timedelta
from logic.availability import calculate_barber_availability
from logic.availability import is_barber_working_on_date, is_any_barber_working_on_date
from logic.any_barber import calculate_any_barber_availability


# Import our Pydantic models and Appwrite client details
import schemas
from appwrite_client import (
    databases, 
    APPWRITE_DATABASE_ID, 
    COLLECTION_SERVICES, 
    COLLECTION_SHOPS,
    COLLECTION_BARBERS

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
    today = datetime.now().date()
    
    # Create a list of all 7 date strings we need to check
    date_strs_to_check = [(today + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    
    tasks = []
    # Decide which lightweight function to use
    if barber_id.lower() == "any":
        for date_str in date_strs_to_check:
            tasks.append(is_any_barber_working_on_date(shop_id=shop_id, date_str=date_str))
    else:
        for date_str in date_strs_to_check:
            tasks.append(is_barber_working_on_date(barber_id=barber_id, shop_id=shop_id, date_str=date_str))
    
    # Run all 7 checks concurrently for maximum speed
    results = await asyncio.gather(*tasks)
    
    # Build the final list of dates that returned True
    available_dates = [date_str for date_str, is_available in zip(date_strs_to_check, results) if is_available]
    
    return available_dates


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