import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEmployeeById } from "../../services/employeeService.js";
import { getErrorMessage } from "../../lib/api.js";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import RoleGuard from "../../components/RoleGuard.jsx";
import { ROLES } from "../../utils/roles.js";

export default function EmployeeDetails() {
  const { empid } = useParams();
  const [employee, setEmployee] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  async function load() {
    setStatus("loading");
    try {
      const data = await getEmployeeById(empid);
      setEmployee(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empid]);

  return (
    <div>
      <PageHeader
        title={`Employee ${empid}`}
        subtitle="Employee details"
        actions={
          <RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
          <Link
            to={`/employees/${empid}/edit`}
            className="text-sm px-4 py-2 rounded-md border border-paper-line"
          >
            Edit
          </Link>
        </RoleGuard>
        }
      />

      {status === "loading" && <Loading label="Loading employee…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}

      {status === "ready" && employee && (
        <div className="ledger-card p-6 max-w-2xl grid sm:grid-cols-2 gap-5">
          <Detail label="Employee number" value={employee.empnumber} mono />
          <Detail label="Name" value={employee.name} />
          <Detail label="Email" value={employee.email} />
          <Detail label="Phone" value={employee.phone} mono />
          <Detail label="Department" value={employee.department} />
          <Detail label="Shift hours" value={employee.shifthours} mono />
          <Detail label="Date of birth" value={employee.dob} mono />
          <Detail label="Date of joining" value={employee.doj} mono />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-wide text-(--color-ink-faint)">{label}</p>
      <p className={"text-sm text-ink mt-0.5 " + (mono ? "font-mono" : "")}>{value ?? "—"}</p>
    </div>
  );
}
