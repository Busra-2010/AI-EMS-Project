from sqlalchemy import Column, Integer, Date, Time, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    half_day = "half_day"
    late = "late"

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    check_in = Column(Time, nullable=True)
    check_out = Column(Time, nullable=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present)

    # Which employee
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employee = relationship("Employee", back_populates="attendances")