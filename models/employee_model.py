from sqlalchemy import Column, Integer, String, Numeric
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    empid = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    empnumber = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    doj = Column(String)
    dob = Column(String)
    department = Column(String)
    salary = Column(Integer)
    reporting_manager_empid=Column(Integer)
    shifthours = Column(Numeric(4,2))
