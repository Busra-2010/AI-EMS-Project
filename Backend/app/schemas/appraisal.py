from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class SentimentEnum(str, Enum):
    positive = "positive"
    negative = "negative"
    neutral  = "neutral"

class AppraisalCreate(BaseModel):
    employee_id: int
    rating: float = Field(..., ge=1.0, le=5.0)  # must be between 1 and 5
    feedback: Optional[str] = None
    period: Optional[str] = None   # e.g. "Q1 2024"

class AppraisalUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    feedback: Optional[str] = None
    period: Optional[str] = None

class AppraisalResponse(BaseModel):
    id: int
    employee_id: int
    rating: float
    feedback: Optional[str] = None
    period: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None

    class Config:
        from_attributes = True