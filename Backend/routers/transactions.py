from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from models import TransactionCreate, TransactionOut, TransactionUpdate
from auth import get_current_user
from database import transactions_collection
from bson import ObjectId

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionOut)
async def create_transaction(transaction: TransactionCreate, current_user: dict = Depends(get_current_user)):
    transaction_dict = transaction.model_dump()
    transaction_dict["user_id"] = current_user["id"]
    
    result = await transactions_collection.insert_one(transaction_dict)
    
    created_transaction = await transactions_collection.find_one({"_id": result.inserted_id})
    created_transaction["id"] = str(created_transaction["_id"])
    return created_transaction

@router.get("/", response_model=List[TransactionOut])
async def get_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["id"]}
    if category and category != "All":
        query["category"] = category
    if type and type != "all":
        query["type"] = type
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]

    transactions = []
    cursor = transactions_collection.find(query).sort("date", -1)
    async for document in cursor:
        document["id"] = str(document["_id"])
        transactions.append(document)
    return transactions

@router.put("/{id}", response_model=TransactionOut)
async def update_transaction(id: str, update_data: TransactionUpdate, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid transaction ID")
        
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields provided for update")
        
    result = await transactions_collection.update_one(
        {"_id": ObjectId(id), "user_id": current_user["id"]},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    updated = await transactions_collection.find_one({"_id": ObjectId(id)})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{id}")
async def delete_transaction(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid transaction ID")
    result = await transactions_collection.delete_one({"_id": ObjectId(id), "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}

