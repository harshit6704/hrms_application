from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.employee_schema import EmployeeCreateSchema, EmployeeResponseSchema, EmployeeUpdateSchema
from services.employee_services import (
    create_employee as create_employee_service,
    get_all_employees as get_all_employees_service,
    get_employee_by_id as get_employee_by_id_service,
    update_employee as update_employee_service,
)

from utils.jwt_handler import require_roles
from models.user_model import User

router = APIRouter(
    prefix="/employees",
)

@router.get("/",response_model=list[EmployeeResponseSchema])
def get_all_employees(
                      db: Session = Depends(get_db),
                      current_user: User = Depends(require_roles("Admin","HR"))):
    return get_all_employees_service(db)

    
@router.get("/{empid}", response_model=EmployeeResponseSchema)
def get_employee_by_id(empid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "HR")
    )):
    return get_employee_by_id_service(empid, db)

@router.post("/")
def create_employee(employee: EmployeeCreateSchema,
                 db: Session = Depends(get_db),
                 current_user: User = Depends(
        require_roles("Admin", "HR")
    )):
    return create_employee_service(employee, db)

@router.put("/{empid}", response_model=EmployeeResponseSchema)
def update_employee(
    empid: int,
    employee: EmployeeUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Admin", "HR")
    ),
):
    return update_employee_service(empid, employee, db)
    