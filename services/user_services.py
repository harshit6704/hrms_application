from fastapi import HTTPException
from models.user_model import User
from models.employee_model import Employee
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token
from sqlalchemy import or_

def create_user(user, db):

    # Find the employee first
    employee = (
        db.query(Employee)
        .filter(Employee.empid == user.empid)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found with this empid."
        )

    # One user account per employee
    existing_empid = (
        db.query(User)
        .filter(User.empid == user.empid)
        .first()
    )

    if existing_empid:
        raise HTTPException(
            status_code=400,
            detail="User with this employee already exists."
        )

    # Employee's email becomes the login email
    existing_user = (
        db.query(User)
        .filter(User.email == employee.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this employee's email already exists."
        )

    db_user = User(
        empid=user.empid,
        empnumber=user.empnumber,
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hash_password(user.password),
        role=user.role.value,
        is_active=user.is_active,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def login_user(identifier, password, db):
    user = (
        db.query(User)
        .filter(
            or_(
                User.email == identifier,
                User.empnumber == identifier,
                User.phone == identifier,
            )
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive."
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password."
        )

    access_token = create_access_token(
        data={"sub": str(user.uid)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

def get_all_users(db):
    return db.query(User).all()

def get_user_by_id(uid, db, current_user):
    if current_user.role in {"Admin", "HR"}:
        user = (db.query(User)
            .filter(User.uid == uid)
            .first())

    else:
        if uid!= current_user.uid:
            raise HTTPException(
                status_code=403,
                detail="Not authorized."
            )

        user = (
            db.query(User)
            .filter(User.uid == current_user.uid)
            .first()
        )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return user