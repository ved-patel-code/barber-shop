# backend/main.py
from fastapi import FastAPI

# Initialize the FastAPI application
app = FastAPI(
    title="Barber Shop API",
    description="Backend API for the Barber Shop Appointment System",
    version="0.1.0",
)

# Define a simple root endpoint
@app.get("/")
async def read_root():
    return {"message": "Barber Shop Backend is Running!"}

# Define a simple health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}
    