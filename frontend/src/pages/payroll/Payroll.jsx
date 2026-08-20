import { useEffect, useState } from "react";
import { getPayroll, generatePayroll } from "../../services/payrollService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/Modal.jsx";
import RoleGuard from "../../components/RoleGuard.jsx";
import { ROLES } from "../../utils/roles.js";

const now = new Date();

export default function Payroll() {
  const toast = useToast();
  const [empid, setEmpid] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [showGenerate, setShowGenerate] = useState(false);
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
  const [genYear, setGenYear] = useState(now.getFullYear());
  const [genEmpids, setGenEmpids] = useState("");
  const [selectAll, setSelectAll] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genError, setGenError] = useState("");
  const [genResult, setGenResult] = useState(null);

  async function load() {
    setStatus("loading");
    try {
      const data = await getPayroll({
        empid: empid || undefined,
        month: month || undefined,
        year: year || undefined,
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

  async function handleGenerate(e) {
    e.preventDefault();
    setGenError("");
    setGenResult(null);
    setIsSubmitting(true);
    try {
      const payload = {
        month: Number(genMonth),
        year: Number(genYear),
        select_all: selectAll,
        empid: selectAll
          ? []
          : genEmpids
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map(Number),
      };
      const result = await generatePayroll(payload);
      setGenResult(result);
      toast.success(`Generated ${result.generated_count}, skipped ${result.skipped_count}.`);
      load();
    } catch (err) {
      setGenError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Payroll"
        actions={
          <RoleGuard roles={[ROLES.ADMIN, ROLES.HR]}>
          <button onClick={() => setShowGenerate(true)} className="bg-ink text-paper text-sm px-4 py-2 rounded-md">
            Generate payroll
          </button>
          </RoleGuard>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="ledger-card p-4 mb-6 flex flex-wrap items-end gap-3"
      >
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
            Employee ID <span className="normal-case font-sans">(optional)</span>
          </label>
          <input type="number" value={empid} onChange={(e) => setEmpid(e.target.value)} className="ledger-input px-3 py-2 text-sm w-40" />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Month</label>
          <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} className="ledger-input px-3 py-2 text-sm w-24" />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="ledger-input px-3 py-2 text-sm w-28" />
        </div>
        <button type="submit" className="bg-ink text-paper text-sm px-4 py-2 rounded-md">View</button>
      </form>

      {status === "loading" && <Loading label="Loading payroll…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && rows.length === 0 && <EmptyState title="No payroll records found" />}

      {status === "ready" && rows.length > 0 && (
        <div className="ledger-card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Month/Year</th>
                <th className="px-4 py-3">Gross salary</th>
                <th className="px-4 py-3">Paid days</th>
                <th className="px-4 py-3">Net pay</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-paper-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3">{r.name} <span className="text-(--color-ink-faint) font-mono text-xs">#{r.empid}</span></td>
                  <td className="px-4 py-3 font-mono">{r.month}/{r.year}</td>
                  <td className="px-4 py-3 font-mono">{r.gross_salary}</td>
                  <td className="px-4 py-3 font-mono">{r.paid_days}</td>
                  <td className="px-4 py-3 font-mono">{r.net_pay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showGenerate} title="Generate payroll" onClose={() => setShowGenerate(false)} wide>
        <form onSubmit={handleGenerate} className="space-y-4">
          {genError && (
            <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
              {genError}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Month</label>
              <input type="number" min="1" max="12" required value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Year</label>
              <input type="number" required value={genYear} onChange={(e) => setGenYear(e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)} />
            Generate for all employees
          </label>
          {!selectAll && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
                Employee IDs (comma-separated)
              </label>
              <input value={genEmpids} onChange={(e) => setGenEmpids(e.target.value)} placeholder="e.g. 1, 4, 7" className="ledger-input w-full px-3 py-2 text-sm" />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowGenerate(false)} className="text-sm px-4 py-2 rounded-md border border-paper-line">Close</button>
            <button type="submit" disabled={isSubmitting} className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60">
              {isSubmitting ? "Generating…" : "Generate"}
            </button>
          </div>

          {genResult && (
            <div className="text-xs font-mono text-ink-soft border-t border-paper-line pt-3">
              Generated: {genResult.generated_count} · Skipped: {genResult.skipped_count}
              {genResult.skipped?.length > 0 && (
                <ul className="mt-1 list-disc list-inside">
                  {genResult.skipped.map((s, i) => (
                    <li key={i}>{s.name} — {s.reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
