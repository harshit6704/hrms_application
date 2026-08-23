from models.employee_model import Employee
from fastapi import HTTPException, UploadFile
import csv
import io

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

def upload_employees_csv(file: UploadFile, db):
    required_columns = {
        "empnumber",
        "name",
        "email",
        "phone",
        "dob",
        "doj",
        "department",
        "salary",
        "shifthours",
    }

    try:
        content = file.file.read().decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="CSV must be UTF-8 encoded."
        )

    reader = csv.DictReader(io.StringIO(content))

    if not reader.fieldnames:
        raise HTTPException(
            status_code=400,
            detail="CSV file is empty or has no header row."
        )

    headers = {
        header.strip()
        for header in reader.fieldnames
        if header and header.strip()
    }

    missing = sorted(required_columns - headers)

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required CSV columns: {', '.join(missing)}"
        )

    rows = list(reader)

    if not rows:
        raise HTTPException(
            status_code=400,
            detail="CSV contains no employee records."
        )

    existing_empnumbers = {
        value[0]
        for value in db.query(Employee.empnumber).all()
    }

    existing_emails = {
        value[0].lower()
        for value in db.query(Employee.email).all()
        if value[0]
    }

    seen_empnumbers = set()
    seen_emails = set()
    errors = []
    employees_to_create = []

    for row_number, row in enumerate(rows, start=2):
        values = {
            key.strip(): (value.strip() if value is not None else "")
            for key, value in row.items()
            if key
        }

        missing_values = [
            column
            for column in required_columns
            if not values.get(column)
        ]

        if missing_values:
            errors.append(
                f"Row {row_number}: missing {', '.join(sorted(missing_values))}."
            )
            continue

        empnumber = values["empnumber"]
        email = values["email"].lower()

        if empnumber in existing_empnumbers or empnumber in seen_empnumbers:
            errors.append(
                f"Row {row_number}: employee number '{empnumber}' already exists."
            )
            continue

        if email in existing_emails or email in seen_emails:
            errors.append(
                f"Row {row_number}: email '{values['email']}' already exists."
            )
            continue

        try:
            salary = int(values["salary"])
            shifthours = float(values["shifthours"])
        except ValueError:
            errors.append(
                f"Row {row_number}: salary must be an integer and shifthours must be a number."
            )
            continue

        if salary < 0:
            errors.append(
                f"Row {row_number}: salary cannot be negative."
            )
            continue

        if shifthours < 0 or shifthours > 24:
            errors.append(
                f"Row {row_number}: shifthours must be between 0 and 24."
            )
            continue

        # The current Employee model stores dob/doj as strings,
        # so keep the CSV values in YYYY-MM-DD form as provided.
        employees_to_create.append(
            Employee(
                empnumber=empnumber,
                name=values["name"],
                email=values["email"],
                phone=values["phone"],
                dob=values["dob"],
                doj=values["doj"],
                department=values["department"],
                salary=salary,
                shifthours=shifthours,
            )
        )

        seen_empnumbers.add(empnumber)
        seen_emails.add(email)

    if errors:
        raise HTTPException(
            status_code=400,
            detail="CSV validation failed. No employees were imported.\n" + "\n".join(errors)
        )

    db.add_all(employees_to_create)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Employees could not be imported. Please check the CSV data and try again."
        )

    return {
        "message": "Employees imported successfully.",
        "created_count": len(employees_to_create),
    }
