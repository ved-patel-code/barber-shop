# backend/routers/owner.py

import calendar
from fastapi import APIRouter, HTTPException, Query as FastQuery
from typing import List, Optional
from appwrite.query import Query

# Import Pydantic schemas and Appwrite client details
import schemas
from appwrite_client import databases, APPWRITE_DATABASE_ID, COLLECTION_SHOPS, COLLECTION_BARBERS, COLLECTION_APPOINTMENTS 
from utils import TARGET_TIMEZONE
from datetime import datetime, timedelta, timezone


# Create a new router object for the owner dashboard
router = APIRouter(
    prefix="/api/owner",
    tags=["Owner Dashboard"]
)

@router.get("/shops", response_model=List[schemas.Shop])
async def get_all_shops_for_owner():
    """
    Fetches a list of all shops in the business for the owner's dashboard.
    """
    try:
        # This is a simple fetch of all documents from the Shops collection
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOPS
        )
        
        return response['documents']

    except Exception as e:
        print(f"An error occurred fetching shops for owner: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch shop list.")
    
@router.get("/staff", response_model=List[schemas.BarberDetails])
async def get_all_staff_for_owner(
    shop_id: Optional[str] = FastQuery(None, description="Optional: Filter the staff list by a specific shop ID.")
):
    """
    Fetches a list of all staff (barbers) across all shops.
    Can be optionally filtered by a specific shop ID.
    """
    try:
        # Prepare a list to hold our Appwrite queries
        queries = []

        # If a shop_id is provided in the URL, add a filter query
        if shop_id:
            queries.append(Query.equal("shop_id", [shop_id]))

        # We can also add pagination for large staff lists
        queries.append(Query.limit(100)) # Limit to 100 barbers for this call

        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_BARBERS,
            queries=queries
        )
        
        return response['documents']

    except Exception as e:
        print(f"An error occurred fetching staff for owner: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch staff list.")
    

@router.get("/financials", response_model=schemas.FinancialsReport)
async def get_owner_financials(
    shop_id: Optional[str] = FastQuery(None, description="Optional: Filter financials by a specific shop ID."),
    date: Optional[str] = FastQuery(None, description="A specific date in YYYY-MM-DD format."),
    month: Optional[str] = FastQuery(None, description="A specific month in YYYY-MM format.")
):
    """
    Calculates financial totals for a specific day or month.
    Can be filtered by a single shop, or aggregated across all shops.
    Defaults to today's data for all shops if no parameters are given.
    """
    if date and month:
        raise HTTPException(status_code=400, detail="Please provide either a 'date' or a 'month', not both.")

    filter_period_str = ""

    # --- Determine the time range for the query (same logic as manager's) ---
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
            day_start_local = datetime(year, month_num, 1, tzinfo=TARGET_TIMEZONE)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid month format. Please use YYYY-MM.")
    else:
        now_local = datetime.now(TARGET_TIMEZONE)
        target_date = now_local.date()
        filter_period_str = f"for today, {target_date.strftime('%Y-%m-%d')}"
        day_start_local = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=TARGET_TIMEZONE)
    
    if month:
        _, last_day = calendar.monthrange(day_start_local.year, day_start_local.month)
        day_end_local = day_start_local.replace(day=last_day, hour=23, minute=59, second=59)
    else: # Daily
        day_end_local = day_start_local + timedelta(days=1)

    day_start_utc = day_start_local.astimezone(timezone.utc)
    day_end_utc = day_end_local.astimezone(timezone.utc)

    try:
        # --- Build Queries ---
        queries = [
            Query.equal("status", ["Completed"]),
            Query.greater_than_equal("start_time", day_start_utc.isoformat()),
            Query.less_than("start_time", day_end_utc.isoformat())
        ]
        
        # ** THE KEY DIFFERENCE FOR THE OWNER **
        # Conditionally add the shop_id filter if it's provided
        if shop_id:
            queries.append(Query.equal("shop_id", [shop_id]))
            filter_period_str += f" for shop {shop_id}"
        else:
            filter_period_str += " for ALL shops"

        # --- Query and Aggregate Data (with pagination) ---
        all_completed_appointments = []
        offset = 0
        limit = 100

        while True:
            paginated_queries = queries + [Query.limit(limit), Query.offset(offset)]
            response = databases.list_documents(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=COLLECTION_APPOINTMENTS,
                queries=paginated_queries
            )
            
            documents = response['documents']
            all_completed_appointments.extend(documents)
            
            if len(documents) < limit:
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
        print(f"An error occurred while generating owner financials: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate financial report.")