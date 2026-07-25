from http.client import HTTPException
from models.user_model import User
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token

def create_user(user, db):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    existing_empid = db.query(User).filter(User.empid == user.empid).first()
    if existing_empid:
        raise HTTPException(status_code=400, detail="User with this empid already exists.")

    db_user = User(
        email=user.email,
        password=hash_password(user.password),
        name=user.name,
        phone=user.phone,
        empid=user.empid,
        is_active=user.is_active

    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def login_user(email, password, db):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password.")
    access_token = create_access_token(
        data ={"sub": str(user.uid)}
    )
    return {
        "access_token": access_token,
        "token_type":"bearer"
    }

def get_all_users(db):
    return db.query(User).all()
