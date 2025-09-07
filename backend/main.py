# backend/main.py

from fastapi import FastAPI, HTTPException
from typing import List
from appwrite.query import Query # <-- IMPORT THE QUERY CLASS

# Changed relative imports to absolute
import schemas
# Import the new collection ID variable
from appwrite_client import (
    databases, 
    APPWRITE_DATABASE_ID, 
    COLLECTION_SERVICES, 
    COLLECTION_SHOPS,
    COLLECTION_BARBERS # <-- IMPORT THE NEW COLLECTION ID
)

app = FastAPI(
    title="Barber Shop API",
    description="Backend API for the Barber Shop Appointment System",
    version="0.1.0",
)

# --- API Endpoints ---

# ... (keep the existing endpoints: /, /health, /api/services, /api/shops) ...
@app.get("/")
async def read_root():
    return {"message": "Barber Shop Backend is Running!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}

@app.get("/api/services", response_model=List[schemas.Service])
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

@app.get("/api/shops", response_model=List[schemas.Shop])
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


# NEW ENDPOINT
@app.get("/api/shops/{shopId}/barbers", response_model=List[schemas.Barber])
async def get_barbers_for_shop(shopId: str):
    """
    Fetches a list of barbers for a specific shop ID.
    """
    try:
        # Create a query to filter documents where 'shop_id' attribute equals the provided shopId
        queries = [Query.equal("shop_id", [shopId])]
        
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_BARBERS,
            queries=queries # Pass the queries to the request
        )
        return response['documents']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))