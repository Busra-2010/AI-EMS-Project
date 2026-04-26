from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

class LeaveType(str, Enum):
    sick = "sick"
    casual = "casual"
    earned = "earned"

class LeaveStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str] = None
    employee_id: int

class LeaveUpdate(BaseModel):
    status: LeaveStatus
    manager_comment: Optional[str] = None

class LeaveResponse(BaseModel):
    id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: Optional[str] = None
    status: str
    manager_comment: Optional[str] = None
    employee_id: int

    class Config:
        from_attributes = True