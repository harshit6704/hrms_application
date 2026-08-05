
from pydantic import BaseModel, ConfigDict


class PayrollCreateSchema(BaseModel):
    empid:list[int]
    month: int
    year: int
    select_all: bool

class PayrollResponseSchema(BaseModel):
    empid: int
    name :str
    month: int
    year: int
    paid_days: int
    gross_salary:int
    net_pay: float

    model_config = ConfigDict(from_attributes=True) 