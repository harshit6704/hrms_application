
from pydantic import BaseModel, ConfigDict


class PayrollCreateSchema(BaseModel):
    month: int
    year: int

class PayrollResponseSchema(BaseModel):
    pid: int
    empid: int
    month: int
    year: int
    paid_days: int
    net_pay: float

    model_config = ConfigDict(from_attributes=True) 