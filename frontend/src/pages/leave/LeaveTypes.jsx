import { useEffect, useState } from "react";
import { getAllLeaveTypes, createLeaveType } from "../../services/leaveTypeService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/Modal.jsx";

const emptyForm = { lvname: "", is_paid: true, description: "" };

export default function LeaveTypes() {
  const toast = useToast();
  const [types, setTypes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setStatus("loading");
    try {
      const data = await getAllLeaveTypes();
      setTypes(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    try {
      await createLeaveType(form);
      toast.success("Leave type created.");
      setShowCreate(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Leave Types"
        actions={
          <button onClick={() => setShowCreate(true)} className="bg-ink text-paper text-sm px-4 py-2 rounded-md">
            + New leave type
          </button>
        }
      />

      {status === "loading" && <Loading label="Loading leave types…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && types.length === 0 && <EmptyState title="No leave types configured yet" />}

      {status === "ready" && types.length > 0 && (
        <div className="ledger-card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.lvid} className="border-b border-paper-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3">{t.lvname}</td>
                  <td className="px-4 py-3">{t.is_paid ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-(--color-ink-faint)">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} title="New leave type" onClose={() => setShowCreate(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Name</label>
            <input required value={form.lvname} onChange={(e) => setForm({ ...form, lvname: e.target.value })} className="ledger-input w-full px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} />
            Paid leave
          </label>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="ledger-input w-full px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="text-sm px-4 py-2 rounded-md border border-paper-line">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60">
              {isSubmitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
