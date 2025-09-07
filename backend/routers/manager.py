# backend/routers/manager.py

from fastapi import APIRouter, HTTPException, Query as FastQuery
from typing import List, Optional
from appwrite.query import Query
from datetime import datetime, timedelta, timezone

# Import Pydantic schemas and Appwrite client details
import schemas
from appwrite_client import COLLECTION_BARBERS, databases, APPWRITE_DATABASE_ID, COLLECTION_APPOINTMENTS
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