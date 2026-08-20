export default function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[1px] px-4">
      <div className={"ledger-card w-full p-5 shadow-xl max-h-[85vh] overflow-y-auto scrollbar-thin " + (wide ? "max-w-2xl" : "max-w-md")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-ink">{title}</h3>
          <button onClick={onClose} className="text-(--color-ink-faint) hover:text-ink text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
