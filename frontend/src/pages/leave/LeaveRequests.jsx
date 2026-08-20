import { useEffect, useState } from "react";
import { getLeaveApplications, approveLeave } from "../../services/leaveApplicationService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Modal from "../../components/Modal.jsx";

export default function LeaveRequests() {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [reviewing, setReviewing] = useState(null); // { app, decision }
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  async function load() {
    setStatus("loading");
    try {
      const data = await getLeaveApplications({ status: statusFilter || undefined });
      setApplications(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function openReview(app, decision) {
    setReviewing({ app, decision });
    setRemarks("");
    setReviewError("");
  }

  async function submitReview() {
    setIsSubmitting(true);
    setReviewError("");
    try {
      await approveLeave(reviewing.app.laid, { status: reviewing.decision, remarks });
      toast.success(`Leave ${reviewing.decision.toLowerCase()}.`);
      setReviewing(null);
      load();
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Leave Approvals"
        subtitle="Approve or reject leave requests. Only Admin, HR, or a reporting Manager can act — enforced by the backend."
      />

      <div className="ledger-card p-3 mb-4 flex items-center gap-3">
        <label className="text-xs font-mono uppercase tracking-wide text-(--color-ink-faint)">Status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ledger-input px-3 py-1.5 text-sm">
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
          <option value="">All</option>
        </select>
      </div>

      {status === "loading" && <Loading label="Loading requests…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && applications.length === 0 && <EmptyState title="No requests in this status" />}

      {status === "ready" && applications.length > 0 && (
        <div className="ledger-card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.status === "Pending" && (
                      <div className="flex gap-3">
                        <button onClick={() => openReview(a, "Approved")} className="text-xs font-mono underline decoration-dotted text-(--color-present)">Approve</button>
                        <button onClick={() => openReview(a, "Rejected")} className="text-xs font-mono underline decoration-dotted text-(--color-absent)">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(reviewing)} title={`${reviewing?.decision} leave for ${reviewing?.app?.name ?? ""}`} onClose={() => setReviewing(null)}>
        {reviewing && (
          <div className="space-y-4">
            {reviewError && (
              <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
                {reviewError}
              </div>
            )}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">Remarks</label>
              <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" placeholder="Optional note for the employee" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setReviewing(null)} className="text-sm px-4 py-2 rounded-md border border-paper-line">Cancel</button>
              <button
                onClick={submitReview}
                disabled={isSubmitting}
                className={"text-sm px-4 py-2 rounded-md text-paper disabled:opacity-60 " + (reviewing.decision === "Approved" ? "bg-(--color-present)" : "bg-(--color-absent)")}
              >
                {isSubmitting ? "Saving…" : `Confirm ${reviewing.decision}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
