# backend/logic/any_barber.py

import asyncio
from datetime import datetime

from appwrite.query import Query

# Import our Appwrite database client and collection IDs
from appwrite_client import (
    COLLECTION_SCHEDULES,
    COLLECTION_SHOP_TIMINGS,
    databases, 
    APPWRITE_DATABASE_ID, 
    COLLECTION_BARBERS
)
# IMPORTANT: Import the function we want to reuse from our other logic file
from logic.availability import calculate_barber_availability

async def calculate_any_barber_availability(shop_id: str, date_str: str, total_duration: int):
    """
    Calculates the aggregated available time slots for "Any Barber" at a specific shop on a given date.
    """
    
    # --- PART 1: Function Definition & Initial Data Fetching ---
    try:
        # Get all barbers that belong to the specified shop
        barbers_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_BARBERS,
            queries=[Query.equal("shop_id", [shop_id])]
        )
        
        all_barbers = barbers_response['documents']
        
        if not all_barbers:
            print(f"No barbers found for shop_id: {shop_id}")
            return []

    except Exception as e:
        print(f"An error occurred fetching barbers: {e}")
        return []

    # --- PART 2: Calculate Individual Schedules Asynchronously ---
    
    # Create a list of tasks. Each task is a coroutine that calculates the 
    # availability for one barber.
    tasks = []
    for barber in all_barbers:
        barber_id = barber['$id']
        task = calculate_barber_availability(
            barber_id=barber_id,
            shop_id=shop_id,
            date_str=date_str,
            total_duration=total_duration
        )
        tasks.append(task)
    
    # Run all the tasks concurrently and wait for them all to finish.
    # The result will be a list of the return values from each task.
    all_individual_slots = await asyncio.gather(*tasks)

     # --- PART 3: Aggregate and Unify the Time Slots ---

    # Use a set to automatically handle duplicates.
    # A set is a collection where each item must be unique.
    unified_slots_set = set()

    # Iterate through the list of lists
    for barber_slots in all_individual_slots:
        # Iterate through each time slot string in the inner list
        for slot in barber_slots:
            unified_slots_set.add(slot)
    
    # Convert the set back to a list to be able to sort it
    final_slots_list = list(unified_slots_set)
    
    # Sort the list chronologically (e.g., "09:00" comes before "10:30")
    final_slots_list.sort()

    print(f"Fetched availability for {len(all_barbers)} barbers.")
    print(f"Unified into {len(final_slots_list)} unique available slots.")
    
    return final_slots_list

async def check_any_barber_date_availability(shop_id: str, date_str: str):
    """
    Quickly checks if a date is potentially available for "Any Barber"
    by verifying if at least one barber is working and the shop is open.
    This avoids expensive slot calculation.
    """
    try:
        selected_date = datetime.strptime(date_str, "%Y-%m-%d")
        day_of_week = selected_date.strftime("%A")

        # 1. Check if the shop is even open on that day of the week
        shop_timing_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOP_TIMINGS,
            queries=[
                Query.equal("shop_id", [shop_id]),
                Query.equal("day_of_week", [day_of_week]),
                Query.limit(1)
            ]
        )
        if not shop_timing_response['documents'] or shop_timing_response['documents'][0]['is_closed']:
            return False # Shop is closed, so no availability

        # 2. Check if at least ONE barber is scheduled to work and is NOT on a day off
        barber_schedule_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[
                Query.equal("shop_id", [shop_id]), # We can add shop_id to schedules for faster lookup
                Query.equal("day_of_week", [day_of_week]),
                Query.equal("is_day_off", [False]),
                Query.limit(1) # We only need to find one, not all of them
            ]
        )
        
        # If the document list is not empty, it means we found at least one working barber
        if barber_schedule_response['documents']:
            return True # Date is available!
        
        return False # No working barbers found

    except Exception as e:
        print(f"Error in check_any_barber_date_availability: {e}")
        return False