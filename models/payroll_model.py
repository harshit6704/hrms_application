from database import Base
from sqlalchemy import Column, Integer, ForeignKey, Float

class Payroll(Base):
    __tablename__ = "payroll"

    pid = Column(Integer, primary_key=True, index=True)
    empid = Column(Integer, ForeignKey("employees.empid"))
    month = Column(Integer)
    year = Column(Integer)
    paid_days = Column(Integer)
    gross_salary=Column(Integer)
    net_pay = Column(Float)