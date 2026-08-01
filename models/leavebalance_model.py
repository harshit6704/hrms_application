from database import Base
from sqlalchemy import Column, Integer, ForeignKey, String

class LeaveBalance(Base):
    __tablename__ = "leave_balance"

    lbid = Column(Integer, primary_key=True, index=True)
    lvid = Column(Integer, ForeignKey("leave_types.lvid"))
    empid = Column(Integer, ForeignKey("employees.empid"))
    opening_bal= Column(Integer,default=0)
    accured_bal=Column(Integer,default=0)
    used_bal = Column(Integer,default=0)
    
