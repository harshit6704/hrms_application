from fastapi import APIRouter, Depends
from schemas.payroll_schemas import PayrollCreateSchema,PayrollResponseSchema
from sqlalchemy.orm import Session
from database import get_db
from services.payroll_services import(generate_payroll_service,get_payroll_service)
from utils.jwt_handler import get_current_user
from models.user_model import User

router=APIRouter(prefix="/payroll")

@router.post("/generate")
def generate_payroll(payroll:PayrollCreateSchema,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    return generate_payroll_service(payroll,db,current_user)

@router.get(
    "/",
    response_model=list[PayrollResponseSchema]
)
def get_payroll(
    empid: int | None = None,
    month: int | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_payroll_service(
        empid,
        month,
        year,
        db,
        current_user
    )