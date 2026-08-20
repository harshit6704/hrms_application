import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

import EmployeeList from "./pages/employees/EmployeeList.jsx";
import EmployeeCreate from "./pages/employees/EmployeeCreate.jsx";
import EmployeeDetails from "./pages/employees/EmployeeDetails.jsx";
import EmployeeEdit from "./pages/employees/EmployeeEdit.jsx";

import PunchClock from "./pages/attendance/PunchClock.jsx";
import AttendanceReport from "./pages/attendance/AttendanceReport.jsx";

import LeaveApply from "./pages/leave/LeaveApply.jsx";
import LeaveRequests from "./pages/leave/LeaveRequests.jsx";
import LeaveTypes from "./pages/leave/LeaveTypes.jsx";
import LeaveBalance from "./pages/leave/LeaveBalance.jsx";

import Payroll from "./pages/payroll/Payroll.jsx";

import UserList from "./pages/users/UserList.jsx";
import UserCreate from "./pages/users/UserCreate.jsx";

import RoleGuard from "./components/RoleGuard.jsx";
import { ROLES } from "./utils/roles.js";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />

        <Route path="/employees" element=
        {<RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
          <EmployeeList />
          </RoleGuard>
        }/>
        <Route path="/employees/create" element=
        {<RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
        <EmployeeCreate />
        </RoleGuard>} />
        <Route path="/employees/:empid" element=
        {<RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
        <EmployeeDetails />
        </RoleGuard>}/>
        <Route path="/employees/:empid/edit" element=
        {<RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
        <EmployeeEdit />
        </RoleGuard>} />

        <Route path="/users" element=
        {<RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
        <UserList />
        </RoleGuard>} />
        <Route path="/users/create" element=
        {<RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
        <UserCreate />
        </RoleGuard>} />
        
        <Route path="/attendance" element={<PunchClock />} />
        <Route path="/attendance/report" element={<AttendanceReport />} />

        <Route path="/leave" element={<LeaveApply />} />
        <Route path="/leave/requests" element=
        {<RoleGuard
        roles={[
        ROLES.ADMIN,
        ROLES.HR,
        ROLES.MANAGER,
        ]}
        >
        <LeaveRequests />
        </RoleGuard>} />
        <Route path="/leave/types" element=
        {<RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
        <LeaveTypes />
        </RoleGuard>} />
        <Route path="/leave/balance" element={<LeaveBalance />} />

        <Route path="/payroll" element={<Payroll />} />

      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
