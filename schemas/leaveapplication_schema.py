from datetime import date
from pydantic import BaseModel,ConfigDict


class LeaveApplicationBaseSchema(BaseModel):
    empid: int | None = None
    lvid: int
    start_date: date
    end_date: date
    reason: str

class LeaveApplicationCreateSchema(LeaveApplicationBaseSchema):
    pass

class LeaveApplicationUpdateSchema(LeaveApplicationBaseSchema):
    pass

class LeaveApplicationApprovalSchema(BaseModel):
    status: str
    remarks: str

class LeaveApplicationResponseSchema(BaseModel):
    lvid: int
    empid: int
    name:str
    start_date: date
    end_date: date
    reason: str
    status: str
    remarks: str | None = None

    model_config = ConfigDict(from_attributes=True)