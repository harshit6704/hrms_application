import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setMenuOpen((v) => !v)} />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden md:block w-56 shrink-0 border-r border-paper-line bg-paper-dim">
          <Sidebar />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-paper-dim shadow-xl">
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
