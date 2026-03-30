from pymongo import MongoClient
import os

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://admin:idDlivYTt1dP9OCO@cluster0.idjfv6x.mongodb.net/?appName=Cluster0"
)

client = MongoClient(MONGO_URI)
db = client["stockdashboard"]
users_col = db["users"]

# ──────────────────────────────────────────────
# User data helpers
# ──────────────────────────────────────────────

def get_user_data(email: str) -> dict:
    """Return a user's cloud-persisted document, or a fresh default."""
    doc = users_col.find_one({"email": email}, {"_id": 0})
    if doc:
        return doc
    return {
        "email": email,
        "followedStocks": [],
        "searchHistory": [],
        "viewHistory": [],
        "demoBalance": 100000,
        "demoPortfolio": []
    }

def save_user_data(email: str, data: dict) -> bool:
    """Upsert (insert or update) a user's document."""
    data["email"] = email
    users_col.update_one(
        {"email": email},
        {"$set": data},
        upsert=True
    )
    return True
