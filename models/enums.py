from enum import Enum

class UserRole(str, Enum):
    ADMIN = "Admin"
    HR = "HR"
    MANAGER = "Manager"
    EMPLOYEE = "Employee"

class AttendanceStatus(str, Enum):
    IN_PROGRESS = "In Progress"
    PRESENT = "Present"
    ABSENT = "Absent"
    HALF_DAY = "Half Day"
    LEAVE = "Leave"
    NOT_MARKED = "Not Marked"
    HOLIDAY = "Holiday"
    WEEK_OFF = "Week Off"

class LeaveStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    CANCELLED = "Cancelled"