export default function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="ledger-card border-dashed text-center py-14 px-6">
      <p className="font-display text-lg text-ink">{title}</p>
      {description && (
        <p className="text-sm text-(--color-ink-faint) mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
