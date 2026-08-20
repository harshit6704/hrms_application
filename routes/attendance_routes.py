from fastapi import APIRouter, Depends
from models.user_model import User
from schemas.attendance_schema import AttendancePunchInSchema, AttendancePunchOutSchema,AttendanceResponseSchema,PunchInResponseSchema,PunchOutResponseSchema
from sqlalchemy.orm import Session
from utils.jwt_handler import get_current_user
from database import get_db
from services.attendance_services import punch_in as punch_in_service, punch_out as punch_out_service, get_attendance as get_attendance_service
from datetime import date

router=APIRouter(
    prefix="/attendance",
    )

@router.post("/punch-in",response_model=PunchInResponseSchema)
def punch_in(punch:AttendancePunchInSchema, db : Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return punch_in_service(punch,db,current_user)

@router.post("/punch-out",response_model=PunchOutResponseSchema)
def punch_out(punch:AttendancePunchOutSchema, db : Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return punch_out_service(punch,db,current_user)

@router.get("/",response_model=list[AttendanceResponseSchema])
def get_attendance(
    empid: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_attendance_service(
        db=db,
        current_user=current_user,
        empid=empid,
        from_date=from_date,
        to_date=to_date
    )
