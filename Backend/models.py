from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    hashed_password: str

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class UserOut(BaseModel):
    id: str
    name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TransactionBase(BaseModel):
    title: str
    category: str
    amount: float
    type: str # "expense" or "income"
    date: str
    icon: str

class TransactionCreate(TransactionBase):
    pass

class TransactionInDB(TransactionBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class TransactionOut(TransactionBase):
    id: str
    user_id: str

class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    date: Optional[str] = None
    icon: Optional[str] = None


class BudgetBase(BaseModel):
    category: str
    limit: float
    icon: str
    spent: float = 0.0

class BudgetCreate(BudgetBase):
    pass

class BudgetInDB(BudgetBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class BudgetOut(BudgetBase):
    id: str
    user_id: str

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    limit: Optional[float] = None
    icon: Optional[str] = None

