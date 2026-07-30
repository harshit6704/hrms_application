from pydantic import BaseModel,ConfigDict
from datetime import date, time

class AttendancePunchInSchema(BaseModel):
    latitude: float
    longitude: float

class AttendancePunchOutSchema(BaseModel):
    latitude: float
    longitude: float    

class AttendanceResponseSchema(BaseModel):
    empid:int
    name: str
    date: date
    punch_in: time | None
    punch_out: time | None
    hours_worked: str | None

    punch_in_latitude: float | None
    punch_in_longitude: float | None

    punch_out_latitude: float | None
    punch_out_longitude: float | None

    status: str

    model_config = ConfigDict(from_attributes=True)