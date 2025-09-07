# backend/appwrite_client.py

import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

# Load environment variables from .env file located in the parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# --- Appwrite Configuration ---
APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")

# --- Appwrite Collection IDs ---
# We will store all collection IDs here for easy access
COLLECTION_SHOPS = os.getenv("COLLECTION_ID_SHOPS")
COLLECTION_SERVICES = os.getenv("COLLECTION_ID_SERVICES")
COLLECTION_BARBERS = os.getenv("COLLECTION_ID_BARBERS")

# Initialize the Appwrite Client
client = Client()
(client
    .set_endpoint(APPWRITE_ENDPOINT)
    .set_project(APPWRITE_PROJECT_ID)
    .set_key(APPWRITE_API_KEY)
)

# Initialize the Databases service
databases = Databases(client)

print("Appwrite client initialized successfully.")