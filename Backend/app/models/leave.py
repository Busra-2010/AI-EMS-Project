from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class LeaveType(str, enum.Enum):
    sick = "sick"
    casual = "casual"
    earned = "earned"

class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String(255), nullable=True)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending)
    manager_comment = Column(String(255), nullable=True)

    # Which employee applied
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employee = relationship("Employee", back_populates="leaves")