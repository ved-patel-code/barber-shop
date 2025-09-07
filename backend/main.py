# backend/main.py

from fastapi import FastAPI, HTTPException
from typing import List
import schemas  # Import the schemas module
from appwrite_client import databases, APPWRITE_DATABASE_ID, COLLECTION_SERVICES  # Import the Appwrite client and IDs

app = FastAPI(
    title="Barber Shop API",
    description="Backend API for the Barber Shop Appointment System",
    version="0.1.0",
)

# --- API Endpoints ---

@app.get("/")
async def read_root():
    return {"message": "Barber Shop Backend is Running!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}

# NEW ENDPOINT
@app.get("/api/services", response_model=List[schemas.Service])
async def get_all_services():
    """
    Fetches a list of all available services from the database.
    """
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SERVICES
        )
        # The list of documents is in the 'documents' key of the response
        return response['documents']
    except Exception as e:
        # If anything goes wrong with the Appwrite request, return a 500 error
        raise HTTPException(status_code=500, detail=str(e))
    

# backend/main.py

from fastapi import FastAPI, HTTPException
from typing import List

# Changed relative imports to absolute
import schemas
# Import the new collection ID variable
from appwrite_client import databases, APPWRITE_DATABASE_ID, COLLECTION_SERVICES, COLLECTION_SHOPS

app = FastAPI(
    title="Barber Shop API",
    description="Backend API for the Barber Shop Appointment System",
    version="0.1.0",
)

# --- API Endpoints ---

@app.get("/")
async def read_root():
    return {"message": "Barber Shop Backend is Running!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}

@app.get("/api/services", response_model=List[schemas.Service])
async def get_all_services():
    """
    Fetches a list of all available services from the database.
    """
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SERVICES
        )
        return response['documents']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# NEW ENDPOINT
@app.get("/api/shops", response_model=List[schemas.Shop])
async def get_all_shops():
    """
    Fetches a list of all shop locations from the database.
    """
    try:
        response = databases.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=COLLECTION_SHOPS # Use the new collection ID variable
        )
        return response['documents']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    