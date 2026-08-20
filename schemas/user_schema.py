from pydantic import BaseModel,ConfigDict, EmailStr
from models.enums import UserRole


class UserBaseSchema(BaseModel):
    email: EmailStr
    name: str
    phone: str
    empid: int
    role: UserRole
    is_active: bool
    
class UserCreateSchema(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    empid: int
    is_active: bool = True
    role: UserRole = UserRole.EMPLOYEE

class UserUpdateSchema(UserBaseSchema):
    pass

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    
class UserResponseSchema(BaseModel):
    uid: int
    empid: int
    email: EmailStr
    name: str
    phone: str
    role:UserRole

    model_config = ConfigDict(from_attributes=True)