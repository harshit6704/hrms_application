import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/PageHeader.jsx";

const tiles = [
  { to: "/attendance", title: "Punch Clock", desc: "Punch in / out for today" },
  { to: "/attendance/report", title: "Attendance Report", desc: "View attendance history" },
  { to: "/leave", title: "My Leave", desc: "Apply for leave and view your applications" },
  { to: "/leave/requests", title: "Leave Approvals", desc: "Review pending leave requests" },
  { to: "/leave/balance", title: "Leave Balance", desc: "Check remaining leave balance" },
  { to: "/employees", title: "Employees", desc: "Browse the employee directory" },
  { to: "/payroll", title: "Payroll", desc: "View or generate payroll" },
  { to: "/users", title: "Users", desc: "Manage system users" },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title={`Welcome${user?.name ? `, ${user.name}` : ""}`} subtitle="Pick up where you left off." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="ledger-card p-4 hover:border-stamp transition-colors">
            <p className="font-display text-lg text-ink">{t.title}</p>
            <p className="text-sm text-(--color-ink-faint) mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
