
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
    

class EmployeeCreateSchema(EmployeeBaseSchema):
    empnumber: str
    shifthours: float

class EmployeeUpdateSchema(EmployeeBaseSchema):
    shifthours: float

class EmployeeResponseSchema(BaseModel):
    empid: int
    empnumber: str
    name: str
    email: EmailStr
    phone: str
    dob: date
    doj: date
    department: str
    salary:int
    shifthours: float

    model_config = ConfigDict(from_attributes=True)
