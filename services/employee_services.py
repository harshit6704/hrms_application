from models.employee_model import Employee
from fastapi import HTTPException

def create_employee(employee,db):

    existing_employee = db.query(Employee).filter(Employee.empnumber == employee.empnumber).first()
    if existing_employee:
        raise HTTPException(status_code=400, detail="Employee with this empnumber already exists.")

    
    db_employee = Employee(
        empnumber=employee.empnumber,
        name=employee.name,
        email=employee.email,
        phone=employee.phone,
        dob=employee.dob,
        doj=employee.doj,
        salary=employee.salary,
        department=employee.department,
        shifthours=employee.shifthours
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(empid, employee, db):
    db_employee = (
        db.query(Employee)
        .filter(Employee.empid == empid)
        .first()
    )

    if not db_employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    existing_email = (
        db.query(Employee)
        .filter(
            Employee.email == employee.email,
            Employee.empid != empid
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Employee with this email already exists."
        )

    db_employee.name = employee.name
    db_employee.email = employee.email
    db_employee.phone = employee.phone
    db_employee.dob = employee.dob
    db_employee.doj = employee.doj
    db_employee.department = employee.department
    db_employee.salary = employee.salary
    db_employee.shifthours = employee.shifthours

    db.commit()
    db.refresh(db_employee)

    return db_employee

def get_all_employees(db):
    return db.query(Employee).order_by(Employee.empid).all()

def get_employee_by_id(empid, db):
    return db.query(Employee).filter(Employee.empid == empid).first()

