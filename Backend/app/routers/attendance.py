from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.core.dependencies import get_current_user, get_manager_or_admin

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse)
def mark_attendance(
    request: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Mark attendance for an employee"""
    # Check if employee exists
    employee = db.query(Employee).filter(
        Employee.id == request.employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    # Check if attendance already marked for this date
    existing = db.query(Attendance).filter(
        Attendance.employee_id == request.employee_id,
        Attendance.date == request.date
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance already marked for this date"
        )

    new_attendance = Attendance(
        employee_id=request.employee_id,
        date=request.date,
        check_in=request.check_in,
        check_out=request.check_out,
        status=request.status
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@router.get("/", response_model=List[AttendanceResponse])
def get_all_attendance(
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin),
    employee_id: Optional[int] = None,
    date_filter: Optional[date] = None
):
    """Get all attendance records — admin/manager only"""
    query = db.query(Attendance)

    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    if date_filter:
        query = query.filter(Attendance.date == date_filter)

    return query.all()

@router.get("/employee/{employee_id}", response_model=List[AttendanceResponse])
def get_employee_attendance(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get attendance records of a specific employee"""
    # Check employee exists
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee_id
    ).all()
    return attendance

@router.get("/employee/{employee_id}/summary")
def get_attendance_summary(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get monthly attendance summary for an employee"""
    attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee_id
    ).all()

    # Count each status
    total = len(attendance)
    present = len([a for a in attendance if a.status == "present"])
    absent = len([a for a in attendance if a.status == "absent"])
    half_day = len([a for a in attendance if a.status == "half_day"])
    late = len([a for a in attendance if a.status == "late"])

    return {
        "employee_id": employee_id,
        "total_days": total,
        "present": present,
        "absent": absent,
        "half_day": half_day,
        "late": late,
        "attendance_percentage": round((present / total * 100), 2) if total > 0 else 0
    }

@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: int,
    request: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update attendance — mainly for check out time"""
    attendance = db.query(Attendance).filter(
        Attendance.id == attendance_id
    ).first()
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )

    if request.check_out is not None:
        attendance.check_out = request.check_out
    if request.status is not None:
        attendance.status = request.status

    db.commit()
    db.refresh(attendance)
    return attendance

@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin)
):
    """Delete an attendance record"""
    attendance = db.query(Attendance).filter(
        Attendance.id == attendance_id
    ).first()
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )

    db.delete(attendance)
    db.commit()
    return {"message": "Attendance record deleted successfully"}