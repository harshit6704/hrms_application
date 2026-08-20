export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", danger, onConfirm, onCancel, isSubmitting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[1px] px-4">
      <div className="ledger-card w-full max-w-sm p-5 shadow-xl">
        <h3 className="font-display text-lg text-ink">{title}</h3>
        {description && <p className="text-sm text-(--color-ink-faint) mt-2">{description}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm rounded-md border border-paper-line hover:bg-paper"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={
              "px-3 py-1.5 text-sm rounded-md text-paper disabled:opacity-60 " +
              (danger ? "bg-(--color-absent)" : "bg-ink")
            }
          >
            {isSubmitting ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
