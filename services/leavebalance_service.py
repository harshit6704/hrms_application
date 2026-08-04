from fastapi import HTTPException
from models.leavebalance_model import LeaveBalance
def add_leavebalance(leavebalance,db):

    leave_balance=db.query(LeaveBalance).filter(LeaveBalance.empid==leavebalance.empid,
                                                LeaveBalance.lvid==leavebalance.lvid).first()

    if leave_balance:
        leave_balance.opening_bal+=leavebalance.opening_bal
        db_leavebalance=leave_balance
    else:
        db_leavebalance=LeaveBalance(
        lvid=leavebalance.lvid,
        empid=leavebalance.empid,
        opening_bal=leavebalance.opening_bal,
        accured_bal=0,
        used_bal=0,
        reserved_bal=0
        )
        db.add(db_leavebalance)

    db.commit()
    db.refresh(db_leavebalance)
    return db_leavebalance

def get_leavebalance(empid,lvid,db,current_user):
    query = db.query(LeaveBalance)

    if empid is None:
        empid = current_user.empid

    elif current_user.role not in {"Admin", "HR", "Manager"}:
            raise HTTPException(
                status_code=403,
                detail="Not authorized."
            )

    if empid is not None:
        query = query.filter(LeaveBalance.empid == empid)

    if lvid is not None:
        query = query.filter(LeaveBalance.lvid == lvid)

    result = query.all()

    return [
        {
            "lbid": lb.lbid,
            "empid": lb.empid,
            "lvid": lb.lvid,
            "opening_bal": lb.opening_bal,
            "accured_bal": lb.accured_bal,
            "reserved_bal": lb.reserved_bal,
            "used_bal": lb.used_bal,
            "leave_balance": lb.opening_bal + lb.accured_bal - lb.used_bal - lb.reserved_bal
        }
        for lb in result
    ]