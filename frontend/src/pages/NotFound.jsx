import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <p className="font-display text-3xl text-ink">Page not found</p>
      <p className="text-sm text-(--color-ink-faint)">The entry you're looking for isn't in the ledger.</p>
      <Link to="/" className="font-mono text-sm underline decoration-dotted text-stamp">
        Back to dashboard
      </Link>
    </div>
  );
}
