from models.employee_model import Employee


def create_employee(employee,db):
    db_employee = Employee(
        empnumber=employee.empnumber,
        name=employee.name,
        email=employee.email,
        phone=employee.phone,
        dob=employee.dob,
        doj=employee.doj,
        department=employee.department,
        shifthours=employee.shifthours
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def get_all_employees(db):
    return db.query(Employee).all()

def get_employee_by_id(empid, db):
    return db.query(Employee).filter(Employee.empid == empid).first()

