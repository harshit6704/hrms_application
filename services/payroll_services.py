from fastapi import HTTPException
from models.attendance_model import Attendance
from models.employee_model import Employee
from models.leaveapplication_model import LeaveApplication
from models.payroll_model import Payroll
from models.enums import AttendanceStatus, LeaveStatus
from calendar import monthrange
from datetime import date

def generate_payroll_service(payroll,db,current_user):
    if current_user.role not  in {"Admin", "HR"}:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to generate payroll."
        )

    if not payroll.select_all and not payroll.empid:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one employee."
        )

    if payroll.select_all:
        employees=db.query(Employee).all()

    else:
        employees=(
            db.query(Employee)
            .filter(Employee.empid.in_(payroll.empid))
            .all()
            )

    generated=[]
    skipped=[]

    days_in_month = monthrange(
        payroll.year,
        payroll.month
    )[1]
    start_date = date(
        payroll.year,
        payroll.month,
        1
    )
    end_date = date(
        payroll.year,
        payroll.month,
        days_in_month
    )

    for employee in employees:
        existing=(
            db.query(Payroll)
            .filter(
                Payroll.empid == employee.empid,
                Payroll.month == payroll.month,
                Payroll.year == payroll.year
            )
            .first()
        )
        if existing:

            skipped.append({
                "empid": employee.empid,
                "name": employee.name,
                "reason": "Payroll already generated."
            })

            continue

        attendance = (
            db.query(Attendance)
            .filter(
                Attendance.empid == employee.empid,
                Attendance.date >= start_date,
                Attendance.date <= end_date
            )
            .all()
        )
        present_days = sum(
            1
            for record in attendance
            if record.status == AttendanceStatus.PRESENT.value
        )
        half_days = sum(
            1
            for record in attendance
            if record.status == AttendanceStatus.HALF_DAY.value
        )
        leave_days = 0
        approved_leaves = (
            db.query(LeaveApplication)
            .filter(
                LeaveApplication.empid == employee.empid,
                LeaveApplication.status == LeaveStatus.APPROVED.value,
                LeaveApplication.start_date <= end_date,
                LeaveApplication.end_date >= start_date
            )
            .all()
        )
        for leave in approved_leaves:

            leave_start = max(
                leave.start_date,
                start_date
            )

            leave_end = min(
                leave.end_date,
                end_date
            )

            leave_days += (
                leave_end - leave_start
            ).days + 1

        paid_days = (
            present_days
            + (half_days * 0.5)
            + leave_days
        )
        per_day_salary = (
            employee.salary / days_in_month
        )
        net_pay = round(
            paid_days * per_day_salary
        )
        db_payroll = Payroll(

            empid=employee.empid,

            month=payroll.month,
            year=payroll.year,
            gross_salary=employee.salary,
            paid_days=paid_days,

            net_pay=net_pay
        )
        db.add(db_payroll)

        generated.append({
            "empid": employee.empid,
            "name": employee.name,
            "paid_days": paid_days,
            "net_pay": net_pay
        })
        db.commit()

    return {
        "generated_count": len(generated),
        "skipped_count": len(skipped),
        "generated": generated,
        "skipped": skipped
    }

def get_payroll_service(
    empid,
    month,
    year,
    db,
    current_user
):
    query = db.query(Payroll)

    # Employee can only view own payroll
    if current_user.role == "Employee":
        empid = current_user.empid

    # Manager
    elif current_user.role == "Manager":
        employee_ids = [
            employee.empid
            for employee in db.query(Employee)
            .filter(
                Employee.reporting_manager_empid == current_user.empid
            )
            .all()
        ]

        if empid is not None:
            if empid not in employee_ids:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized."
                )
            query = query.filter(
                Payroll.empid == empid
            )

        else:
            query = query.filter(
                Payroll.empid.in_(employee_ids)
            )

    # Admin / HR
    else:
        if empid is not None:
            query = query.filter(
                Payroll.empid == empid
            )
    if month is not None:
        query = query.filter(
            Payroll.month == month
        )
    if year is not None:
        query = query.filter(
            Payroll.year == year
        )
    payrolls = query.all()
    result = []
    for payroll in payrolls:
        employee = (
            db.query(Employee)
            .filter(Employee.empid == payroll.empid)
            .first()
        )
        result.append({
            "empid": payroll.empid,
            "name": employee.name,
            "month": payroll.month,
            "year": payroll.year,
            "gross_salary": payroll.gross_salary,
            "paid_days": payroll.paid_days,
            "net_pay": payroll.net_pay
        })
    return result
    