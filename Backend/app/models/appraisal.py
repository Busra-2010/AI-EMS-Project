from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class SentimentEnum(str, enum.Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"

class Appraisal(Base):
    __tablename__ = "appraisals"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Float, nullable=False)        # 1.0 to 5.0
    feedback = Column(String(1000), nullable=True)
    period = Column(String(50), nullable=True)    # e.g "Q1 2025"
    sentiment = Column(Enum(SentimentEnum), nullable=True)
    sentiment_score = Column(Float, nullable=True)  # confidence score

    # Which employee is being reviewed
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employee = relationship("Employee", back_populates="appraisals")