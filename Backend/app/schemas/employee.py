from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from enum import Enum

class EmploymentType(str, Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    designation: Optional[str] = None
    employment_type: EmploymentType = EmploymentType.full_time
    salary: Optional[float] = 0.0
    joining_date: Optional[date] = None
    department_id: Optional[int] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    designation: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    salary: Optional[float] = None
    joining_date: Optional[date] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None

class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    designation: Optional[str] = None
    employment_type: str
    salary: float
    joining_date: Optional[date] = None
    is_active: bool
    department_id: Optional[int] = None

    class Config:
        from_attributes = True