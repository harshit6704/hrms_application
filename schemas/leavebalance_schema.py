from pydantic import BaseModel,ConfigDict

class LeaveBalanceBaseSchema(BaseModel):
    lvid:int
    empid:int
    
class LeaveBalanceAddSchema(LeaveBalanceBaseSchema):
    opening_bal:int
    pass

class LeaveBalanceUpdateSchema(BaseModel):
    opening_bal:int

class LeaveBalanceResponseSchema(BaseModel):
    lbid:int
    lvid:int
    empid:int
    name: str
    opening_bal:int
    accured_bal:int
    used_bal:int
    leave_balance: int

    model_config=ConfigDict(from_attributes=True)
