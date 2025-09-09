# backend/logic/availability.py

import asyncio
from datetime import datetime, time, timedelta
from typing import List
from appwrite.query import Query
# Import our Appwrite database client and collection IDs
from appwrite_client import (
    databases, 
    APPWRITE_DATABASE_ID, 
    COLLECTION_SCHEDULES, 
    COLLECTION_SHOP_TIMINGS,
    COLLECTION_APPOINTMENTS

)
from utils import parse_iso_to_datetime



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

        # --- PART 4: Fetch Existing Appointments for the Day (CORRECTED) ---

        day_start = selected_date.replace(hour=0, minute=0, second=0)
        day_end = day_start + timedelta(days=1)
        
        day_start_iso = day_start.isoformat()
        day_end_iso = day_end.isoformat()

        # Build the queries with the CORRECT method names
        appointment_queries = [
            Query.equal("barber_id", [barber_id]),
            Query.greater_than_equal("start_time", day_start_iso), # CORRECTED
            Query.less_than("start_time", day_end_iso),           # CORRECTED
            Query.not_equal("status", ["Cancelled"]),             # CORRECTED
            Query.order_asc("start_time")                         # CORRECTED
        ]
        
        appointments_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            queries=appointment_queries
        )
        
        appointments = appointments_response['documents']
        
         # --- PART 5: Calculate the "Free Time" Blocks (The Core Algorithm) ---

        free_blocks = []
        # Start tracking free time from the beginning of the barber's actual working day.
        last_free_time_start = working_start_dt

        # Loop through each sorted appointment to find the gaps
        for appointment in appointments:
            appointment_start = parse_iso_to_datetime(appointment['start_time'])
            appointment_end = parse_iso_to_datetime(appointment['end_time'])

            # The free block is the time between our last known free point and the start of this appointment.
            # Only add the block if there is a positive amount of free time.
            if appointment_start > last_free_time_start:
                free_blocks.append((last_free_time_start, appointment_start))
            
            # Update our tracker to the end of the current appointment, as this is the start of the next potential free block.
            last_free_time_start = appointment_end
        
        # After the loop, calculate the final free block from the end of the last appointment to the end of the day.
        # Again, only add it if there is a positive amount of time.
        if working_end_dt > last_free_time_start:
            free_blocks.append((last_free_time_start, working_end_dt))
            
          # --- PART 6: Generate 30-Minute Bookable Slots from Free Blocks ---

        available_slots = []
        slot_interval = timedelta(minutes=30)
        appointment_duration = timedelta(minutes=total_duration)

        # Iterate through each large free time window we found
        for start_block, end_block in free_blocks:
            
            # Start checking for slots from the beginning of the free block
            current_slot_start = start_block

            # Keep adding slots as long as a full appointment can fit in the remaining block
            while current_slot_start + appointment_duration <= end_block:
                
                # Add the current slot start time to our list of results
                # We format it as a "HH:MM" string for the frontend
                available_slots.append(current_slot_start.strftime("%H:%M"))

                # Move to the next potential slot time (30 minutes later)
                current_slot_start += slot_interval
        
        print(f"Calculated Actual Working Hours: {working_start_dt.time()} - {working_end_dt.time()}")
        print(f"Found {len(appointments)} active appointments for the day.")
        print(f"Calculated {len(free_blocks)} free time blocks.")
        print(f"Generated {len(available_slots)} available slots.")

        return available_slots

    except Exception as e:
        print(f"An error occurred: {e}")
        return []
    

# deprecated not in use as it was too slow and the function which called this funation is also changed.
async def is_barber_working_on_date(barber_id: str, shop_id: str, date_str: str) -> bool:
    """
    Checks if a specific barber is scheduled and the shop is open on a given date.
    This is a fast check that does NOT calculate slots.
    """
    try:
        selected_date = datetime.strptime(date_str, "%Y-%m-%d")
        day_of_week = selected_date.strftime("%A")

        # --- FIX: Run these synchronous calls directly ---
        
        # Query for the barber's schedule for that day
        schedule_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[Query.equal("barber_id", [barber_id]), Query.equal("day_of_week", [day_of_week]), Query.limit(1)]
        )

        # Query for the shop's timing for that day
        shop_timing_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOP_TIMINGS,
            queries=[Query.equal("shop_id", [shop_id]), Query.equal("day_of_week", [day_of_week]), Query.limit(1)]
        )


        # Check if both schedule and timings exist
        if not schedule_response['documents'] or not shop_timing_response['documents']:
            return False

        # Check if barber has day off or shop is closed
        if schedule_response['documents'][0]['is_day_off'] or shop_timing_response['documents'][0]['is_closed']:
            return False

        # If all checks pass, the date is potentially available
        return True
    except Exception:
        return False

# NEW LIGHTWEIGHT FUNCTION FOR ANY BARBER
async def is_any_barber_working_on_date(shop_id: str, date_str: str) -> bool:
    """
    Checks if ANY barber is scheduled and the shop is open on a given date.
    This is a fast check that does NOT calculate slots.
    """
    try:
        selected_date = datetime.strptime(date_str, "%Y-%m-%d")
        day_of_week = selected_date.strftime("%A")

        # 1. First, check if the shop is even open.
        shop_timing_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOP_TIMINGS,
            queries=[Query.equal("shop_id", [shop_id]), Query.equal("day_of_week", [day_of_week]), Query.limit(1)]
        )
        if not shop_timing_response['documents'] or shop_timing_response['documents'][0]['is_closed']:
            return False

        # 2. Then, check if at least ONE barber is working.
        # REMINDER: This requires 'shop_id' attribute in the Schedules collection.
        barber_schedule_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[
                Query.equal("shop_id", [shop_id]),
                Query.equal("day_of_week", [day_of_week]),
                Query.equal("is_day_off", [False]),
                Query.limit(1)
            ]
        )
        
        # If we found at least one document, a barber is working.
        return bool(barber_schedule_response['documents'])
    except Exception:
        return False
    

async def get_weekly_available_dates_for_barber(
    barber_id: str, 
    shop_id: str, 
    date_strs_to_check: List[str]
) -> List[str]:
    """
    Efficiently finds available dates for a single barber over a given
    period by fetching the entire weekly schedule in just two DB calls.
    """
    try:
        # 1. Fetch the barber's entire weekly schedule in one call
        schedule_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[Query.equal("barber_id", [barber_id])]
        )
        
        # 2. Fetch the shop's entire weekly timings in one call
        shop_timing_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOP_TIMINGS,
            queries=[Query.equal("shop_id", [shop_id])]
        )

        # 3. Convert the lists into efficient lookup dictionaries (hash maps)
        schedule_map = {item['day_of_week']: item for item in schedule_response['documents']}
        shop_timing_map = {item['day_of_week']: item for item in shop_timing_response['documents']}

        # 4. Loop through the dates in Python (very fast) and check availability
        available_dates = []
        for date_str in date_strs_to_check:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d")
            day_of_week = selected_date.strftime("%A")
            
            # Instantly look up the schedule and timing for that day
            barber_schedule = schedule_map.get(day_of_week)
            shop_timing = shop_timing_map.get(day_of_week)

            # Check for availability
            if barber_schedule and shop_timing: # Ensure both records exist for the day
                if not barber_schedule['is_day_off'] and not shop_timing['is_closed']:
                    available_dates.append(date_str)
        
        return available_dates

    except Exception as e:
        print(f"Error in get_weekly_available_dates_for_barber: {e}")
        return []
