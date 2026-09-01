import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { createUser } from "../../services/userService.js";
import { getSelectableEmployees } from "../../services/employeeService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";

import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmployeeSelect from "../../components/EmployeeSelect.jsx";

import { ROLES, ALL_ROLES } from "../../utils/roles.js";

const initialForm = {
  empid: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  role: ROLES.EMPLOYEE,
  is_active: true,
};

export default function UserCreate() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(initialForm);

  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadEmployees() {
    setStatus("loading");
    setError("");

    try {
      const data = await getSelectableEmployees();

      setEmployees(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleEmployeeChange(empid) {
    const employee = employees.find(
      (employee) =>
        String(employee.empid) === String(empid)
    );

    // Employee cleared
    if (!employee) {
      setForm((current) => ({
        ...current,
        empid: "",
        name: "",
        email: "",
        phone: "",
      }));

      return;
    }

    // Employee selected:
    // Prefill the user details from employee data,
    // but keep them editable.
    setForm((current) => ({
      ...current,
      empid: employee.empid,
      name: employee.name ?? "",
      email: employee.email ?? "",
      phone: employee.phone ?? "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.empid) {
      setError("Please select an employee.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        empid: Number(form.empid),
        empnumber: form.empnumber,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
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

  if (status === "loading") {
    return <Loading label="Loading employees…" />;
  }

  if (status === "error") {
    return (
      <ErrorState
        message={error}
        onRetry={loadEmployees}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="New user"
        subtitle="Create a login account for an existing employee"
      />

      <form
        onSubmit={handleSubmit}
        className="ledger-card p-6 max-w-2xl space-y-4"
      >
        {error && (
          <div className="whitespace-pre-line text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Employee */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
            Employee <span className="text-stamp">*</span>
          </label>

          <EmployeeSelect
            employees={employees}
            value={form.empid}
            onChange={handleEmployeeChange}
            placeholder="Search employee number or name..."
            required
          />

          <p className="text-xs text-(--color-ink-faint) mt-1">
            Select the employee for whom this login account is being created.
          </p>
        </div>

        {/* Employee / User details */}
        {form.empid && (
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Employee number */}
            <Field label="Employee number">
              <input
                value={
                  employees.find(
                    (employee) =>
                      String(employee.empid) ===
                      String(form.empid)
                  )?.empnumber ?? ""
                }
                disabled
                className="ledger-input w-full px-3 py-2 text-sm opacity-60 cursor-not-allowed"
              />
            </Field>

            {/* Employee ID */}
            <Field label="Employee ID">
              <input
                value={form.empid}
                disabled
                className="ledger-input w-full px-3 py-2 text-sm opacity-60 cursor-not-allowed"
              />
            </Field>

            {/* Name */}
            <Field label="Full name" required>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                className="ledger-input w-full px-3 py-2 text-sm"
              />
            </Field>

            {/* Email */}
            <Field label="Email" required>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  update("email", e.target.value)
                }
                className="ledger-input w-full px-3 py-2 text-sm"
              />
            </Field>

            {/* Phone */}
            <Field label="Phone" required>
              <input
                required
                value={form.phone}
                onChange={(e) =>
                  update("phone", e.target.value)
                }
                className="ledger-input w-full px-3 py-2 text-sm"
              />
            </Field>
          </div>
        )}

        {/* Password */}
        <Field label="Password" required>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              update("password", e.target.value)
            }
            className="ledger-input w-full px-3 py-2 text-sm"
          />
        </Field>

        {/* Role */}
        <Field label="Role" required>
          <select
            required
            value={form.role}
            onChange={(e) =>
              update("role", e.target.value)
            }
            className="ledger-input w-full px-3 py-2 text-sm"
          >
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Field>

        {/* Active */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              update("is_active", e.target.checked)
            }
          />
          Active
        </label>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !form.empid
            }
            className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating…"
              : "Create user"}
          </button>

          <Link
            to="/users"
            className="text-sm px-4 py-2 rounded-md border border-paper-line"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
        {label}{" "}
        {required && (
          <span className="text-stamp">*</span>
        )}
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