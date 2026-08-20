import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser } from "../../services/userService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import { ROLES, ALL_ROLES } from "../../utils/roles.js";
import PageHeader from "../../components/PageHeader.jsx";

const initial = { name: "", email: "", password: "", phone: "", empid: "", role: ROLES.EMPLOYEE, is_active: true };

export default function UserCreate() {
  const [form, setForm] = useState(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        empid: Number(form.empid),
        role: form.role,
        is_active: form.is_active,
      };
      await createUser(payload);
      toast.success("User created.");
      navigate("/users");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="New user" subtitle="Create a login account linked to an existing employee" />
      <form onSubmit={handleSubmit} className="ledger-card p-6 max-w-xl space-y-4">
        {error && (
          <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" required>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Email" required>
            <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Password" required>
            <input type="password" required value={form.password} onChange={(e) => update("password", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Phone" required>
            <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Employee ID" required hint="Must match an existing employee's empid">
            <input type="number" required value={form.empid} onChange={(e) => update("empid", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Role" required>
            <select value={form.role} onChange={(e) => update("role", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm">
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
          Active
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60">
            {isSubmitting ? "Creating…" : "Create user"}
          </button>
          <Link to="/users" className="text-sm px-4 py-2 rounded-md border border-paper-line">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
        {label} {required && <span className="text-stamp">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-(--color-ink-faint) mt-1">{hint}</p>}
    </div>
  );
}
