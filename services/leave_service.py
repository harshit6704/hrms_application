from models.leavetype_model import LeaveType
from fastapi import HTTPException

def create_leave(leave,db):
    leave_type=db.query(LeaveType).filter(LeaveType.lvname==leave.lvname).first()
    if leave_type:
        raise HTTPException(status_code=400, detail="Leave already exists.")

    db_leave=LeaveType(
        lvname=leave.lvname,
        is_paid=leave.is_paid,
        description=leave.description
    )
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

def get_all_leaves(db):
    return db.query(LeaveType).all()

def get_leave_by_id(lvid, db):
    return db.query(LeaveType).filter(LeaveType.lvid == lvid).first()