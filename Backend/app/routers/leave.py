from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.leave import Leave
from app.models.employee import Employee
from app.schemas.leave import LeaveCreate, LeaveUpdate, LeaveResponse
from app.core.dependencies import get_current_user, get_manager_or_admin

router = APIRouter(prefix="/leaves", tags=["Leave Management"])

@router.post("/", response_model=LeaveResponse)
def apply_leave(
    request: LeaveCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Employee applies for leave"""
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.id == request.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    # Check end date is after start date
    if request.end_date < request.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )

    new_leave = Leave(
        leave_type=request.leave_type,
        start_date=request.start_date,
        end_date=request.end_date,
        reason=request.reason,
        employee_id=request.employee_id
    )

    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return new_leave

@router.get("/", response_model=List[LeaveResponse])
def get_all_leaves(
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin),
    status: Optional[str] = None,
    employee_id: Optional[int] = None
):
    """Get all leave requests — admin/manager only"""
    query = db.query(Leave)

    # Filter by status if provided
    if status:
        query = query.filter(Leave.status == status)

    # Filter by employee if provided
    if employee_id:
        query = query.filter(Leave.employee_id == employee_id)

    return query.all()

@router.get("/my/{employee_id}", response_model=List[LeaveResponse])
def get_my_leaves(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get leave history of a specific employee"""
    leaves = db.query(Leave).filter(Leave.employee_id == employee_id).all()
    return leaves

@router.get("/{leave_id}", response_model=LeaveResponse)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a single leave request by ID"""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    return leave

@router.put("/{leave_id}/approve-reject", response_model=LeaveResponse)
def approve_reject_leave(
    leave_id: int,
    request: LeaveUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin)
):
    """Manager or Admin approves or rejects a leave request"""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )

    # Can't update already processed leave
    if leave.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Leave is already {leave.status}"
        )

    leave.status = request.status
    leave.manager_comment = request.manager_comment

    db.commit()
    db.refresh(leave)
    return leave

@router.delete("/{leave_id}")
def cancel_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Cancel a pending leave request"""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )

    # Can only cancel pending leaves
    if leave.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only cancel pending leave requests"
        )

    db.delete(leave)
    db.commit()
    return {"message": "Leave request cancelled successfully"}