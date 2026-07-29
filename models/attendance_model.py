from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Float, Interval 
from sqlalchemy import Date, Time

class Attendance(Base):
    __tablename__ = "attendance"

    aid = Column(Integer, primary_key=True, index=True)
    empid = Column(Integer, ForeignKey("employees.empid"))
    date = Column(Date)
    punch_in = Column(Time)
    punch_out = Column(Time)

    hours_worked = Column(Interval)

    punch_in_photo = Column(String, nullable=True)
    punch_out_photo = Column(String, nullable=True)

    punch_in_latitude = Column(Float, nullable=True)
    punch_in_longitude = Column(Float, nullable=True)

    punch_out_latitude = Column(Float, nullable=True)
    punch_out_longitude = Column(Float, nullable=True)
    
    status = Column(String)
