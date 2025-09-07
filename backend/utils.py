# backend/utils.py

from datetime import datetime

def parse_iso_to_datetime(iso_string: str) -> datetime:
    """
    Parses an Appwrite ISO 8601 string into a timezone-naive Python datetime object.
    """
    # Handles both 'Z' and '+XX:XX' timezone formats from Appwrite/ISO standard
    if iso_string.endswith('Z'):
        iso_string = iso_string[:-1] + '+00:00'
    
    dt_aware = datetime.fromisoformat(iso_string)
    return dt_aware.replace(tzinfo=None)