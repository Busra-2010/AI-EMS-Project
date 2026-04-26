from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.payroll import Payroll
from app.models.employee import Employee
from app.schemas.payroll import PayrollCreate, PayrollUpdate, PayrollResponse
from app.core.dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/payroll", tags=["Payroll"])

@router.post("/", response_model=PayrollResponse)
def generate_payroll(
    request: PayrollCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)  # only admin
):
    """Generate payroll for an employee for a specific month"""
    # Check employee exists
    employee = db.query(Employee).filter(
        Employee.id == request.employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    # Check payroll already generated for this month
    existing = db.query(Payroll).filter(
        Payroll.employee_id == request.employee_id,
        Payroll.month == request.month,
        Payroll.year == request.year
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payroll already generated for this month"
        )

    # Validate month range
    if not 1 <= request.month <= 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be between 1 and 12"
        )

    # Calculate net pay automatically
    net_pay = request.basic_salary + request.allowances - request.deductions

    new_payroll = Payroll(
        employee_id=request.employee_id,
        month=request.month,
        year=request.year,
        basic_salary=request.basic_salary,
        allowances=request.allowances,
        deductions=request.deductions,
        net_pay=net_pay,
        notes=request.notes
    )

    db.add(new_payroll)
    db.commit()
    db.refresh(new_payroll)
    return new_payroll

@router.get("/", response_model=List[PayrollResponse])
def get_all_payrolls(
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),
    month: Optional[int] = None,
    year: Optional[int] = None
):
    """Get all payroll records — admin only"""
    query = db.query(Payroll)

    if month:
        query = query.filter(Payroll.month == month)
    if year:
        query = query.filter(Payroll.year == year)

    return query.all()

@router.get("/employee/{employee_id}", response_model=List[PayrollResponse])
def get_employee_payrolls(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all payslips for a specific employee"""
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    payrolls = db.query(Payroll).filter(
        Payroll.employee_id == employee_id
    ).all()
    return payrolls

@router.get("/employee/{employee_id}/summary")
def get_payroll_summary(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get total payroll summary for an employee"""
    payrolls = db.query(Payroll).filter(
        Payroll.employee_id == employee_id
    ).all()

    if not payrolls:
        return {
            "employee_id": employee_id,
            "total_months": 0,
            "total_basic": 0,
            "total_allowances": 0,
            "total_deductions": 0,
            "total_net_pay": 0
        }

    return {
        "employee_id": employee_id,
        "total_months": len(payrolls),
        "total_basic": sum(p.basic_salary for p in payrolls),
        "total_allowances": sum(p.allowances for p in payrolls),
        "total_deductions": sum(p.deductions for p in payrolls),
        "total_net_pay": sum(p.net_pay for p in payrolls)
    }

@router.get("/{payroll_id}", response_model=PayrollResponse)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a single payroll record"""
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found"
        )
    return payroll

@router.put("/{payroll_id}", response_model=PayrollResponse)
def update_payroll(
    payroll_id: int,
    request: PayrollUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    """Update payroll allowances or deductions"""
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found"
        )

    if request.allowances is not None:
        payroll.allowances = request.allowances
    if request.deductions is not None:
        payroll.deductions = request.deductions
    if request.notes is not None:
        payroll.notes = request.notes

    # Recalculate net pay after update
    payroll.net_pay = payroll.basic_salary + payroll.allowances - payroll.deductions

    db.commit()
    db.refresh(payroll)
    return payroll

@router.delete("/{payroll_id}")
def delete_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    """Delete a payroll record"""
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found"
        )

    db.delete(payroll)
    db.commit()
    return {"message": "Payroll record deleted successfully"}