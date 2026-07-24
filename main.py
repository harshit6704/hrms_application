from fastapi import FastAPI
from routes import employee_routes, user_routes

app = FastAPI()

app.include_router(employee_routes.router)
app.include_router(user_routes.router)