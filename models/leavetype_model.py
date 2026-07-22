
from database import Base
from sqlalchemy import Boolean, Integer,Column, String


class LeaveType(Base):
    __tablename__ = 'leave_types'
    lvid = Column(Integer, primary_key=True, index=True)
    lvname = Column(String)
    is_paid = Column(Boolean)
    description = Column(String)
    