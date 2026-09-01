import { useEffect, useState } from "react";
import { getAttendance } from "../../services/attendanceService.js";
import { getAllEmployees } from "../../services/employeeService.js";
import EmployeeSelect from "../../components/EmployeeSelect.jsx"
import { getErrorMessage } from "../../lib/api.js";
import { downloadCsv } from "../../lib/downloadCsv.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceReport() {
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(today());
  const [empid, setEmpid] = useState("");
  const [employees, setEmployees] = useState([]);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function load() {
    setStatus("loading");
    try {
      const data = await getAttendance({
        empid: empid || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
      setRows(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }
  async function loadEmployees() {
  try {
    const data = await getAllEmployees();
    setEmployees(data);
  } catch (err) {
    setError(getErrorMessage(err));
    setStatus("error");
  }
}

  useEffect(() => {
      loadEmployees();
      load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDownload() {
    if (rows.length === 0) {
      showToast(
        "There are no attendance records to download.",
        "error"
      );
      return;
    }

    downloadCsv("attendance-report.csv", rows, [
      { label: "Date", value: (r) => r.date },
      { label: "Employee ID", value: (r) => r.empid },
      { label: "Employee Name", value: (r) => r.name },
      { label: "Punch In", value: (r) => r.punch_in },
      { label: "Punch Out", value: (r) => r.punch_out },
      { label: "Hours Worked", value: (r) => r.hours_worked },
      { label: "Status", value: (r) => r.status },
    ]);
  }

  return (
    <div>
      <PageHeader title="Attendance Report"
        actions={
          <button
            type="button"
            onClick={handleDownload}
            className="text-sm px-4 py-2 rounded-md border border-paper-line"
          >
            Download CSV
          </button>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="ledger-card p-4 mb-6 flex flex-wrap gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">From date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="ledger-input px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">To date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="ledger-input px-3 py-2 text-sm" />
        </div>
        <div className="w-64">
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
            Employee
          </label>

          <EmployeeSelect
            employees={employees}
            value={empid}
            onChange={(selectedEmpid) => setEmpid(selectedEmpid)}
            placeholder="Search employee..."
          />
        </div>
        <button type="submit" className="bg-ink text-paper text-sm px-4 py-2 rounded-md">
          Apply filters
        </button>
      </form>

      {status === "loading" && <Loading label="Loading attendance…" />}
      {status === "error" && (
        <ErrorState
          message={
            error.includes("Not Authorized") || error.toLowerCase().includes("not authorized")
              ? "Not authorized to view another employee's attendance."
              : error
          }
          onRetry={load}
        />
      )}
      {status === "ready" && rows.length === 0 && <EmptyState title="No attendance records for this range" />}

      {status === "ready" && rows.length > 0 && (
        <div className="ledger-card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Punch In</th>
                <th className="px-4 py-3">Punch Out</th>
                <th className="px-4 py-3">Hours worked</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.empid}-${r.date}`} className="border-b border-paper-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3 font-mono">{r.date}</td>
                  <td className="px-4 py-3">{r.name} <span className="text-(--color-ink-faint) font-mono text-xs">#{r.empid}</span></td>
                  <td className="px-4 py-3 font-mono">{r.punch_in ?? "—"}</td>
                  <td className="px-4 py-3 font-mono">{r.punch_out ?? "—"}</td>
                  <td className="px-4 py-3 font-mono">{r.hours_worked ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
