from fastapi import FastAPI
from routes import employee_routes

app = FastAPI()

app.include_router(employee_routes.router)
