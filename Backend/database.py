from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "expense_tracker"

settings = Settings()

client = AsyncIOMotorClient(settings.mongodb_url)
db = client[settings.database_name]

# Collections
users_collection = db.get_collection("users")
transactions_collection = db.get_collection("transactions")
budgets_collection = db.get_collection("budgets")
