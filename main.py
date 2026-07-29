from fastapi import FastAPI
from routes import employee_routes, user_routes,attendance_routes

app = FastAPI()

app.include_router(employee_routes.router)
app.include_router(user_routes.router)
app.include_router(attendance_routes.router)