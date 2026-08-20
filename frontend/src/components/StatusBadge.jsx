// Maps backend enum values (models/enums.py) exactly to a stamp color.
// AttendanceStatus: In Progress, Present, Absent, Half Day, Leave, Not Marked, Holiday, Week Off
// LeaveStatus: Pending, Approved, Rejected, Cancelled
const COLOR_MAP = {
  "Present": "var(--color-present)",
  "In Progress": "var(--color-amber)",
  "Absent": "var(--color-absent)",
  "Half Day": "var(--color-half)",
  "Leave": "var(--color-leave)",
  "Not Marked": "var(--color-notmarked)",
  "Holiday": "var(--color-holiday)",
  "Week Off": "var(--color-notmarked)",
  "Pending": "var(--color-pending)",
  "Approved": "var(--color-approved)",
  "Rejected": "var(--color-rejected)",
  "Cancelled": "var(--color-cancelled)",
};

export default function StatusBadge({ status }) {
  const color = COLOR_MAP[status] || "var(--color-ink-faint)";
  return (
    <span className="stamp" style={{ color }}>
      {status}
    </span>
  );
}
