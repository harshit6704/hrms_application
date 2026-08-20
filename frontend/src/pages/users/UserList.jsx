import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../services/userService.js";
import { getErrorMessage } from "../../lib/api.js";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  async function load() {
    setStatus("loading");
    try {
      const data = await getAllUsers();
      setUsers(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="System users (login accounts), one per employee"
        actions={
          <Link to="/users/create" className="bg-ink text-paper text-sm px-4 py-2 rounded-md">
            + New user
          </Link>
        }
      />

      {status === "loading" && <Loading label="Loading users…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && users.length === 0 && <EmptyState title="No users yet" />}

      {status === "ready" && users.length > 0 && (
        <div className="ledger-card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                <th className="px-4 py-3">UID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Emp #</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-paper-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3 font-mono">{u.uid}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 font-mono">{u.phone}</td>
                  <td className="px-4 py-3 font-mono">{u.empid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
