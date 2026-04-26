from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.appraisal import Appraisal
from app.models.employee import Employee
from app.schemas.appraisal import AppraisalCreate, AppraisalUpdate, AppraisalResponse
from app.core.dependencies import get_current_user, get_manager_or_admin
from app.ai.sentiment import analyze_sentiment

router = APIRouter(prefix="/appraisals", tags=["Appraisals"])


@router.post("/", response_model=AppraisalResponse)
def create_appraisal(
    request: AppraisalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin)   # manager or admin only
):
    """Create an appraisal — AI automatically analyzes the feedback sentiment"""

    # Check if employee exists
    employee = db.query(Employee).filter(Employee.id == request.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    # Run AI sentiment analysis on the feedback text
    sentiment_result = {"sentiment": None, "score": None}
    if request.feedback:
        sentiment_result = analyze_sentiment(request.feedback)

    new_appraisal = Appraisal(
        employee_id=request.employee_id,
        rating=request.rating,
        feedback=request.feedback,
        period=request.period,
        sentiment=sentiment_result["sentiment"],
        sentiment_score=sentiment_result["score"]
    )

    db.add(new_appraisal)
    db.commit()
    db.refresh(new_appraisal)
    return new_appraisal


@router.get("/", response_model=List[AppraisalResponse])
def get_all_appraisals(
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin),
    employee_id: Optional[int] = None,
    sentiment: Optional[str] = None
):
    """Get all appraisals — filter by employee or sentiment"""
    query = db.query(Appraisal)

    if employee_id:
        query = query.filter(Appraisal.employee_id == employee_id)

    if sentiment:
        query = query.filter(Appraisal.sentiment == sentiment)

    return query.all()


@router.get("/employee/{employee_id}", response_model=List[AppraisalResponse])
def get_employee_appraisals(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all appraisals for a specific employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    appraisals = db.query(Appraisal).filter(
        Appraisal.employee_id == employee_id
    ).all()
    return appraisals


@router.get("/employee/{employee_id}/summary")
def get_appraisal_summary(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get appraisal summary with average rating and sentiment breakdown"""
    appraisals = db.query(Appraisal).filter(
        Appraisal.employee_id == employee_id
    ).all()

    if not appraisals:
        return {
            "employee_id": employee_id,
            "total_appraisals": 0,
            "average_rating": 0,
            "sentiment_breakdown": {"positive": 0, "negative": 0, "neutral": 0}
        }

    total = len(appraisals)
    avg_rating = round(sum(a.rating for a in appraisals) / total, 2)

    sentiment_breakdown = {
        "positive": len([a for a in appraisals if a.sentiment == "positive"]),
        "negative": len([a for a in appraisals if a.sentiment == "negative"]),
        "neutral":  len([a for a in appraisals if a.sentiment == "neutral"])
    }

    return {
        "employee_id": employee_id,
        "total_appraisals": total,
        "average_rating": avg_rating,
        "sentiment_breakdown": sentiment_breakdown
    }


@router.get("/{appraisal_id}", response_model=AppraisalResponse)
def get_appraisal(
    appraisal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a single appraisal by ID"""
    appraisal = db.query(Appraisal).filter(Appraisal.id == appraisal_id).first()
    if not appraisal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appraisal not found"
        )
    return appraisal


@router.put("/{appraisal_id}", response_model=AppraisalResponse)
def update_appraisal(
    appraisal_id: int,
    request: AppraisalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin)
):
    """Update an appraisal — re-runs AI sentiment if feedback is changed"""
    appraisal = db.query(Appraisal).filter(Appraisal.id == appraisal_id).first()
    if not appraisal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appraisal not found"
        )

    if request.rating is not None:
        appraisal.rating = request.rating

    if request.period is not None:
        appraisal.period = request.period

    # If feedback is updated, re-run sentiment analysis
    if request.feedback is not None:
        appraisal.feedback = request.feedback
        sentiment_result = analyze_sentiment(request.feedback)
        appraisal.sentiment = sentiment_result["sentiment"]
        appraisal.sentiment_score = sentiment_result["score"]

    db.commit()
    db.refresh(appraisal)
    return appraisal


@router.delete("/{appraisal_id}")
def delete_appraisal(
    appraisal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_manager_or_admin)
):
    """Delete an appraisal"""
    appraisal = db.query(Appraisal).filter(Appraisal.id == appraisal_id).first()
    if not appraisal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appraisal not found"
        )

    db.delete(appraisal)
    db.commit()
    return {"message": "Appraisal deleted successfully"}