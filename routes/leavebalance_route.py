from utils.jwt_handler import get_current_user,require_roles
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user_model import User
from schemas.leavebalance_schema import LeaveBalanceAddSchema,LeaveBalanceResponseSchema,LeaveBalanceUpdateSchema
from services.leavebalance_service import (
    add_leavebalance as add_leavebalance_service,
    get_leavebalance as get_leavebalance_service,
    update_leavebalance as update_leavebalance_service
)

router=APIRouter(
    prefix="/leavebalance",
)
@router.get("/",response_model=list[LeaveBalanceResponseSchema])
def get_leavebalance(empid: int | None = None,
                    lvid: int | None = None,db:Session=Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    return get_leavebalance_service(empid,lvid,db,current_user)

@router.post("/")
def add_leavebalance(leavebalance: LeaveBalanceAddSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "HR"))):
    return add_leavebalance_service(leavebalance,db)

@router.put("/{lbid}", response_model=LeaveBalanceResponseSchema)
def update_leavebalance(
    lbid: int,
    leavebalance: LeaveBalanceUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "HR")
    )
):
    return update_leavebalance_service(
        lbid,
        leavebalance,
        db
    )