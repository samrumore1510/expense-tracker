from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers import users, transactions, budgets
from auth import get_current_user
from routers import users, transactions, budgets

app = FastAPI(title="Expense Tracker API")

# Setup CORS to allow React frontend to communicate with Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(budgets.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Expense Tracker API"}

@app.get("/api/dashboard", tags=["dashboard"])
async def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    from database import transactions_collection, budgets_collection
    
    # Calculate totals
    income = 0.0
    expense = 0.0
    
    tx_cursor = transactions_collection.find({"user_id": current_user["id"]}).sort("date", -1)
    
    transactions_list = []
    async for tx in tx_cursor:
        tx["id"] = str(tx["_id"])
        del tx["_id"]
        transactions_list.append(tx)
        
        if tx["type"] == "income":
            income += abs(tx["amount"])
        elif tx["type"] == "expense":
            expense += abs(tx["amount"])
            
    balance = income - expense
    savings = income * 0.20 # Placeholder metric or custom logic
    
    recent_transactions = transactions_list[:4]
    
    chart_data_map = {}
    for tx in reversed(transactions_list): # Reverse for chronological order
        date = tx["date"]
        if date not in chart_data_map:
            chart_data_map[date] = {"name": date, "income": 0, "expense": 0}
        if tx["type"] == "income":
            chart_data_map[date]["income"] += abs(tx["amount"])
        else:
            chart_data_map[date]["expense"] += abs(tx["amount"])
            
    chart_data = list(chart_data_map.values())
    if not chart_data:
        chart_data = [{"name": "No Data", "income": 0, "expense": 0}]

    monthly_budget = 0
    budget_spent = 0
    budget_cursor = budgets_collection.find({"user_id": current_user["id"]})
    async for b in budget_cursor:
        monthly_budget += b.get("limit", 0)
        budget_spent += b.get("spent", 0)
        
    spent_percentage = round((budget_spent / monthly_budget * 100)) if monthly_budget > 0 else 0
    
    return {
        "user": current_user,
        "total_balance": balance,
        "income": income,
        "expense": expense,
        "savings": savings,
        "recent_transactions": recent_transactions,
        "chart_data": chart_data,
        "monthly_budget": monthly_budget,
        "spent_percentage": spent_percentage
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
