import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getEmployeeById,
  updateEmployee,
} from "../../services/employeeService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";

export default function EmployeeEdit() {
  const { empid } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    setStatus("loading");
    setError("");

    try {
      const data = await getEmployeeById(empid);

      setForm({
        empnumber: data.empnumber ?? "",
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        dob: data.dob ?? "",
        doj: data.doj ?? "",
        department: data.department ?? "",
        salary: data.salary ?? "",
        shifthours: data.shifthours ?? "",
      });

      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, [empid]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        doj: form.doj,
        department: form.department,
        salary: Number(form.salary),
        shifthours: Number(form.shifthours),
      };

      await updateEmployee(empid, payload);

      toast.success("Employee updated.");

      navigate(`/employees/${empid}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return <Loading label="Loading employee…" />;
  }

  if (status === "error") {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div>
      <PageHeader
        title={`Edit employee ${empid}`}
        subtitle="Update employee details"
      />

      <form
        onSubmit={handleSubmit}
        className="ledger-card p-6 max-w-2xl space-y-4"
      >
        {error && (
          <div className="text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">

          <Field label="Employee number">
            <input
              value={form.empnumber}
              disabled
              className="ledger-input w-full px-3 py-2 text-sm opacity-60 cursor-not-allowed"
            />
          </Field>

          <Field label="Full name" required>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Phone" required>
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Date of birth" required>
            <input
              type="date"
              required
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Date of joining" required>
            <input
              type="date"
              required
              value={form.doj}
              onChange={(e) => update("doj", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Department" required>
            <input
              required
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Salary" required>
            <input
              type="number"
              min="0"
              required
              value={form.salary}
              onChange={(e) => update("salary", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

          <Field
            label="Shift hours"
            required
            hint="e.g. 8.5 = 8h 30m"
          >
            <input
              type="number"
              step="0.25"
              min="0"
              max="24"
              required
              value={form.shifthours}
              onChange={(e) => update("shifthours", e.target.value)}
              className="ledger-input w-full px-3 py-2 text-sm"
            />
          </Field>

        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>

          <Link
            to={`/employees/${empid}`}
            className="text-sm px-4 py-2 rounded-md border border-paper-line"
          >
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

      {hint && (
        <p className="text-xs text-(--color-ink-faint) mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}