import re
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models import BudgetCreate, BudgetOut, BudgetUpdate
from auth import get_current_user
from database import budgets_collection, transactions_collection
from bson import ObjectId

router = APIRouter(prefix="/api/budgets", tags=["budgets"])

@router.post("/", response_model=BudgetOut)
async def create_budget(budget: BudgetCreate, current_user: dict = Depends(get_current_user)):
    budget_dict = budget.model_dump()
    budget_dict["user_id"] = current_user["id"]
    
    result = await budgets_collection.insert_one(budget_dict)
    
    created_budget = await budgets_collection.find_one({"_id": result.inserted_id})
    created_budget["id"] = str(created_budget["_id"])
    created_budget["spent"] = 0.0
    return created_budget

@router.get("/", response_model=List[BudgetOut])
async def get_budgets(current_user: dict = Depends(get_current_user)):
    budgets = []
    cursor = budgets_collection.find({"user_id": current_user["id"]})
    async for document in cursor:
        document["id"] = str(document["_id"])
        
        # Calculate spent by querying transactions for this category (case-insensitive)
        spent = 0.0
        escaped_category = re.escape(document["category"])
        tx_cursor = transactions_collection.find({
            "user_id": current_user["id"],
            "category": {"$regex": f"^{escaped_category}$", "$options": "i"},
            "type": "expense"
        })
        async for tx in tx_cursor:
            spent += abs(tx["amount"])
            
        document["spent"] = spent
        budgets.append(document)
        
    return budgets

@router.put("/{id}", response_model=BudgetOut)
async def update_budget(id: str, update_data: BudgetUpdate, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid budget ID")
        
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields provided for update")
        
    result = await budgets_collection.update_one(
        {"_id": ObjectId(id), "user_id": current_user["id"]},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    updated = await budgets_collection.find_one({"_id": ObjectId(id)})
    updated["id"] = str(updated["_id"])
    
    # Calculate spent
    spent = 0.0
    escaped_category = re.escape(updated["category"])
    tx_cursor = transactions_collection.find({
        "user_id": current_user["id"],
        "category": {"$regex": f"^{escaped_category}$", "$options": "i"},
        "type": "expense"
    })
    async for tx in tx_cursor:
        spent += abs(tx["amount"])
    updated["spent"] = spent
    
    return updated

@router.delete("/{id}")
async def delete_budget(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid budget ID")
    result = await budgets_collection.delete_one({"_id": ObjectId(id), "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted successfully"}

