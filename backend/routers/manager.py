# backend/routers/manager.py

import asyncio
from fastapi import APIRouter, HTTPException, Query as FastQuery
from typing import List, Optional
from appwrite.query import Query
from datetime import datetime, timedelta, timezone
from logic.manager_logic import find_available_barbers_for_walk_in
import calendar

# Import Pydantic schemas and Appwrite client details
import schemas
from appwrite_client import COLLECTION_BARBERS, COLLECTION_SCHEDULES, databases, APPWRITE_DATABASE_ID, COLLECTION_APPOINTMENTS
from utils import TARGET_TIMEZONE # For handling dates correctly

# Create a new router object for the manager dashboard
router = APIRouter(
    prefix="/api/manager",
    tags=["Manager Dashboard"]
)

# --- Pydantic Schema for Response ---
# We need a more detailed Appointment schema for the dashboard
# Add this to backend/schemas.py
# class AppointmentDetails(AppwriteBaseModel):
#     customer_id: str
#     barber_id: str
#     shop_id: str
#     start_time: datetime
#     end_time: datetime
#     status: str

@router.get("/appointments", response_model=List[schemas.AppointmentDetails])
async def get_manager_appointments(
    shop_id: str, 
    date: Optional[str] = FastQuery(None, description="Date in YYYY-MM-DD format. Defaults to today.")
):
    """
    Fetches the list of appointments for a specific shop on a given date.
    If no date is provided, it defaults to the current day in the shop's timezone.
    """
    try:
        # Determine the target date
        if date:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        else:
            # If no date is provided, use "today" based on our configured timezone
            now_utc = datetime.now(timezone.utc)
            target_date = now_utc.astimezone(TARGET_TIMEZONE).date()

        # Define the 24-hour window for the selected date in UTC for querying
        day_start = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=TARGET_TIMEZONE)
        day_end = day_start + timedelta(days=1)
        
        day_start_utc = day_start.astimezone(timezone.utc)
        day_end_utc = day_end.astimezone(timezone.utc)

        # Build the queries to fetch appointments
        appointment_queries = [
            Query.equal("shop_id", [shop_id]),
            Query.greater_than_equal("start_time", day_start_utc.isoformat()),
            Query.less_than("start_time", day_end_utc.isoformat()),
            Query.order_asc("start_time")
        ]
        
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            queries=appointment_queries
        )
        
        return response['documents']

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Please use YYYY-MM-DD.")
    except Exception as e:
        print(f"An error occurred fetching manager appointments: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")
    

@router.patch("/appointments/{appointmentId}/status", response_model=schemas.AppointmentDetails)
async def update_appointment_status(appointmentId: str, status_update: schemas.AppointmentStatusUpdate):
    """
    Updates the status of a specific appointment.
    Example Statuses: "InProgress", "Completed", "Cancelled"
    """
    try:
        # The data to update. We only want to change the 'status' field.
        update_data = {
            "status": status_update.status
        }

        # Call the Appwrite SDK to update the document
        updated_document = databases.update_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            document_id=appointmentId,
            data=update_data
        )

        # Return the entire updated document, which will be validated by the response_model
        return updated_document

    except Exception as e:
        # The Appwrite SDK will raise an exception if the document is not found (404)
        # or if there's a server error.
        # A more advanced implementation could check the error type.
        print(f"An error occurred updating appointment status: {e}")
        raise HTTPException(status_code=404, detail=f"Appointment with ID {appointmentId} not found or update failed.")
    
@router.post("/staff", response_model=schemas.BarberDetails, status_code=201)
async def add_new_staff(shop_id: str, barber_data: schemas.BarberCreate):
    """
    Adds a new barber (staff) to a specific shop.
    """
    try:
        # Prepare the data for the new document in the Barbers collection
        new_barber_data = {
            "name": barber_data.name,
            "contact_info": barber_data.contact_info,
            "shop_id": shop_id  # Associate the new barber with the manager's shop
        }

        # Call the Appwrite SDK to create the new document
        created_document = databases.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_BARBERS,
            document_id='unique()', # Let Appwrite generate a unique ID
            data=new_barber_data
        )

        # Return the full document of the newly created barber
        return created_document

    except Exception as e:
        print(f"An error occurred while adding new staff: {e}")
        raise HTTPException(status_code=500, detail="Failed to create new staff member.")
    
@router.get("/available-barbers", response_model=List[schemas.Barber])
async def get_available_barbers_for_walk_in(shop_id: str, duration: int):
    """
    Finds and returns a list of barbers who are available to start a 
    walk-in appointment of a given duration immediately.
    """
    if duration <= 0:
        raise HTTPException(status_code=400, detail="Duration must be a positive number.")
        
    available_barbers = await find_available_barbers_for_walk_in(
        shop_id=shop_id,
        duration=duration
    )
    
    return available_barbers

@router.post("/staff/{barberId}/schedule", status_code=200)
async def update_barber_schedule(
    barberId: str, 
    shop_id: str,
    schedule_data: schemas.WeeklyScheduleUpdate
):
    """
    Efficiently updates or creates the weekly schedule for a specific barber.
    Fetches the existing week's schedule in one call and performs all updates/creates concurrently.
    """
    try:
        # --- PART 1: Fetch Existing Data (1 DB Call) ---
        existing_schedule_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[Query.equal("barber_id", [barberId])]
        )

        # --- PART 2: Create a Lookup Map ---
        existing_schedule_map = {
            item['day_of_week']: item for item in existing_schedule_response['documents']
        }

        # --- PART 3 & 4: Prepare Write Tasks in a Loop ---
        tasks = []
        for day_schedule in schedule_data.schedules:
            day = day_schedule.day_of_week
            
            schedule_update_data = {
                "start_time": day_schedule.start_time,
                "end_time": day_schedule.end_time,
                "is_day_off": day_schedule.is_day_off,
                "barber_id": barberId,
                "shop_id": shop_id,
                "day_of_week": day
            }
            
            # --- PART 5: Decide and Prepare Task ---
            if day in existing_schedule_map:
                # If the day exists in our map, we UPDATE
                document_id_to_update = existing_schedule_map[day]['$id']
                
                # Appwrite SDK calls are synchronous, so we need to wrap them to run concurrently
                task = asyncio.to_thread(
                    databases.update_document,
                    database_id=APPWRITE_DATABASE_ID,
                    collection_id=COLLECTION_SCHEDULES,
                    document_id=document_id_to_update,
                    data=schedule_update_data
                )
                tasks.append(task)
            else:
                # If the day does not exist, we CREATE
                task = asyncio.to_thread(
                    databases.create_document,
                    database_id=APPWRITE_DATABASE_ID,
                    collection_id=COLLECTION_SCHEDULES,
                    document_id='unique()',
                    data=schedule_update_data
                )
                tasks.append(task)
        
        # --- PART 6: Execute All Writes Concurrently ---
        if tasks:
            await asyncio.gather(*tasks)
        
        return {"status": "success", "message": f"Schedule for barber {barberId} has been successfully updated."}

    except Exception as e:
        print(f"An error occurred while updating schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to update barber's schedule.")
    

@router.get("/financials", response_model=schemas.FinancialsReport)
async def get_manager_financials(
    shop_id: str,
    date: Optional[str] = FastQuery(None, description="A specific date in YYYY-MM-DD format."),
    month: Optional[str] = FastQuery(None, description="A specific month in YYYY-MM format.")
):
    """
    Calculates financial totals for a given shop for a specific day or month.
    If no date or month is provided, it defaults to the current day.
    """
    if date and month:
        raise HTTPException(status_code=400, detail="Please provide either a 'date' or a 'month', not both.")

    now_local = datetime.now(TARGET_TIMEZONE)
    filter_period_str = ""

    # --- Determine the time range for the query ---
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            filter_period_str = f"for date {date}"
            day_start_local = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=TARGET_TIMEZONE)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Please use YYYY-MM-DD.")
    elif month:
        try:
            year, month_num = map(int, month.split('-'))
            filter_period_str = f"for month {month}"
            # Get the first day of the month
            day_start_local = datetime(year, month_num, 1, tzinfo=TARGET_TIMEZONE)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid month format. Please use YYYY-MM.")
    else:
        # Default to the current day
        target_date = now_local.date()
        filter_period_str = f"for today, {target_date.strftime('%Y-%m-%d')}"
        day_start_local = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=TARGET_TIMEZONE)
    
    # Calculate the end of the period
    if month:
        _, last_day = calendar.monthrange(day_start_local.year, day_start_local.month)
        day_end_local = day_start_local.replace(day=last_day, hour=23, minute=59, second=59)
    else: # Daily
        day_end_local = day_start_local + timedelta(days=1)

    # Convert local time range to UTC for Appwrite query
    day_start_utc = day_start_local.astimezone(timezone.utc)
    day_end_utc = day_end_local.astimezone(timezone.utc)

    try:
        # --- Query and Aggregate Data ---
        # Appwrite does not support server-side aggregation (SUM), so we must fetch all documents and sum them in our code.
        # We'll use pagination to handle potentially large numbers of appointments.
        
        all_completed_appointments = []
        offset = 0
        limit = 100 # Fetch 100 documents at a time

        while True:
            response = databases.list_documents(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=COLLECTION_APPOINTMENTS,
                queries=[
                    Query.equal("shop_id", [shop_id]),
                    Query.equal("status", ["Completed"]), # Only count completed appointments
                    Query.greater_than_equal("start_time", day_start_utc.isoformat()),
                    Query.less_than("start_time", day_end_utc.isoformat()),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            )
            
            documents = response['documents']
            all_completed_appointments.extend(documents)
            
            if len(documents) < limit:
                # We've fetched all the documents
                break
            
            offset += limit

        # --- Calculate Totals ---
        total_revenue = 0.0
        total_pre_tax = 0.0
        
        for appt in all_completed_appointments:
            total_revenue += appt.get('total_amount', 0)
            total_pre_tax += appt.get('bill_amount', 0)
        
        total_tax = total_revenue - total_pre_tax
        
        return {
            "total_revenue_before_tax": round(total_pre_tax, 2),
            "total_tax_collected": round(total_tax, 2),
            "total_revenue_after_tax": round(total_revenue, 2),
            "total_appointments": len(all_completed_appointments),
            "filter_period": filter_period_str
        }

    except Exception as e:
        print(f"An error occurred while generating financials: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate financial report.")
    
@router.get("/staff/{barberId}/schedule", response_model=schemas.WeeklyScheduleResponse)
async def get_barber_schedule(barberId: str):
    """
    Fetches the full weekly schedule for a specific barber.
    If a schedule for a day is not set, it defaults to a day off.
    """
    try:
        # 1. Fetch all existing schedule documents for this barber
        existing_schedule_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[Query.equal("barber_id", [barberId]), Query.limit(7)] # Limit to 7 for safety
        )

        # 2. Create a lookup map for easy access
        schedule_map = {
            item['day_of_week']: item for item in existing_schedule_response['documents']
        }

        # 3. Build a complete 7-day schedule, filling in any gaps
        full_week_schedule = []
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for day in days:
            if day in schedule_map:
                # If a schedule exists in the DB, use it
                day_data = schedule_map[day]
                full_week_schedule.append({
                    "day_of_week": day,
                    "start_time": day_data['start_time'],
                    "end_time": day_data['end_time'],
                    "is_day_off": day_data['is_day_off']
                })
            else:
                # If no schedule exists in the DB for this day, create a default "day off"
                full_week_schedule.append({
                    "day_of_week": day,
                    "start_time": "00:00",
                    "end_time": "00:00",
                    "is_day_off": "true"
                })
        
        return {"schedules": full_week_schedule}

    except Exception as e:
        print(f"An error occurred while fetching schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch barber's schedule.")
