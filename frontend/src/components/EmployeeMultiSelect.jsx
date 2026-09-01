import { useMemo, useState } from "react";

export default function EmployeeMultiSelect({
  employees = [],
  value = [],
  onChange,
  placeholder = "Search employee number or name...",
  disabled = false,
  required = false,
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const employeeList = Array.isArray(employees) ? employees : [];
  const selectedValues = Array.isArray(value) ? value : [];

  const selectedIds = useMemo(
    () => selectedValues.map((id) => String(id)),
    [selectedValues]
  );

  const selectedEmployees = useMemo(() => {
    return employeeList.filter((employee) =>
      selectedIds.includes(String(employee.empid))
    );
  }, [employeeList, selectedIds]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employeeList;
    }

    return employeeList.filter((employee) => {
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
  }, [employeeList, search]);

  function selectEmployee(empid) {
    const id = String(empid);

    if (selectedIds.includes(id)) {
      return;
    }

    onChange([
      ...selectedValues,
      empid,
    ]);

    setSearch("");
    setIsOpen(true);
  }

  function removeEmployee(empid) {
    const id = String(empid);

    onChange(
      selectedValues.filter(
        (selectedId) =>
          String(selectedId) !== id
      )
    );
  }

  function handlePaste(e) {
    const pastedText =
      e.clipboardData.getData("text");

    if (!pastedText.trim()) {
      return;
    }

    /*
      Supports Excel / spreadsheet paste:

      EMP001
      EMP002
      EMP003

      or:

      EMP001    EMP002    EMP003

      or:

      1, 2, 3
    */

    const pastedValues = pastedText
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (pastedValues.length === 0) {
      return;
    }

    const normalizedValues =
      pastedValues.map((item) =>
        item.toLowerCase()
      );

    const matchedEmployees =
      employeeList.filter((employee) => {
        const empid = String(
          employee.empid ?? ""
        ).toLowerCase();

        const empnumber = String(
          employee.empnumber ?? ""
        )
          .trim()
          .toLowerCase();

        return normalizedValues.some(
          (pastedValue) =>
            pastedValue === empid ||
            pastedValue === empnumber
        );
      });

    if (matchedEmployees.length === 0) {
      return;
    }

    e.preventDefault();

    const newIds =
      matchedEmployees
        .map((employee) => employee.empid)
        .filter(
          (empid) =>
            !selectedIds.includes(
              String(empid)
            )
        );

    if (newIds.length > 0) {
      onChange([
        ...selectedValues,
        ...newIds,
      ]);
    }

    setSearch("");
    setIsOpen(true);
  }

  function clearAll() {
    onChange([]);
    setSearch("");
    setIsOpen(true);
  }

  return (
    <div className="relative">
      {/* Selected employees */}
      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedEmployees.map(
            (employee) => (
              <div
                key={employee.empid}
                className="flex items-center gap-2 bg-paper border border-paper-line rounded-md px-2 py-1 text-sm"
              >
                <span>
                  <span className="font-mono">
                    {employee.empnumber}
                  </span>

                  {" - "}

                  {employee.name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeEmployee(
                      employee.empid
                    )
                  }
                  disabled={disabled}
                  className="text-(--color-ink-faint) hover:text-ink disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
        onClick={() => {
          setIsOpen(true);
        }}
        onPaste={handlePaste}
        onBlur={() => {
          setTimeout(() => {
            setIsOpen(false);
          }, 200);
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={
          required &&
          selectedValues.length === 0
        }
        className="ledger-input w-full px-3 py-2 text-sm"
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full ledger-card bg-paper max-h-60 overflow-y-auto">
          {employeeList.length === 0 ? (
            <div className="px-3 py-2 text-sm text-(--color-ink-faint)">
              No employees available.
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="px-3 py-2 text-sm text-(--color-ink-faint)">
              No employees found.
            </div>
          ) : (
            filteredEmployees.map(
              (employee) => {
                const alreadySelected =
                  selectedIds.includes(
                    String(employee.empid)
                  );

                return (
                  <button
                    key={employee.empid}
                    type="button"
                    disabled={
                      disabled ||
                      alreadySelected
                    }
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() =>
                      selectEmployee(
                        employee.empid
                      )
                    }
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      alreadySelected
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-paper"
                    }`}
                  >
                    <span className="font-mono">
                      {employee.empnumber}
                    </span>

                    {" - "}

                    {employee.name}

                    {alreadySelected && (
                      <span className="ml-2 text-xs text-(--color-ink-faint)">
                        Selected
                      </span>
                    )}
                  </button>
                );
              }
            )
          )}

          {/* Clear all */}
          {selectedEmployees.length >
            0 && (
            <div className="sticky bottom-0 bg-paper border-t border-paper-line p-2">
              <button
                type="button"
                onMouseDown={(e) =>
                  e.preventDefault()
                }
                onClick={clearAll}
                className="text-xs text-(--color-ink-faint) hover:text-ink"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}