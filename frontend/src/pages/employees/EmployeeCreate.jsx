import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createEmployee } from "../../services/employeeService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";

const initial = {
  empnumber: "",
  name: "",
  email: "",
  phone: "",
  dob: "",
  doj: "",
  department: "",
  salary: "",
  shifthours: "",
  is_active: true,
};

export default function EmployeeCreate() {
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
      // Backend EmployeeCreateSchema: name, email, phone, dob, doj, department,
      // salary (int), is_active, empnumber, shifthours (float)
      const payload = {
        empnumber: form.empnumber,
        name: form.name,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        doj: form.doj,
        department: form.department,
        salary: Number(form.salary),
        shifthours: Number(form.shifthours),
        is_active: form.is_active,
      };
      const created = await createEmployee(payload);
      toast.success("Employee created.");
      // POST /employees/ has no response_model, so it returns the raw row
      // (including empid) - use that to jump straight to the details page.
      if (created?.empid) {
        navigate(`/employees/${created.empid}`);
      } else {
        navigate("/employees");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="New employee" subtitle="Add a new employee to the directory" />

      <form onSubmit={handleSubmit} className="ledger-card p-6 max-w-2xl space-y-4">
        {error && (
          <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Employee number" required>
            <input required value={form.empnumber} onChange={(e) => update("empnumber", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Full name" required>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Email" required>
            <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Phone" required>
            <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Date of birth" required>
            <input type="date" required value={form.dob} onChange={(e) => update("dob", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Date of joining" required>
            <input type="date" required value={form.doj} onChange={(e) => update("doj", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Department" required>
            <input required value={form.department} onChange={(e) => update("department", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Salary" required>
            <input type="number" min="0" required value={form.salary} onChange={(e) => update("salary", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Shift hours" required hint="e.g. 8.5 = 8h 30m">
            <input type="number" step="0.25" min="0" max="24" required value={form.shifthours} onChange={(e) => update("shifthours", e.target.value)} className="ledger-input w-full px-3 py-2 text-sm" />
          </Field>
          <Field label="Active">
            <label className="flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
              Employee is active
            </label>
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60">
            {isSubmitting ? "Creating…" : "Create employee"}
          </button>
          <Link to="/employees" className="text-sm px-4 py-2 rounded-md border border-paper-line">
            Cancel
          </Link>
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
