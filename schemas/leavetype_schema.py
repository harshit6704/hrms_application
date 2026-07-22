from pydantic import BaseModel, ConfigDict

class LeaveTypeBaseSchema(BaseModel):
    lvname: str
    is_paid: bool
    description: str

class LeaveTypeCreateSchema(LeaveTypeBaseSchema):
    pass

class LeaveTypeUpdateSchema(LeaveTypeBaseSchema):
    pass

class LeaveTypeResponseSchema(BaseModel):
    lvid: int
    lvname: str
    is_paid: bool
    description: str

    model_config = ConfigDict(from_attributes=True)
