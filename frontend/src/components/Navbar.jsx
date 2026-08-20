import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-paper-line bg-paper-dim">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md border border-paper-line"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-ink">Ledger</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-(--color-ink-faint)">HRMS</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-ink leading-tight">{user?.name || "—"}</p>
          <p className="text-xs font-mono text-(--color-ink-faint) leading-tight">{user?.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-sm font-mono px-3 py-1.5 rounded-md border border-paper-line hover:border-stamp hover:text-stamp"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
