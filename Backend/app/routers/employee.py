from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.employee import Employee
from app.models.department import Department
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.core.dependencies import get_current_user, get_admin_user, get_manager_or_admin

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/", response_model=EmployeeResponse)
def create_employee(
    request: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin)
):
    """Create a new employee"""
    existing = db.query(Employee).filter(Employee.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this email already exists"
        )

    if request.department_id:
        dept = db.query(Department).filter(Department.id == request.department_id).first()
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )

    new_employee = Employee(
        name=request.name,
        email=request.email,
        phone=request.phone,
        address=request.address,
        designation=request.designation,
        employment_type=request.employment_type,
        salary=request.salary,
        joining_date=request.joining_date,
        department_id=request.department_id
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee


@router.get("/", response_model=List[EmployeeResponse])
def get_all_employees(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),  # ← all roles allowed
    department_id: Optional[int] = None,
    is_active: Optional[bool] = None
):
    """Get all employees with optional filters"""
    query = db.query(Employee)

    if department_id:
        query = query.filter(Employee.department_id == department_id)

    if is_active is not None:
        query = query.filter(Employee.is_active == is_active)

    return query.all()


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a single employee by ID"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    request: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    """Update an employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    """Deactivate an employee instead of deleting"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    employee.is_active = False
    db.commit()
    return {"message": "Employee deactivated successfully"}