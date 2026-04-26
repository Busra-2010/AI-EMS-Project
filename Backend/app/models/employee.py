from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class EmploymentType(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    designation = Column(String(100), nullable=True)
    employment_type = Column(Enum(EmploymentType), default=EmploymentType.full_time)
    salary = Column(Float, default=0.0)
    joining_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)

    # Foreign key linking to department
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="employees")

    # One employee has many leaves, attendances, payrolls, appraisals
    leaves = relationship("Leave", back_populates="employee")
    attendances = relationship("Attendance", back_populates="employee")
    payrolls = relationship("Payroll", back_populates="employee")
    appraisals = relationship("Appraisal", back_populates="employee")