from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.leavebalance_schema import LeaveBalanceAddSchema,LeaveBalanceResponseSchema,LeaveBalanceBaseSchema
from services.leavebalance_service import add_leavebalance as add_leavebalance_service, get_leavebalance as get_leavebalance_service

router=APIRouter(
    prefix="/leavebalance",
)
@router.get("/",response_model=list[LeaveBalanceResponseSchema])
def get_leavebalance(empid: Optional[int] = None,
                    lvid: Optional[int] = None,db:Session=Depends(get_db)):
    return get_leavebalance_service(empid,lvid,db)

@router.post("/")
def add_leavebalance(leavebalance:LeaveBalanceAddSchema, db:Session=Depends(get_db)):
    return add_leavebalance_service(leavebalance,db)