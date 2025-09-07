# backend/utils.py

from datetime import datetime, timedelta, timezone

TIMEZONE_OFFSET = timedelta(hours=5, minutes=30)
TARGET_TIMEZONE = timezone(TIMEZONE_OFFSET)

def parse_iso_to_datetime(iso_string: str) -> datetime:
    """
    Parses an Appwrite ISO 8601 string (which is in UTC) and converts it 
    to a timezone-naive datetime object in the TARGET_TIMEZONE.
    """
    # Appwrite returns ISO 8601 format, typically in UTC.
    # We first parse it into a timezone-aware datetime object.
    dt_aware_utc = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
    
    # Then, we convert this UTC time to our target timezone.
    dt_aware_local = dt_aware_utc.astimezone(TARGET_TIMEZONE)
    
    # Finally, we make it "naive" (remove the timezone info) so that all
    # datetime objects in our logic can be compared directly without issues.
    return dt_aware_local.replace(tzinfo=None)