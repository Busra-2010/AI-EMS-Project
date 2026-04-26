from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(Integer, nullable=False)   # 1-12
    year = Column(Integer, nullable=False)
    basic_salary = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_pay = Column(Float, default=0.0)
    notes = Column(String(255), nullable=True)

    # Which employee
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employee = relationship("Employee", back_populates="payrolls")