import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLES, hasRole } from "../utils/roles.js";

const links = [
  {
    to: "/",
    label: "Dashboard",
    end: true,
  },
  {
    to: "/attendance",
    label: "Punch Clock",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.EMPLOYEE,
    ],
  },
  {
    to: "/attendance/report",
    label: "Attendance Report",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.EMPLOYEE,
    ],
  },
  {
    to: "/leave",
    label: "My Leave",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.EMPLOYEE,
    ],
  },
  {
    to: "/leave/requests",
    label: "Leave Approvals",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
    ],
  },
  {
    to: "/leave/types",
    label: "Leave Types",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
    ],
  },
  {
    to: "/leave/balance",
    label: "Leave Balance",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.EMPLOYEE,
    ],
  },
  {
    to: "/employees",
    label: "Employees",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
    ],
  },
  {
    to: "/payroll",
    label: "Payroll",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
      ROLES.EMPLOYEE,
    ],
  },
  {
    to: "/users",
    label: "Users",
    roles: [
      ROLES.ADMIN,
      ROLES.HR,
    ],
  },
];

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();

  const visibleLinks = links.filter((link) =>
    hasRole(user, link.roles)
  );

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {visibleLinks.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            "px-3 py-2 rounded-md text-sm font-medium transition-colors " +
            (isActive
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-paper")
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}