from sqlalchemy import Column, Integer, String
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    empid = Column(Integer, primary_key=True, index=True)
    empnumber = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(Integer)
    doj = Column(String)
    dob = Column(String)
    department = Column(String)
    salary = Column(Integer)