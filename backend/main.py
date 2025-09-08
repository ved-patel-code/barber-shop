# backend/main.py

from fastapi import FastAPI, HTTPException
from typing import List
from appwrite.query import Query
from fastapi.middleware.cors import CORSMiddleware
# Import schemas and appwrite_client as before

from routers import booking, manager, owner 



app = FastAPI(
    title="Barber Shop API",
    description="Backend API for the Barber Shop Appointment System",
    version="0.1.0",
)

origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # List of origins that are allowed to make requests
    allow_credentials=True,         # Allow cookies to be included in cross-origin requests
    allow_methods=["*"],            # Allow all standard HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
    allow_headers=["*"],            # Allow all headers to be sent in cross-origin requests
)

# --- Include API Routers ---
# Tell the main app to use the routes defined in the booking router
app.include_router(booking.router)
app.include_router(manager.router)
app.include_router(owner.router)

# --- API Endpoints ---
@app.get("/")
async def read_root():
    return {"message": "Barber Shop Backend is Running!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}
