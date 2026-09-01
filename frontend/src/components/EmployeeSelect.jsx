import { useEffect, useMemo, useState } from "react";
import { getSelectableEmployees } from "../services/employeeService.js";
import { getErrorMessage } from "../lib/api.js";

export default function EmployeeSelect({
  value,
  onChange,
  placeholder = "Search employee number or name...",
  disabled = false,
  required = false,
}) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);
      setError("");

      try {
        const data = await getSelectableEmployees();
        setEmployees(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          String(employee.empid) === String(value)
      ),
    [employees, value]
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      const empnumber = String(
        employee.empnumber ?? ""
      ).toLowerCase();

      const name = String(
        employee.name ?? ""
      ).toLowerCase();

      return (
        empnumber.includes(query) ||
        name.includes(query)
      );
    });
  }, [employees, search]);

  function handleFocus() {
    if (disabled) return;

    setIsOpen(true);

    if (selectedEmployee) {
      setSearch("");
    }
  }

  function handleSelect(employee) {
    onChange(employee.empid);
    setSearch("");
    setIsOpen(false);
  }

  function handleClear() {
    onChange("");
    setSearch("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={
          search ||
          (selectedEmployee
            ? `${selectedEmployee.empnumber} - ${selectedEmployee.name}`
            : "")
        }
        onChange={(e) => {
          const text = e.target.value;

          setSearch(text);

          if (value) {
            onChange("");
          }

          setIsOpen(true);
        }}
        onFocus={handleFocus}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
        placeholder={
          loading
            ? "Loading employees..."
            : placeholder
        }
        disabled={disabled || loading}
        required={required && !value}
        className="ledger-input w-full px-3 py-2 text-sm"
      />

      {isOpen && !value && (
        <div className="absolute z-50 mt-1 w-full ledger-card bg-paper max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-(--color-ink-faint)">
              Loading employees…
            </div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-(--color-absent)">
              {error}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="px-3 py-2 text-sm text-(--color-ink-faint)">
              No employees found.
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <button
                key={employee.empid}
                type="button"
                onClick={() => handleSelect(employee)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-paper"
              >
                <span className="font-mono">
                  {employee.empnumber}
                </span>
                {" - "}
                {employee.name}
              </button>
            ))
          )}
        </div>
      )}

      {value && selectedEmployee && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-(--color-ink-faint) hover:text-ink"
        >
          Clear
        </button>
      )}
    </div>
  );
}