from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import employee_routes, user_routes,attendance_routes,leave_routes,leavebalance_route,leaveapplication_route,payroll_routes

app = FastAPI()

app.include_router(employee_routes.router)
app.include_router(user_routes.router)
app.include_router(attendance_routes.router)
app.include_router(leave_routes.router)
app.include_router(leavebalance_route.router)
app.include_router(leaveapplication_route.router)
app.include_router(payroll_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)