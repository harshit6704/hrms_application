
from datetime import date
from pydantic import BaseModel, EmailStr,ConfigDict

class EmployeeBaseSchema(BaseModel):
    name: str
    email: EmailStr
    phone: str
    dob: date
    doj: date
    department: str
    salary: int
    is_active: bool


class EmployeeCreateSchema(EmployeeBaseSchema):
    empnumber: int

class EmployeeUpdateSchema(EmployeeBaseSchema):
    pass

class EmployeeResponseSchema(BaseModel):
    empnumber: str
    name: str
    email: EmailStr
    phone: str
    dob: date
    doj: date
    department: str
    
    model_config = ConfigDict(from_attributes=True)
