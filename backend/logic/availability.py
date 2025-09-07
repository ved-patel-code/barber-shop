# backend/logic/availability.py

from datetime import datetime, time, timedelta
from appwrite.query import Query
import asyncio
# Import our Appwrite database client and collection IDs
from appwrite_client import (
    databases, 
    APPWRITE_DATABASE_ID, 
    COLLECTION_SCHEDULES, 
    COLLECTION_SHOP_TIMINGS
)

async def calculate_barber_availability(barber_id: str, shop_id: str, date_str: str, total_duration: int):
    """
    Calculates the available time slots for a single barber on a specific date.
    """
    # --- PART 1: Function Definition & Date Handling ---
    try:
        # Convert the date string (e.g., "2025-09-15") to a datetime object
        selected_date = datetime.strptime(date_str, "%Y-%m-%d")
        # Get the day of the week as a string (e.g., "Monday")
        day_of_week = selected_date.strftime("%A")
    except ValueError:
        # If the date format is wrong, return no availability
        return []

    # --- PART 2: Fetch Barber's Schedule & Shop Timings ---
    try:
        # Fetch the barber's schedule for that day of the week
        schedule_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[
                Query.equal("barber_id", [barber_id]),
                Query.equal("day_of_week", [day_of_week]),
                Query.limit(1) # We only expect one schedule per barber per day
            ]
        )
        
        # Fetch the shop's timings for that day of the week
        shop_timing_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOP_TIMINGS,
            queries=[
                Query.equal("shop_id", [shop_id]),
                Query.equal("day_of_week", [day_of_week]),
                Query.limit(1)
            ]
        )

        # Early Exit Check 1: No schedule or timing found
        if not schedule_response['documents'] or not shop_timing_response['documents']:
            print(f"No schedule or shop timing found for {day_of_week}.")
            return []

        barber_schedule = schedule_response['documents'][0]
        shop_timing = shop_timing_response['documents'][0]
        
        # Early Exit Check 2: Barber has day off or shop is closed
        if barber_schedule['is_day_off'] or shop_timing['is_closed']:
            print(f"Barber has day off or shop is closed on {day_of_week}.")
            return []
        
         # --- PART 3: Determine the Barber's Actual Working Hours ---

        # Convert time strings from Appwrite (e.g., "09:00") to Python time objects
        barber_start_time = datetime.strptime(barber_schedule['start_time'], "%H:%M").time()
        barber_end_time = datetime.strptime(barber_schedule['end_time'], "%H:%M").time()
        shop_open_time = datetime.strptime(shop_timing['open_time'], "%H:%M").time()
        shop_close_time = datetime.strptime(shop_timing['close_time'], "%H:%M").time()

        # The actual start time is the LATEST of when the shop opens and when the barber starts
        actual_start_time = max(barber_start_time, shop_open_time)
        
        # The actual end time is the EARLIEST of when the shop closes and when the barber ends
        actual_end_time = min(barber_end_time, shop_close_time)

        # Combine the date with the calculated times to get full datetime objects
        # This will be crucial for comparing with appointments later
        working_start_dt = selected_date.replace(hour=actual_start_time.hour, minute=actual_start_time.minute)
        working_end_dt = selected_date.replace(hour=actual_end_time.hour, minute=actual_end_time.minute)
        
        # Another check: if for some reason the start time is after or at the end time, something is wrong
        if working_start_dt >= working_end_dt:
            print("Calculated working hours are invalid (start is after end).")
            return []

        print(f"Barber Schedule: {barber_start_time} - {barber_end_time}")
        print(f"Shop Timing: {shop_open_time} - {shop_close_time}")
        print(f"Calculated Actual Working Hours: {working_start_dt.time()} - {working_end_dt.time()}")
        
        # For now, return a new placeholder
        return [f"Calculated working hours: {actual_start_time} to {actual_end_time}"]

    except Exception as e:
        print(f"An error occurred: {e}")
        return []