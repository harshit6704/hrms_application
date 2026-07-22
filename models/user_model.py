from database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey

class User(Base):
    __tablename__ = "users"

    uid = Column(Integer, primary_key=True, index=True)
    empid = Column(Integer, ForeignKey("employees.empid"))
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_active = Column(Boolean, default=True)