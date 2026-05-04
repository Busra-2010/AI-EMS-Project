from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models
from app.routers import auth, department, employee, leave, attendance, payroll, appraisal, chatbot

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Employee Management System",
    description="Full-stack EMS with AI chatbot and sentiment analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-ems-project.vercel.app",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(department.router)
app.include_router(employee.router)
app.include_router(leave.router)
app.include_router(attendance.router)
app.include_router(payroll.router)
app.include_router(appraisal.router)
app.include_router(chatbot.router)

@app.get("/")
def root():
    return {"message": "EMS API is running successfully!"}