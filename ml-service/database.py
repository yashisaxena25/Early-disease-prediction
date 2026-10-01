"""Supabase store for prediction history."""
import os, json
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def initialize_database():
    # Supabase handles migrations via dashboard
    pass

def create_prediction(user_name, symptoms, disease):
    data = {
        "user_name": user_name.strip() or "Guest",
        "symptoms": json.dumps(symptoms),
        "disease": disease,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = supabase.table("predictions").insert(data).execute()
    return result.data[0]["id"]

def get_history(user_name):
    result = supabase.table("predictions").select("id, symptoms, disease, created_at") \
        .eq("user_name", user_name.strip() or "Guest") \
        .order("created_at", desc=True).limit(20).execute()
    return [
        {
            "id": row["id"],
            "symptoms": json.loads(row["symptoms"]) if isinstance(row["symptoms"], str) else row["symptoms"],
            "predicted_disease": row["disease"],
            "created_at": row["created_at"]
        }
        for row in result.data
    ]

