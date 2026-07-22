from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy import Date

class LeaveApplication(Base):
    __tablename__ = "leave"

    laid = Column(Integer, primary_key=True, index=True)
    lvid = Column(Integer, ForeignKey("leave_types.lvid"))
    empid = Column(Integer, ForeignKey("employees.empid"))
    start_date = Column(Date)
    end_date = Column(Date)
    reason = Column(String)
    status = Column(String)