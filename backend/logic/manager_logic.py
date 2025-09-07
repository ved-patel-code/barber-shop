# backend/logic/manager_logic.py

from datetime import datetime, time, timedelta, timezone
from appwrite.query import Query
import asyncio

from appwrite_client import (
    databases,
    APPWRITE_DATABASE_ID,
    COLLECTION_BARBERS,
    COLLECTION_SCHEDULES,
    COLLECTION_APPOINTMENTS
)
from utils import TARGET_TIMEZONE, parse_iso_to_datetime

async def find_available_barbers_for_walk_in(shop_id: str, duration: int):
    """
    Finds all barbers in a shop who can start and complete a walk-in
    appointment of a given duration right now, excluding those currently busy.
    """
    now_utc = datetime.now(timezone.utc)
    now_local = now_utc.astimezone(TARGET_TIMEZONE)
    day_of_week = now_local.strftime("%A")
    current_time_str = now_local.strftime("%H:%M") # HH:MM string for schedule checks
    
    required_end_time_local = now_local + timedelta(minutes=duration)

    try:
        # 1. Find all barbers in the shop who are supposed to be working NOW
        #    AND whose shift extends beyond the required walk-in end time.
        on_shift_barbers_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SCHEDULES,
            queries=[
                Query.equal("shop_id", [shop_id]),
                Query.equal("day_of_week", [day_of_week]),
                Query.equal("is_day_off", [False]),
                Query.less_than_equal("start_time", current_time_str), # Started by now
                Query.greater_than_equal("end_time", required_end_time_local.strftime("%H:%M")) # Ends after required_end_time
            ]
        )
        
        on_shift_barbers_schedules = on_shift_barbers_response['documents']
        if not on_shift_barbers_schedules:
            return [] # No barbers are on shift to handle this appointment

        # Extract the IDs of barbers who are on shift
        on_shift_barber_ids = [schedule['barber_id'] for schedule in on_shift_barbers_schedules]

        # --- NEW LOGIC ADDITION: Check for current 'InProgress' appointments ---
        # Query for all 'InProgress' appointments for these barbers that overlap 'now_local'
        current_inprogress_appts_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            queries=[
                Query.equal("barber_id", on_shift_barber_ids),
                Query.equal("status", ["InProgress"]),
                # Appointment started before or at required_end_time
                Query.less_than_equal("start_time", required_end_time_local.astimezone(timezone.utc).isoformat()),
                # Appointment ends after or at now_utc
                Query.greater_than_equal("end_time", now_utc.isoformat())
            ]
        )
        
        # Get IDs of barbers currently busy with an InProgress appointment
        busy_barber_ids_inprogress = {appt['barber_id'] for appt in current_inprogress_appts_response['documents']}

        # Filter out barbers who are currently busy
        potentially_available_barber_ids = [
            barber_id for barber_id in on_shift_barber_ids if barber_id not in busy_barber_ids_inprogress
        ]

        if not potentially_available_barber_ids:
            return [] # All on-shift barbers are currently busy.

        # --- EXISTING LOGIC: Check for future appointments ---
        # Fetch next appointment for ALL potentially available barbers
        day_start_utc = now_local.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
        
        next_appointments_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_APPOINTMENTS,
            queries=[
                Query.equal("barber_id", potentially_available_barber_ids), # Use the filtered list
                Query.greater_than_equal("start_time", now_utc.isoformat()),
                Query.less_than("start_time", (day_start_utc + timedelta(days=1)).isoformat()),
                Query.not_equal("status", "Cancelled"),
                Query.not_equal("status", "InProgress"), # Also exclude InProgress from here
                Query.order_asc("start_time")
            ]
        )

        next_appointment_map = {}
        for appt in next_appointments_response['documents']:
            barber_id = appt['barber_id']
            # Only store the *first* (next) appointment for each barber
            if barber_id not in next_appointment_map:
                next_appointment_map[barber_id] = parse_iso_to_datetime(appt['start_time'])

        available_barber_ids = []
        for barber_id in potentially_available_barber_ids:
            next_appointment_start = next_appointment_map.get(barber_id)
            
            if next_appointment_start is None:
                available_barber_ids.append(barber_id)
                continue
            
            # Compare required end time with next appointment start time
            # Convert next_appointment_start (which is local naive) to local aware for direct comparison
            next_appointment_start_local = next_appointment_start.replace(tzinfo=TARGET_TIMEZONE)
            if required_end_time_local <= next_appointment_start_local:
                available_barber_ids.append(barber_id)
        
        if not available_barber_ids:
            return []

        # 4. Fetch the full details of the truly available barbers
        final_barbers_response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_BARBERS,
            queries=[Query.equal("$id", available_barber_ids)]
        )

        return final_barbers_response['documents']

    except Exception as e:
        print(f"Error finding available barbers for walk-in: {e}")
        return []


