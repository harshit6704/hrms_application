from database import Base
from sqlalchemy import Column, Integer, ForeignKey, String

class LeaveBalance(Base):
    __tablename__ = "leave_balance"

    lbid = Column(Integer, primary_key=True, index=True)
    lvid = Column(Integer, ForeignKey("leave_types.lvid"))
    empid = Column(Integer, ForeignKey("employees.empid"))
    start_bal= Column(Integer)
    used_bal = Column(Integer)
    leave_balance = Column(Integer)
