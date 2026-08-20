export default function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 py-10 justify-center text-(--color-ink-faint)">
      <span className="w-4 h-4 rounded-full border-2 border-paper-line border-t-stamp animate-spin" />
      <span className="font-mono text-sm">{label}</span>
    </div>
  );
}
