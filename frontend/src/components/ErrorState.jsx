export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="ledger-card border-(--color-absent)/40 text-center py-10 px-6">
      <p className="font-display text-(--color-absent)">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-mono underline decoration-dotted text-ink hover:text-stamp"
        >
          Try again
        </button>
      )}
    </div>
  );
}
