
from pydantic import BaseModel,ConfigDict


class LeaveApplicationBaseSchema(BaseModel):
    lvid: str
    start_date: str
    end_date: str
    reason: str

class LeaveApplicationCreateSchema(LeaveApplicationBaseSchema):
    pass

class LeaveApplicationUpdateSchema(LeaveApplicationBaseSchema):
    pass

class LeaveApplicationApprovalSchema(BaseModel):
    status: str
    remarks: str

class LeaveApplicationResponseSchema(BaseModel):
    laid: int
    lvid: str
    empid: str
    start_date: str
    end_date: str
    reason: str
    status: str
    remarks: str

    model_config = ConfigDict(from_attributes=True)