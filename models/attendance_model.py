from database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy import Date, Time

class Attendance(Base):
    __tablename__ = "attendance"

    aid = Column(Integer, primary_key=True, index=True)
    empid = Column(Integer, ForeignKey("employees.empid"))
    date = Column(Date)
    punch_in = Column(Time)
    punch_out = Column(Time)

    worked_hours = Column(Time)

    punch_in_photo = Column(String, nullable=True)
    punch_out_photo = Column(String, nullable=True)

    punch_in_location = Column(String, nullable=True)
    punch_out_location = Column(String, nullable=True)
    status = Column(String)
