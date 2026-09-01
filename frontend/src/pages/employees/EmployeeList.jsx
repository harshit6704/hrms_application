import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllEmployees, uploadEmployeesCsv, } from "../../services/employeeService.js";
import { getErrorMessage } from "../../lib/api.js";
import { downloadCsv } from "../../lib/downloadCsv.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { downloadEmployeeTemplate } from "../../lib/employeeCsvTemplate.js";
import EmployeeSelect from "../../components/EmployeeSelect.jsx";

export default function EmployeeList() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  async function load() {
    setStatus("loading");
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesEmployee =
        !employeeFilter ||
        String(e.empid) === String(employeeFilter);

      const matchesDepartment =
        !departmentFilter ||
        e.department === departmentFilter;

      return matchesEmployee && matchesDepartment;
    });
  }, [employees, employeeFilter, departmentFilter]);

  function handleDownload() {
    if (filtered.length === 0) {
      toast.error("There are no employees to download.");
      return;
    }

    downloadCsv("employees.csv", filtered, [
      { label: "Employee ID", value: (e) => e.empid },
      { label: "Employee Number", value: (e) => e.empnumber },
      { label: "Name", value: (e) => e.name },
      { label: "Email", value: (e) => e.email },
      { label: "Phone", value: (e) => e.phone },
      { label: "Date of Birth", value: (e) => e.dob },
      { label: "Date of Joining", value: (e) => e.doj },
      { label: "Department", value: (e) => e.department },
      { label: "Salary", value: (e) => e.salary },
      { label: "Shift Hours", value: (e) => e.shifthours },
    ]);
  }

  function openUpload() {
    setSelectedFile(null);
    setUploadError("");
    setShowUpload(true);
  }

  function closeUpload() {
    if (uploading) return;
    setShowUpload(false);
    setSelectedFile(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError("");

    if (!selectedFile) {
      setUploadError("Please select a CSV file.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setUploadError("Please select a CSV file.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadEmployeesCsv(selectedFile);
      toast.success(`${result.created_count} employees imported.`);
      closeUpload();
      await load();
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Directory of all employees"
        actions={
          <>
            <button
              type="button"
              onClick={downloadEmployeeTemplate}
              className="text-sm px-4 py-2 rounded-md border border-paper-line"
            >
              Download Blank CSV
            </button>

            <button
              type="button"
              onClick={openUpload}
              className="text-sm px-4 py-2 rounded-md border border-paper-line"
            >
              Upload CSV
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="text-sm px-4 py-2 rounded-md border border-paper-line"
            >
              Download Employee's List
            </button>

            <button
              type="button"
              onClick={() => navigate("/employees/create")}
              className="bg-ink text-paper text-sm px-4 py-2 rounded-md"
            >
              + New employee
            </button>
          </>
        }
      />

      <EmployeeSelect
        value={employeeFilter}
        onChange={setEmployeeFilter}
        placeholder="Search employee number or name..."
      />

      {status === "loading" && <Loading label="Loading employees…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && filtered.length === 0 && (
        <EmptyState
          title="No employees found"
          description="Try a different search, or add a new employee."
        />
      )}

      {status === "ready" && filtered.length > 0 && (
        <div className="ledger-card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) border-b border-paper-line">
                <th className="px-4 py-3">Emp #</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Shift hrs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.empid}
                  onDoubleClick={() => navigate(`/employees/${e.empid}`)}
                  className="border-b border-paper-line last:border-0 hover:bg-paper cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono">{e.empnumber}</td>
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.department}</td>
                  <td className="px-4 py-3">{e.email}</td>
                  <td className="px-4 py-3 font-mono">{e.phone}</td>
                  <td className="px-4 py-3 font-mono">{e.shifthours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleUpload}
            className="ledger-card bg-paper p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-xl text-ink">
                  Upload Employees CSV
                </h2>
                <p className="text-xs text-(--color-ink-faint) mt-1">
                  Import multiple employees at once.
                </p>
              </div>
              <button
                type="button"
                onClick={closeUpload}
                disabled={uploading}
                className="text-(--color-ink-faint) hover:text-ink disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-(--color-ink-faint) mb-4 leading-5">
              Required columns:
              <br />
              <span className="font-mono">
                empnumber, name, email, phone, dob, doj, department, salary, shifthours
              </span>
              <br />
              Use dates in <span className="font-mono">YYYY-MM-DD</span> format.
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setUploadError("");
              }}
              className="block w-full text-sm"
            />

            {selectedFile && (
              <p className="text-xs font-mono text-(--color-ink-faint) mt-2">
                Selected: {selectedFile.name}
              </p>
            )}

            {uploadError && (
              <div className="whitespace-pre-line text-sm text-(--color-absent) bg-(--color-absent)/10 border border-(--color-absent)/30 rounded-md px-3 py-2 mt-4">
                {uploadError}
              </div>
            )}

            <div className="flex gap-2 justify-end mt-6">
              <button
                type="button"
                onClick={closeUpload}
                disabled={uploading}
                className="text-sm px-4 py-2 rounded-md border border-paper-line disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
