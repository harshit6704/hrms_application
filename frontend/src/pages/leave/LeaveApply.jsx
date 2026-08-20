import { useEffect, useState } from "react";
import { getAllLeaveTypes } from "../../services/leaveTypeService.js";
import { applyLeave, updateLeave, getLeaveApplications } from "../../services/leaveApplicationService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Modal from "../../components/Modal.jsx";

const emptyForm = { empid: "", lvid: "", start_date: "", end_date: "", reason: "" };

export default function LeaveApply() {
  const toast = useToast();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editing, setEditing] = useState(null); // application being edited

  async function loadAll() {
    setStatus("loading");
    try {
      const [types, apps] = await Promise.all([getAllLeaveTypes(), getLeaveApplications()]);
      setLeaveTypes(types);
      setApplications(apps);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleApply(e) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    try {
      const payload = {
        lvid: Number(form.lvid),
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason,
      };
      // empid is optional - only Admin/HR/Manager may set it for someone else (backend-enforced)
      if (form.empid) payload.empid = Number(form.empid);

      await applyLeave(payload);
      toast.success("Leave application submitted.");
      setForm(emptyForm);
      loadAll();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    try {
      const payload = {
        lvid: editing.lvid,
        start_date: editing.start_date,
        end_date: editing.end_date,
        reason: editing.reason,
      };
      await updateLeave(editing.laid, payload);
      toast.success("Leave application updated.");
      setEditing(null);
      loadAll();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="My Leave" subtitle="Apply for leave and track your applications" />

      <div className="ledger-card p-6 max-w-2xl mb-8">
        <p className="font-display text-lg mb-4">Apply for leave</p>
        <form onSubmit={handleApply} className="space-y-4">
          {formError && (
            <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
              {formError}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Leave type</label>
              <select required value={form.lvid} onChange={(e) => update("lvid", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm">
                <option value="">Select…</option>
                {leaveTypes.map((t) => (
                  <option key={t.lvid} value={t.lvid}>{t.lvname}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
                Applying for (optional)
              </label>
              <input
                type="number"
                value={form.empid}
                onChange={(e) => update("empid", e.target.value)}
                placeholder="Leave blank to apply for yourself"
                className="ledger-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Start date</label>
              <input type="date" required value={form.start_date} onChange={(e) => update("start_date", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">End date</label>
              <input type="date" required value={form.end_date} onChange={(e) => update("end_date", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Reason</label>
            <textarea required rows={3} value={form.reason} onChange={(e) => update("reason", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60">
            {isSubmitting ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </div>

      <p className="font-display text-lg mb-4">Applications</p>
      {status === "loading" && <Loading label="Loading leave applications…" />}
      {status === "error" && <ErrorState message={error} onRetry={loadAll} />}
      {status === "ready" && applications.length === 0 && <EmptyState title="No leave applications yet" />}

      {status === "ready" && applications.length > 0 && (
        <div className="ledger-card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.laid} className="border-b border-paper-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3">{a.name} <span className="text-(--color-ink-faint) font-mono text-xs">#{a.empid}</span></td>
                  <td className="px-4 py-3 font-mono">{a.start_date} → {a.end_date}</td>
                  <td className="px-4 py-3 max-w-[16rem] truncate" title={a.reason}>{a.reason}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-(--color-ink-faint)">{a.remarks || "—"}</td>
                  <td className="px-4 py-3">
                    {a.status === "Pending" && (
                      <button
                        onClick={() => setEditing({ ...a })}
                        className="text-xs font-mono underline decoration-dotted text-stamp"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(editing)} title={`Edit application #${editing?.laid ?? ""}`} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-4">
            {formError && (
              <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Start date</label>
                <input type="date" required value={editing.start_date} onChange={(e) => setEditing({ ...editing, start_date: e.target.value })} className="ledger-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">End date</label>
                <input type="date" required value={editing.end_date} onChange={(e) => setEditing({ ...editing, end_date: e.target.value })} className="ledger-input w-full px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Reason</label>
              <textarea required rows={3} value={editing.reason} onChange={(e) => setEditing({ ...editing, reason: e.target.value })} className="ledger-input w-full px-3 py-2 text-sm" />
            </div>
            <p className="text-xs text-(--color-ink-faint)">
              Leave type can't be changed here — the backend requires cancelling and re-applying to change type.
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="text-sm px-4 py-2 rounded-md border border-paper-line">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60">
                {isSubmitting ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
