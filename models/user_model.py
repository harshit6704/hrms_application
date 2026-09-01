from database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from models.enums import UserRole

class User(Base):
    __tablename__ = "users"

    uid = Column(Integer, primary_key=True, index=True)
    empid = Column(Integer, ForeignKey("employees.empid"))
    empnumber = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String,unique=True, index=True)
    password = Column(String)
    role = Column(String, nullable=False,default=UserRole.EMPLOYEE.value)
    is_active = Column(Boolean, default=True)