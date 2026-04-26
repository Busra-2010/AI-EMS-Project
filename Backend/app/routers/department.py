from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.core.dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.post("/", response_model=DepartmentResponse)
def create_department(
    request: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)  # only admin can create
):
    """Create a new department"""
    # Check if department already exists
    existing = db.query(Department).filter(Department.name == request.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department already exists"
        )
    
    new_dept = Department(
        name=request.name,
        description=request.description
    )
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.get("/", response_model=List[DepartmentResponse])
def get_all_departments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # any logged in user
):
    """Get all departments"""
    departments = db.query(Department).all()
    return departments

@router.get("/{dept_id}", response_model=DepartmentResponse)
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a single department by ID"""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    return dept

@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: int,
    request: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    """Update a department"""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    if request.name is not None:
        dept.name = request.name
    if request.description is not None:
        dept.description = request.description
    
    db.commit()
    db.refresh(dept)
    return dept

@router.delete("/{dept_id}")
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user)
):
    """Delete a department"""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted successfully"}