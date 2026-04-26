from pydantic import BaseModel, EmailStr
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    manager = "manager"
    employee = "employee"

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.employee

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True