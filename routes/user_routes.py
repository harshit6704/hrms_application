from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user_schema import UserCreateSchema, UserLoginSchema, UserResponseSchema,TokenSchema
from database import get_db
from services.user_services import create_user as create_user_service, get_all_users as get_all_users_service, login_user as login_user_service, get_user_by_id as get_user_by_id_service
from utils.jwt_handler import get_current_user, require_roles
from models.user_model import User

router=APIRouter(
    prefix="/users",
    )

@router.get("/",response_model=list[UserResponseSchema])
def get_all_users(db: Session = Depends(get_db),current_user: User = Depends(
        require_roles("Admin", "HR")
    )):
    return get_all_users_service(db)

@router.get("/{uid}",response_model=UserResponseSchema)
def get_user_by_id(uid:int,db:Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    return get_user_by_id_service(uid,db,current_user)

@router.post("/",response_model=UserResponseSchema, status_code=201)
def create_user(user: UserCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "HR")
    )):
    return create_user_service(user, db)

@router.post("/login", response_model=TokenSchema)
def login_user(user: UserLoginSchema, db: Session = Depends(get_db)):
    return login_user_service(user.email, user.password, db)
