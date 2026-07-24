
from pydantic import BaseModel,ConfigDict, EmailStr


class UserBaseSchema(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    empid: int
    is_active: bool
    
class UserCreateSchema(UserBaseSchema):
    pass

class UserUpdateSchema(UserBaseSchema):
    pass

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str
    
class UserResponseSchema(BaseModel):
    uid: int
    empid: int
    email: EmailStr
    name: str
    phone: str

    model_config = ConfigDict(from_attributes=True)