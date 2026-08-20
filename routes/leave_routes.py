from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from utils.jwt_handler import require_roles
from models.user_model import User
from schemas.leavetype_schema import LeaveTypeResponseSchema,LeaveTypeCreateSchema
from services.leave_service import create_leave as create_leave_service, get_all_leaves as get_all_leaves_service, get_leave_by_id as get_leave_by_id_service


router = APIRouter(
    prefix="/leave",)

@router.get("/",response_model=list[LeaveTypeResponseSchema])
def get_all_leaves(db: Session = Depends(get_db)):
    return get_all_leaves_service(db)

@router.get("/{lvid}",response_model=LeaveTypeResponseSchema)
def get_leave_by_id(lvid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "HR")
    )):
    return get_leave_by_id_service(lvid,db)

@router.post("/",response_model=LeaveTypeResponseSchema, status_code=201)
def create_leave(leave: LeaveTypeCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "HR")
    )):
    return create_leave_service(leave,db)
