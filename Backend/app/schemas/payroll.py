from pydantic import BaseModel
from typing import Optional

class PayrollCreate(BaseModel):
    employee_id: int
    month: int        # 1-12
    year: int         # e.g 2024
    basic_salary: float
    allowances: float = 0.0
    deductions: float = 0.0
    notes: Optional[str] = None

class PayrollUpdate(BaseModel):
    allowances: Optional[float] = None
    deductions: Optional[float] = None
    notes: Optional[str] = None

class PayrollResponse(BaseModel):
    id: int
    employee_id: int
    month: int
    year: int
    basic_salary: float
    allowances: float
    deductions: float
    net_pay: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True