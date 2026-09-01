export const endpoints = {
  users: {
    login: "/users/login", // POST { email, password } -> { access_token, token_type }
    list: "/users/", // GET -> UserResponseSchema[]
    create: "/users/", // POST UserCreateSchema -> UserResponseSchema
    byId: (uid) => `/users/${uid}`, // GET -> UserResponseSchema
  },
  employees: {
    list: "/employees/", // GET -> EmployeeResponseSchema[]
    selectable: "/employees/selectable",
    create: "/employees/", // POST EmployeeCreateSchema -> raw Employee (no response_model)
    byId: (empid) => `/employees/${empid}`, // GET -> EmployeeResponseSchema
    update: (empid) => `/employees/${empid}`,
    uploadCsv: "/employees/upload-csv",
  },
  attendance: {
    punchIn: "/attendance/punch-in", // POST { latitude, longitude } -> raw Attendance (no response_model)
    punchOut: "/attendance/punch-out", // POST { latitude, longitude } -> raw Attendance (no response_model)
    list: "/attendance/", // GET ?empid&from_date&to_date -> AttendanceResponseSchema[]
  },
  leaveTypes: {
    // These are LEAVE TYPES (e.g. "Sick Leave"), from routes/leave_routes.py -> prefix "/leave"
    list: "/leave/", // GET -> LeaveTypeResponseSchema[]
    byId: (lvid) => `/leave/${lvid}`, // GET -> LeaveTypeResponseSchema
    create: "/leave/", // POST LeaveTypeCreateSchema -> LeaveTypeResponseSchema
  },
  leaveApplications: {
    list: "/leaveapplication/", // GET ?empid&lvid&status&from_date&to_date -> LeaveApplicationResponseSchema[]
    byId: (laid) => `/leaveapplication/${laid}`, // GET -> LeaveApplicationResponseSchema
    create: "/leaveapplication/", // POST LeaveApplicationCreateSchema -> LeaveApplicationResponseSchema
    update: (laid) => `/leaveapplication/${laid}`, // PUT LeaveApplicationUpdateSchema -> LeaveApplicationResponseSchema
    approval: (laid) => `/leaveapplication/${laid}/approval`, // PUT LeaveApplicationApprovalSchema -> LeaveApplicationResponseSchema
  },
  leaveBalance: {
    list: "/leavebalance/", // GET ?empid&lvid -> LeaveBalanceResponseSchema[]
    add: "/leavebalance/",
    update: (lbid) => `/leavebalance/${lbid}`, // POST LeaveBalanceAddSchema -> raw LeaveBalance (no response_model)
  },
  payroll: {
    generate: "/payroll/generate", // POST PayrollCreateSchema -> custom summary dict
    list: "/payroll/", // GET ?empid&month&year -> PayrollResponseSchema[]
  },
};
