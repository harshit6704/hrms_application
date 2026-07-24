from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user_schema import UserCreateSchema, UserLoginSchema, UserResponseSchema
from database import get_db
from services.user_services import create_user as create_user_service, get_all_users as get_all_users_service, login_user as login_user_service

router=APIRouter(
    prefix="/users",
    )

@router.get("/",response_model=list[UserResponseSchema])
def get_all_users(db: Session = Depends(get_db)):
    return get_all_users_service(db)

@router.post("/",response_model=UserResponseSchema, status_code=201)
def create_user(user:UserCreateSchema, db: Session = Depends(get_db)):
    return create_user_service(user, db)

@router.post("/login", response_model=UserResponseSchema)
def login_user(user: UserLoginSchema, db: Session = Depends(get_db)):
    return login_user_service(user.email, user.password, db)
