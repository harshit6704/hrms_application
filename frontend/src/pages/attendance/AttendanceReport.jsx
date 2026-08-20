import { useEffect, useState } from "react";
import { getAttendance } from "../../services/attendanceService.js";
import { getErrorMessage } from "../../lib/api.js";
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
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader title="Attendance Report"/>

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
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
            Employee ID <span className="normal-case font-sans">(leave blank for yourself)</span>
          </label>
          <input
            type="number"
            value={empid}
            onChange={(e) => setEmpid(e.target.value)}
            placeholder="e.g. 4"
            className="ledger-input px-3 py-2 text-sm w-40"
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
