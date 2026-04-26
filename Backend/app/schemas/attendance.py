from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from enum import Enum

class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    half_day = "half_day"
    late = "late"

class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: AttendanceStatus = AttendanceStatus.present

class AttendanceUpdate(BaseModel):
    check_out: Optional[time] = None
    status: Optional[AttendanceStatus] = None

class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: str

    class Config:
        from_attributes = True