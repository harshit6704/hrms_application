from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.employee_schema import EmployeeCreateSchema, EmployeeResponseSchema
from services.employee_services import create_employee as create_employee_service, get_employee_by_id
from services.employee_services import get_all_employees as get_all_employees_service
from services.employee_services import get_employee_by_id as get_employee_by_id_service

router = APIRouter(
    prefix="/employees",
)

@router.get("/",response_model=list[EmployeeResponseSchema])
def get_all_employees(
                      db: Session = Depends(get_db)):
    return get_all_employees_service(db)

    
@router.get("/{empid}", response_model=EmployeeResponseSchema)
def get_employee_by_id(empid: int, db: Session = Depends(get_db)):
    return get_employee_by_id_service(empid, db)

@router.post("/")
def create_employee(employee: EmployeeCreateSchema,
                 db: Session = Depends(get_db)):
    return create_employee_service(employee, db)
    