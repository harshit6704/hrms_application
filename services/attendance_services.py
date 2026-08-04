from models.attendance_model import Attendance
from datetime import date, datetime,timedelta
from fastapi import HTTPException
from models.enums import AttendanceStatus,LeaveStatus
from models.employee_model import Employee
from models.leaveapplication_model import LeaveApplication


def punch_in(punch,db,current_user):
    now = datetime.now()
    today = now.date()
    existing_attendance = db.query(Attendance).filter(Attendance.empid == current_user.empid, 
                                                      Attendance.date ==today).first()
    if existing_attendance:
        raise HTTPException (
            status_code=400, detail="Already punch in today."
        )
    db_attendance = Attendance(
    empid=current_user.empid,
    date=now.date(),
    punch_in=now.time(),
    punch_in_latitude=punch.latitude,
    punch_in_longitude=punch.longitude,
    status=AttendanceStatus.IN_PROGRESS
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance
    

def punch_out(punch,db,current_user):
    now = datetime.now()
    today = now.date()
    attendance = db.query(Attendance).filter(Attendance.empid == current_user.empid, 
                                             Attendance.date==today).first() 
    if not attendance:
        raise HTTPException (
            status_code=400, 
            detail="Please punch in first.")
    
    if attendance.punch_out is not None:
        raise HTTPException(
            status_code=400,
            detail="Already punched out today."
        )
    employee = (
        db.query(Employee)
        .filter(Employee.empid == current_user.empid)
        .first()
    )
    attendance.punch_out =now.time()
    attendance.punch_out_latitude = punch.latitude
    attendance.punch_out_longitude = punch.longitude
    attendance.hours_worked = calculate_hours_worked(
        attendance.punch_in,
        attendance.punch_out
    )
    
    attendance.status= calculate_attendance_status(
        attendance.hours_worked,
        employee.shifthours
    )
    db.commit()
    db.refresh(attendance)
    return attendance


def calculate_hours_worked(punch_in, punch_out):
     return (
        datetime.combine(date.today(), punch_out)
        - datetime.combine(date.today(), punch_in)
    )

def calculate_attendance_status(hours_worked, shift_hours):

    worked = hours_worked.total_seconds() / 3600
    shift = float(shift_hours)

    if worked >= shift:
        return AttendanceStatus.PRESENT

    elif worked >= shift/ 2:
        return AttendanceStatus.HALF_DAY

    return AttendanceStatus.ABSENT

def format_hours_worked(td):
    if td is None:
        return None

    total_seconds = int(td.total_seconds())

    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60

    return f"{hours:02}:{minutes:02}:{seconds:02}"

def get_attendance(
    db,
    current_user,
    empid=None,
    from_date=None,
    to_date=None
):
    if empid is None:
        empid = current_user.empid
    elif current_user.role not in {"Admin", "HR", "Manager"}:
        raise HTTPException (status_code=403,detail="Not Authorized")

    employee = (
        db.query(Employee)
        .filter(Employee.empid == empid)
        .first()
    )
    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )
    if from_date is None:
        from_date = date.today().replace(day=1)

    if to_date is None:
        to_date = date.today()

    attendance_records = (
        db.query(Attendance)
        .filter(
            Attendance.empid == empid,
            Attendance.date >= from_date,
            Attendance.date <= to_date
        )
        .all()
    )

    attendance_map = {
        attendance.date: attendance
        for attendance in attendance_records
    }

    approved_leaves = (
        db.query(LeaveApplication)
        .filter(
            LeaveApplication.empid == empid,
            LeaveApplication.status == LeaveStatus.APPROVED.value,
            LeaveApplication.start_date <= to_date,
            LeaveApplication.end_date >= from_date
        )
        .all()
    )

    result = []

    current = from_date

    while current <= to_date:
        if current in attendance_map:

            attendance = attendance_map[current]

            result.append({

                "empid": employee.empid,
                "name": employee.name,

                "date": attendance.date,

                "punch_in": attendance.punch_in,
                "punch_out": attendance.punch_out,

                "hours_worked": format_hours_worked(
                    attendance.hours_worked
                ),

                "punch_in_latitude": attendance.punch_in_latitude,
                "punch_in_longitude": attendance.punch_in_longitude,

                "punch_out_latitude": attendance.punch_out_latitude,
                "punch_out_longitude": attendance.punch_out_longitude,

                "status": attendance.status
            })
        else:

            leave_found = any(
                leave.start_date <= current <= leave.end_date
                for leave in approved_leaves
            )

            if leave_found:

                status = AttendanceStatus.LEAVE.value

            elif current > date.today():

                status = AttendanceStatus.NOT_MARKED.value

            else:

                status = AttendanceStatus.ABSENT.value

            result.append({

                "empid": employee.empid,
                "name": employee.name,

                "date": current,

                "punch_in": None,
                "punch_out": None,

                "hours_worked": None,

                "punch_in_latitude": None,
                "punch_in_longitude": None,

                "punch_out_latitude": None,
                "punch_out_longitude": None,

                "status": status
            })

        current += timedelta(days=1)

    return result