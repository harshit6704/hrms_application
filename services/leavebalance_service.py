from fastapi import HTTPException
from models.leavebalance_model import LeaveBalance
from models.employee_model import Employee
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

def update_leavebalance(lbid, leavebalance, db):
    db_leavebalance = (
        db.query(LeaveBalance)
        .filter(LeaveBalance.lbid == lbid)
        .first()
    )

    if not db_leavebalance:
        raise HTTPException(
            status_code=404,
            detail="Leave balance not found."
        )

    db_leavebalance.opening_bal = leavebalance.opening_bal

    db.commit()
    db.refresh(db_leavebalance)

    return {
        "lbid": db_leavebalance.lbid,
        "empid": db_leavebalance.empid,
        "lvid": db_leavebalance.lvid,
        "opening_bal": db_leavebalance.opening_bal,
        "accured_bal": db_leavebalance.accured_bal,
        "reserved_bal": db_leavebalance.reserved_bal,
        "used_bal": db_leavebalance.used_bal,
        "leave_balance": (
            db_leavebalance.opening_bal
            + db_leavebalance.accured_bal
            - db_leavebalance.used_bal
            - db_leavebalance.reserved_bal
        )
    }

def get_leavebalance(
    empid,
    lvid,
    db,
    current_user
):

    query = db.query(
        LeaveBalance,
        Employee.name
    ).join(
        Employee,
        Employee.empid == LeaveBalance.empid
    )

    # Employee
    if current_user.role == "Employee":

        query = query.filter(
            LeaveBalance.empid == current_user.empid
        )

    # Manager
    elif current_user.role == "Manager":

        if empid is None:
            empid = current_user.empid

        query = query.filter(
            LeaveBalance.empid == empid
        )

    # Admin / HR
    elif current_user.role in {"Admin", "HR"}:

        if empid is not None:
            query = query.filter(
                LeaveBalance.empid == empid
            )

    else:

        raise HTTPException(
            status_code=403,
            detail="Not authorized."
        )

    # Leave type filter
    if lvid is not None:

        query = query.filter(
            LeaveBalance.lvid == lvid
        )

    result = query.all()

    return [
        {
            "lbid": lb.lbid,
            "empid": lb.empid,
            "name": employee_name,
            "lvid": lb.lvid,
            "opening_bal": lb.opening_bal,
            "accured_bal": lb.accured_bal,
            "reserved_bal": lb.reserved_bal,
            "used_bal": lb.used_bal,
            "leave_balance": (
                lb.opening_bal
                + lb.accured_bal
                - lb.used_bal
                - lb.reserved_bal
            )
        }
        for lb, employee_name in result]