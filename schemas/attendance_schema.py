from pydantic import BaseModel

class AttendancePunchInSchema(BaseModel):
    latitude: float
    longitude: float

class AttendancePunchOutSchema(BaseModel):
    latitude: float
    longitude: float    