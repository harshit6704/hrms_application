from models.leaveapplication_model import LeaveApplication
from models.leavebalance_model import LeaveBalance
from models.enums import LeaveStatus, AttendanceStatus
from models.employee_model import Employee
from models.attendance_model import Attendance
from fastapi import HTTPException
from datetime import timedelta, date

def create_leave_service(leave, db, current_user):

    if leave.empid is None:
        leave.empid = current_user.empid

    elif current_user.role not in {"Admin", "HR", "Manager"}:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to apply leave for another employee."
        )

    if leave.start_date > leave.end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date."
        )

    existing_leave = (
        db.query(LeaveApplication)
        .filter(
            LeaveApplication.empid == leave.empid,
            LeaveApplication.status.in_(
                [
                    LeaveStatus.PENDING.value,
                    LeaveStatus.APPROVED.value
                ]
            ),
            LeaveApplication.start_date <= leave.end_date,
            LeaveApplication.end_date >= leave.start_date
        )
        .first()
    )

    if existing_leave:
        raise HTTPException(
            status_code=400,
            detail="An approved or pending leave already exists during the selected period."
        )

    current = leave.start_date

    while current <= leave.end_date:

    # Only check past and current dates
        if current <= date.today():

            attendance = (
                db.query(Attendance)
                .filter(
                    Attendance.empid == leave.empid,
                    Attendance.date == current
                )
                .first()
            )

            if attendance and attendance.status in {
            AttendanceStatus.PRESENT.value,
            AttendanceStatus.HALF_DAY.value,
            AttendanceStatus.IN_PROGRESS.value
            }:
                raise HTTPException(
                status_code=400,
                detail=f"Attendance already exists for {current}. Leave cannot be applied."
                )

        current += timedelta(days=1)

    leave_balance = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.empid == leave.empid,
            LeaveBalance.lvid == leave.lvid
        )
        .first()
    )

    if leave_balance is None:
        raise HTTPException(
            status_code=404,
            detail="Leave balance not found."
        )

    available_balance = (
        leave_balance.opening_bal
        + leave_balance.accured_bal
        - leave_balance.used_bal
        - leave_balance.reserved_bal
    )

    leave_days = (
        leave.end_date - leave.start_date
    ).days + 1

    if leave_days > available_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient leave balance."
        )

    new_leave = LeaveApplication(
        empid=leave.empid,
        lvid=leave.lvid,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        status=LeaveStatus.PENDING.value
    )

    db.add(new_leave)
    leave_balance.reserved_bal += leave_days
    db.commit()
    db.refresh(new_leave)

    employee = (
        db.query(Employee)
        .filter(Employee.empid == new_leave.empid)
        .first()
    )

    return {
        "laid": new_leave.laid,
        "empid": new_leave.empid,
        "lvid": new_leave.lvid,
        "name": employee.name,
        "start_date": new_leave.start_date,
        "end_date": new_leave.end_date,
        "reason": new_leave.reason,
        "status": new_leave.status,
        "remarks": getattr(new_leave, "remarks", None)
    }

def update_leave_service(
    laid,
    leave,
    db,
    current_user
):

    application = (
        db.query(LeaveApplication)
        .filter(LeaveApplication.laid == laid)
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Leave application not found."
        )

    if application.status != LeaveStatus.PENDING.value:
        raise HTTPException(
            status_code=400,
            detail="Only pending leave can be updated."
        )

    if current_user.role in {"Admin", "HR"}:
        pass

    elif current_user.role == "Manager":

        employee = (
            db.query(Employee)
            .filter(Employee.empid == application.empid)
            .first()
        )

        if employee.reporting_manager_empid != current_user.empid:
            raise HTTPException(
                status_code=403,
                detail="Not authorized."
            )

    else:

        if application.empid != current_user.empid:
            raise HTTPException(
                status_code=403,
                detail="Not authorized."
            )

    if leave.start_date > leave.end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date."

        )
    if leave.lvid != application.lvid:
        raise HTTPException(
        status_code=400,
        detail="Leave type cannot be changed. Please cancel the application and apply again."
    )
    overlap = (
        db.query(LeaveApplication)
        .filter(
            LeaveApplication.empid == application.empid,
            LeaveApplication.laid != laid,
            LeaveApplication.status.in_(
                [
                    LeaveStatus.PENDING.value,
                    LeaveStatus.APPROVED.value
                ]
            ),
            LeaveApplication.start_date <= leave.end_date,
            LeaveApplication.end_date >= leave.start_date
        )
        .first()
    )

    if overlap:
        raise HTTPException(
            status_code=400,
            detail="Leave overlaps with another leave application."
        )

    current = leave.start_date

    while current <= leave.end_date:

        if current <= date.today():

            attendance = (
            db.query(Attendance)
            .filter(
                Attendance.empid == application.empid,
                Attendance.date == current
            )
            .first()
        )

        if attendance and attendance.status in {
            AttendanceStatus.PRESENT.value,
            AttendanceStatus.HALF_DAY.value,
            AttendanceStatus.IN_PROGRESS.value
        }:
            raise HTTPException(
                status_code=400,
                detail=f"Attendance already exists for {current}. Leave cannot be updated."
            )

        current += timedelta(days=1)

    leave_balance = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.empid == application.empid,
            LeaveBalance.lvid == leave.lvid
        )
        .first()
    )

    if leave_balance is None:
        raise HTTPException(
            status_code=404,
            detail="Leave balance not found."
        )
    
    old_leave_days = (
        application.end_date - application.start_date
    ).days + 1

    new_leave_days = (
        leave.end_date - leave.start_date
    ).days + 1

    leave_balance.reserved_bal -= old_leave_days

    available_balance = (
        leave_balance.opening_bal
        + leave_balance.accured_bal
        - leave_balance.used_bal
        - leave_balance.reserved_bal
    )

    if new_leave_days > available_balance:

        # Restore reservation before raising exception
        leave_balance.reserved_bal += old_leave_days

        raise HTTPException(
            status_code=400,
            detail="Insufficient leave balance."
        )

    leave_balance.reserved_bal += new_leave_days

    application.start_date = leave.start_date
    application.end_date = leave.end_date
    application.reason = leave.reason

    db.commit()
    db.refresh(application)

    employee = (
        db.query(Employee)
        .filter(Employee.empid == application.empid)
        .first()
    )

    return {
        "laid": application.laid,
        "empid": application.empid,
        "lvid": application.lvid,
        "name": employee.name,
        "start_date": application.start_date,
        "end_date": application.end_date,
        "reason": application.reason,
        "status": application.status,
        "remarks": getattr(application, "remarks", None)
    }

def approve_leave_service(laid, approval, db, current_user):

    leave = (
        db.query(LeaveApplication)
        .filter(LeaveApplication.laid == laid)
        .first()
    )
    employee = (
                db.query(Employee)
                .filter(Employee.empid == leave.empid)
                .first()
            )
    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave application not found."
        )

    # Only HR/Admin/Manager
    if current_user.role not in {"Admin", "HR", "Manager"}:
        raise HTTPException(
            status_code=403,
            detail="Not authorized."
        )

    # Manager can approve only reporting employees
    if current_user.role == "Manager":

        if employee.reporting_manager_empid != current_user.empid:
            raise HTTPException(
                status_code=403,
                detail="Not authorized."
            )

    if leave.status != LeaveStatus.PENDING.value:
        raise HTTPException(
            status_code=400,
            detail="Only pending leave can be approved or rejected."
        )

    if approval.status not in {
        LeaveStatus.APPROVED.value,
        LeaveStatus.REJECTED.value
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid status."
        )

    balance = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.empid == leave.empid,
            LeaveBalance.lvid == leave.lvid
        )
        .first()
    )

    if balance is None:
        raise HTTPException(
            status_code=404,
            detail="Leave balance not found."
        )

    leave_days = (
        leave.end_date - leave.start_date
    ).days + 1

    if approval.status == LeaveStatus.APPROVED.value:

        balance.reserved_bal -= leave_days
        balance.used_bal += leave_days
    
    else:

        balance.reserved_bal = max(
        0,
        balance.reserved_bal - leave_days
        )

    leave.status = approval.status
    leave.remarks = approval.remarks

    db.commit()
    db.refresh(leave)

    return {
    "laid": leave.laid,
    "empid": leave.empid,
    "lvid": leave.lvid,
    "name": employee.name,
    "start_date": leave.start_date,
    "end_date": leave.end_date,
    "reason": leave.reason,
    "status": leave.status,
    "remarks": leave.remarks
}

    
def get_leave_applications_service(
    empid,
    lvid,
    status,
    from_date,
    to_date,
    db,
    current_user
):

    query = db.query(LeaveApplication)

    # Employee
    if current_user.role == "Employee":
        query = query.filter(
            LeaveApplication.empid == current_user.empid
        )

    # Manager
    elif current_user.role == "Manager":

        employee_ids = (
            db.query(Employee.empid)
            .filter(
                Employee.reporting_manager_empid == current_user.empid
            )
            .all()
        )

        employee_ids = [e[0] for e in employee_ids]

        if empid is not None:

            if empid not in employee_ids:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized."
                )

            query = query.filter(
                LeaveApplication.empid == empid
            )

        else:

            query = query.filter(
                LeaveApplication.empid.in_(employee_ids)
            )

    # HR/Admin
    else:

        if empid is not None:
            query = query.filter(
                LeaveApplication.empid == empid
            )

    if lvid is not None:
        query = query.filter(
            LeaveApplication.lvid == lvid
        )

    if status is not None:
        query = query.filter(
            LeaveApplication.status == status
        )

    if from_date is not None:
        query = query.filter(
            LeaveApplication.start_date >= from_date
        )

    if to_date is not None:
        query = query.filter(
            LeaveApplication.end_date <= to_date
        )

    leaves = query.all()

    result = []

    for leave in leaves:

        employee = (
        db.query(Employee)
        .filter(Employee.empid == leave.empid)
        .first()
    )

        result.append({
        "laid": leave.laid,
        "empid": leave.empid,
        "lvid": leave.lvid,
        "name": employee.name,
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "reason": leave.reason,
        "status": leave.status,
        "remarks": leave.remarks,
    })

    return result

def get_leave_application_by_id_service(
    laid,
    db,
    current_user
):

    leave = (
        db.query(LeaveApplication)
        .filter(
            LeaveApplication.laid == laid
        )
        .first()
    )

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave application not found."
        )
    employee = (
                db.query(Employee)
                .filter(
                    Employee.empid == leave.empid
                )
                .first()
            )
    # Employee
    if current_user.role == "Employee":

        if leave.empid != current_user.empid:
            raise HTTPException(
                status_code=403,
                detail="Not authorized."
            )

    # Manager
    elif current_user.role == "Manager":

        if employee.reporting_manager_empid != current_user.empid:
            raise HTTPException(
                status_code=403,
                detail="Not authorized."
            )

    return {
    "laid": leave.laid,
    "empid": leave.empid,
    "lvid": leave.lvid,
    "name": employee.name,
    "start_date": leave.start_date,
    "end_date": leave.end_date,
    "reason": leave.reason,
    "status": leave.status,
    "remarks": leave.remarks
}