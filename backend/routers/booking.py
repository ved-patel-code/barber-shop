# backend/routers/booking.py

import asyncio
from fastapi import APIRouter, HTTPException
from typing import List
from appwrite.query import Query
from datetime import datetime, timedelta, timezone
from logic.availability import calculate_barber_availability
from logic.availability import is_barber_working_on_date, is_any_barber_working_on_date
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
     # --- CHANGE HERE: Calculate 'today' based on TARGET_TIMEZONE ---
    # 1. Get current UTC time
    now_utc = datetime.now(timezone.utc)
    # 2. Convert to target timezone
    now_local_to_shop = now_utc.astimezone(TARGET_TIMEZONE)
    # 3. Extract the date
    today_local_to_shop = now_local_to_shop.date()
    # --- END CHANGE ---
    
    # Create a list of all 7 date strings we need to check
    # We now use today_local_to_shop instead of the server's naive today
    date_strs_to_check = [(today_local_to_shop + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    
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
    

@router.post("/appointments", status_code=201)
async def create_appointment(appointment_data: schemas.AppointmentCreate):
    """
    Creates a new appointment after performing a final double-booking check.
    """
    
    # --- Part 1: Calculate Total Duration (Replaces the placeholder) ---
    total_duration = 0
    bill_amount = 0.0
    services_documents = []
    try:
        # Fetch all selected services to calculate total duration and price
        for service_id in appointment_data.service_ids:
            service = databases.get_document(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=COLLECTION_SERVICES,
                document_id=service_id
            )
            services_documents.append(service)
            total_duration += service['duration']
            bill_amount += service['price']
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"One or more services not found: {e}")

    appointment_end_time = appointment_data.start_time + timedelta(minutes=total_duration)



    try:
# --- CHANGE 1: CONVERT TIMES TO UTC FOR DOUBLE-BOOKING CHECK ---
        # Treat the incoming naive times as being in our target timezone, then convert to UTC for the query
        local_start_check = appointment_data.start_time.replace(tzinfo=TARGET_TIMEZONE)
        local_end_check = appointment_end_time.replace(tzinfo=TARGET_TIMEZONE)
        utc_start_check = local_start_check.astimezone(timezone.utc)
        utc_end_check = local_end_check.astimezone(timezone.utc)
        # We need to check for any appointments that *overlap* with the requested slot.
        # An overlap occurs if an existing appointment:
        # 1. Starts during our requested slot.
        # 2. Ends during our requested slot.
        # 3. Starts before and ends after our requested slot (envelops it).
        
        # A simpler way to query this is to find any appointment for the barber where:
        # (Existing Start < Our End) AND (Existing End > Our Start)
        
        overlapping_appointments_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            queries=[
                Query.equal("barber_id", [appointment_data.barber_id]),
                Query.not_equal("status", ["Cancelled"]),
                Query.less_than("start_time", utc_end_check.isoformat()),
                Query.greater_than("end_time", utc_start_check.isoformat())
            ]
        )

        if overlapping_appointments_response['documents']:
            # If the list is NOT empty, we found a conflict.
            raise HTTPException(
                status_code=409, # 409 Conflict is the standard response for this
                detail="This time slot has just been booked. Please select another slot."
            )
        
         # --- Part 3: Create the Customer Record (NEW LOGIC) ---
        
        # As per the requirement, we will always create a new customer for each booking.
        # 'unique()' is Appwrite's keyword to generate a unique ID.
        new_customer_id = 'unique()'
        
        customer_document = databases.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_CUSTOMERS,
            document_id=new_customer_id,
            data={
                "name": appointment_data.customer.name,
                "phone_number": appointment_data.customer.phone_number,
                "gender": appointment_data.customer.gender
            }
        )
        
        created_customer_id = customer_document['$id']
        print(f"Successfully created new customer with ID: {created_customer_id}")
        
    
    # --- Part 4: Calculate Final Price & Create Appointment (NEW LOGIC) ---
        
    # Fetch the shop to get its tax rate
        shop_document = databases.get_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOPS,
            document_id=appointment_data.shop_id
        )
        tax_rate = shop_document['tax_rate']
        total_amount = bill_amount * (1 + tax_rate)

        # Create the appointment document
        new_appointment_id = 'unique()'
        appointment_document = databases.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            document_id=new_appointment_id,
            data={
                "customer_id": created_customer_id,
                "barber_id": appointment_data.barber_id,
                "shop_id": appointment_data.shop_id,
                "start_time": utc_start_check.isoformat(), # Use UTC time
                "end_time": utc_end_check.isoformat(),     # Use UTC time
                "status": "Booked",
                "is_walk_in": appointment_data.is_walk_in,
                "payment_status": False,
                "bill_amount": bill_amount,
                "total_amount": round(total_amount, 2)
            }
        )
        created_appointment_id = appointment_document['$id']
        print(f"Successfully created new appointment with ID: {created_appointment_id}")

        # --- Part 5: Create Appointment_Services "Snapshot" Records (NEW LOGIC) ---
        
        # Now, loop through the service documents we fetched at the beginning
        for service in services_documents:
            # For each service, create a linking document in the junction collection
            databases.create_document(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=COLLECTION_APPOINTMENT_SERVICES,
                document_id='unique()',
                data={
                    "appointment_id": created_appointment_id,
                    "service_id": service['$id'],
                    "price_at_booking": service['price'], # Snapshot the price
                    "duration_at_booking": service['duration'] # Snapshot the duration
                }
            )
        
        print(f"Successfully created {len(services_documents)} service snapshots for appointment {created_appointment_id}")

        # Final successful response
        return {
            "status": "success", 
            "message": "Appointment successfully booked.",
            "appointment_id": created_appointment_id,
            "customer_id": created_customer_id
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"An error occurred during booking: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")