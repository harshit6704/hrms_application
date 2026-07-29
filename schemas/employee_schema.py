
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
    empnumber: str
    shifthours: float

class EmployeeUpdateSchema(EmployeeBaseSchema):
    shifthours: float

class EmployeeResponseSchema(BaseModel):
    empnumber: str
    name: str
    email: EmailStr
    phone: str
    dob: date
    doj: date
    department: str
    shifthours: float

    model_config = ConfigDict(from_attributes=True)
