
from datetime import date, time
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
    shifthours: time

class EmployeeUpdateSchema(EmployeeBaseSchema):
    shifthours: time

class EmployeeResponseSchema(BaseModel):
    empnumber: str
    name: str
    email: EmailStr
    phone: str
    dob: date
    doj: date
    department: str
    shifthours: time

    model_config = ConfigDict(from_attributes=True)
