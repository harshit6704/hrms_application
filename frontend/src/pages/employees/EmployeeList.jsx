import { useEffect, useMemo, useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import { getAllEmployees } from "../../services/employeeService.js";
import { getErrorMessage } from "../../lib/api.js";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
 

  async function load() {
    setStatus("loading");
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // NOTE: the backend's GET /employees/ has no search/filter query params,
  // so filtering below happens client-side over the already-fetched list.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.empnumber?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Directory of all employees"
        actions={
          <Link
            to="/employees/create"
            className="bg-ink text-paper text-sm px-4 py-2 rounded-md"
          >
            + New employee
          </Link>
        }
      />

      <input
        type="text"
        placeholder="Search by name, email, employee no. or department…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="ledger-input w-full px-3 py-2 text-sm mb-4"
      />

      {status === "loading" && <Loading label="Loading employees…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && filtered.length === 0 && (
        <EmptyState title="No employees found" description="Try a different search, or add a new employee." />
      )}

      {status === "ready" && filtered.length > 0 && (
        <>
          {/* <div className="ledger-card px-4 py-2.5 mb-4 text-xs text-(--color-ink-faint)">
            <strong className="text-(--color-amber)">Note:</strong> the list below can't link to a details
            page — GET /employees/ doesn't return the numeric <code className="font-mono">empid</code> that
            GET /employees/&#123;empid&#125; requires, only <code className="font-mono">empnumber</code>. See
            BACKEND GAPS.
          </div> */}
          <div className="ledger-card overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                  <th className="px-4 py-3">Emp #</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Shift hrs</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.empid}
                    onDoubleClick={() => navigate(`/employees/${e.empid}`)}
                    className="border-b border-paper-line last:border-0 hover:bg-paper cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono">{e.empnumber}</td>
                    <td className="px-4 py-3">{e.name}</td>
                    <td className="px-4 py-3">{e.department}</td>
                    <td className="px-4 py-3">{e.email}</td>
                    <td className="px-4 py-3 font-mono">{e.phone}</td>
                    <td className="px-4 py-3 font-mono">{e.shifthours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
