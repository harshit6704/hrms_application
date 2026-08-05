from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from utils.jwt_handler import get_current_user
from models.user_model import User
from datetime import date

from schemas.leaveapplication_schema import (
    LeaveApplicationCreateSchema,
    LeaveApplicationUpdateSchema,
    LeaveApplicationApprovalSchema,
    LeaveApplicationResponseSchema,
)

from services.leaveapplication_service import (
    create_leave_service,
    update_leave_service,
    approve_leave_service,
    get_leave_applications_service,
    get_leave_application_by_id_service,
)
router=APIRouter(prefix="/leaveapplication")


@router.post("/",response_model=LeaveApplicationResponseSchema)
def create_leave(leave:LeaveApplicationCreateSchema,db:Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return create_leave_service(leave,db,current_user)

@router.put("/{laid}", response_model=LeaveApplicationResponseSchema)
def update_leave(
    laid: int,
    leave: LeaveApplicationUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_leave_service(
        laid=laid,
        leave=leave,
        db=db,
        current_user=current_user,
    )

@router.put("/{laid}/approval", response_model=LeaveApplicationResponseSchema)
def approve_leave(
    laid: int,
    approval: LeaveApplicationApprovalSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return approve_leave_service(
        laid=laid,
        approval=approval,
        db=db,
        current_user=current_user,
    )

@router.get("/", response_model=list[LeaveApplicationResponseSchema])
def get_leave_applications(
    empid: int | None = None,
    lvid: int | None = None,
    status: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_leave_applications_service(
        empid=empid,
        lvid=lvid,
        status=status,
        from_date=from_date,
        to_date=to_date,
        db=db,
        current_user=current_user,
    )

@router.get("/{laid}", response_model=LeaveApplicationResponseSchema)
def get_leave_application(
    laid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_leave_application_by_id_service(
        laid=laid,
        db=db,
        current_user=current_user,
    )