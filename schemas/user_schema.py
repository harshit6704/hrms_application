
from pydantic import BaseModel,ConfigDict, EmailStr


class UserBaseSchema(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: int
    empid: int
    is_active: bool
    
class UserCreateSchema(UserBaseSchema):
    pass

class UserUpdateSchema(UserBaseSchema):
    pass

class UserResponseSchema(BaseModel):
    uid: int
    email: EmailStr
    name: str
    phone: int
    empid: int

    model_config = ConfigDict(from_attributes=True)