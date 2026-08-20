import { useEffect, useState } from "react";

import {
  getLeaveBalance,
  addLeaveBalance,
  updateLeaveBalance,
} from "../../services/leaveBalanceService.js";

import { getAllLeaveTypes } from "../../services/leaveTypeService.js";

import { getErrorMessage } from "../../lib/api.js";

import PageHeader from "../../components/PageHeader.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";


export default function LeaveBalance() {

  const [empid, setEmpid] = useState("");
  const [lvid, setLvid] = useState("");

  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState({});

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editingBalance, setEditingBalance] = useState(null);

  const [form, setForm] = useState({
    empid: "",
    lvid: "",
    opening_bal: "",
  });

  const [saving, setSaving] = useState(false);


  async function load() {

    setStatus("loading");
    setError("");

    try {

      const [
        bal,
        types
      ] = await Promise.all([

        getLeaveBalance({
          empid: empid || undefined,
          lvid: lvid || undefined,
        }),

        getAllLeaveTypes(),

      ]);

      setBalances(bal);

      setLeaveTypes(
        Object.fromEntries(
          types.map(
            (t) => [
              t.lvid,
              t.lvname
            ]
          )
        )
      );

      setStatus("ready");

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

      setStatus("error");
    }
  }


  useEffect(() => {

    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  function openAddForm() {

    setForm({
      empid: empid || "",
      lvid: "",
      opening_bal: "",
    });

    setEditingBalance(null);
    setShowAdd(true);
    setError("");
  }


  function openEditForm(balance) {

    setForm({
      empid: balance.empid,
      lvid: balance.lvid,
      opening_bal: balance.opening_bal,
    });

    setEditingBalance(balance);
    setShowAdd(false);
    setError("");
  }


  function closeForm() {

    setShowAdd(false);
    setEditingBalance(null);

    setForm({
      empid: "",
      lvid: "",
      opening_bal: "",
    });

    setError("");
  }


  async function handleSave(e) {

    e.preventDefault();

    setSaving(true);
    setError("");

    try {

      if (editingBalance) {

        await updateLeaveBalance(
          editingBalance.lbid,
          {
            opening_bal: Number(
              form.opening_bal
            ),
          }
        );

      } else {

        await addLeaveBalance({
          empid: Number(form.empid),
          lvid: Number(form.lvid),
          opening_bal: Number(
            form.opening_bal
          ),
        });
      }

      closeForm();

      await load();

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    } finally {

      setSaving(false);
    }
  }


  return (
    <div>

      <PageHeader
        title="Leave Balance"
        subtitle="Available leave by type"
        actions={
          <button
            type="button"
            onClick={openAddForm}
            className="bg-ink text-paper text-sm px-4 py-2 rounded-md"
          >
            Add Leave Balance
          </button>
        }
      />


      {/* SEARCH */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="ledger-card p-4 mb-6"
      >

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">

          {/* EMPLOYEE ID */}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
              Employee ID
            </label>

            <input
              type="number"
              min="1"
              value={empid}
              onChange={(e) =>
                setEmpid(e.target.value)
              }
              placeholder="All employees"
              className="ledger-input px-3 py-2 text-sm w-full sm:w-48"
            />
          </div>


          {/* LEAVE TYPE */}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
              Leave Type
            </label>

            <select
              value={lvid}
              onChange={(e) =>
                setLvid(e.target.value)
              }
              className="ledger-input px-3 py-2 text-sm w-full sm:w-52"
            >

              <option value="">
                All leave types
              </option>

              {Object.entries(
                leaveTypes
              ).map(
                ([id, name]) => (

                  <option
                    key={id}
                    value={id}
                  >
                    {name}
                  </option>

                )
              )}

            </select>
          </div>


          {/* SEARCH */}

          <button
            type="submit"
            className="bg-ink text-paper text-sm px-4 py-2 rounded-md"
          >
            Search
          </button>


          {/* CLEAR */}

          {(empid || lvid) && (
            <button
              type="button"
              onClick={() => {
                setEmpid("");
                setLvid("");

                setTimeout(() => {
                  load();
                }, 0);
              }}
              className="text-sm px-4 py-2 rounded-md border border-paper-line"
            >
              Clear
            </button>
          )}

        </div>

      </form>


      {/* LOADING */}

      {status === "loading" && (
        <Loading
          label="Loading leave balance…"
        />
      )}


      {/* ERROR */}

      {status === "error" && (
        <ErrorState
          message={error}
          onRetry={load}
        />
      )}


      {/* EMPTY */}

      {status === "ready" &&
        balances.length === 0 && (
          <EmptyState
            title="No leave balance records found"
            description={
              empid || lvid
                ? "No leave balance matches the selected filters."
                : "No leave balance records exist."
            }
          />
        )}


      {/* BALANCES */}

      {status === "ready" &&
        balances.length > 0 && (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {balances.map((b) => (

              <div
                key={b.lbid}
                className="ledger-card p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="font-mono text-xs text-(--color-ink-faint)">
                      Employee #{b.empid}
                    </p>
                    <p className="font-display text-lg text-ink mt-1">
                      {b.name}
                    </p>
                    <p className="font-display text-lg text-ink mt-1">
                      {leaveTypes[b.lvid] ||
                        `Leave type #${b.lvid}`}
                    </p>

                  </div>


                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(b)
                    }
                    className="text-xs px-3 py-1.5 rounded-md border border-paper-line hover:bg-paper"
                  >
                    Edit
                  </button>

                </div>


                <p className="font-mono text-3xl text-stamp mt-4">
                  {b.leave_balance}
                </p>

                <p className="text-xs text-(--color-ink-faint) mt-1">
                  days available
                </p>


                <div className="mt-3 pt-3 border-t border-paper-line text-xs font-mono text-(--color-ink-faint) space-y-1">

                  <p>
                    Opening: {b.opening_bal}
                  </p>

                  <p>
                    Accrued: {b.accured_bal}
                  </p>

                  <p>
                    Used: {b.used_bal}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}


      {/* ADD / EDIT MODAL */}

      {(showAdd || editingBalance) && (

        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">

          <form
            onSubmit={handleSave}
            className="ledger-card bg-paper p-6 w-full max-w-md"
          >

            {/* HEADER */}

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="font-display text-xl text-ink">

                  {editingBalance
                    ? "Edit Leave Balance"
                    : "Add Leave Balance"}

                </h2>

                <p className="text-xs text-(--color-ink-faint) mt-1">

                  {editingBalance
                    ? "Update the opening balance."
                    : "Assign leave balance to an employee."}

                </p>

              </div>


              <button
                type="button"
                onClick={closeForm}
                className="text-(--color-ink-faint) hover:text-ink"
              >
                ✕
              </button>

            </div>


            {/* ADD FORM */}

            {!editingBalance && (

              <>

                {/* EMPLOYEE ID */}

                <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
                  Employee ID
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={form.empid}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      empid: e.target.value,
                    })
                  }
                  className="ledger-input px-3 py-2 text-sm w-full mb-4"
                />


                {/* LEAVE TYPE */}

                <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
                  Leave Type
                </label>

                <select
                  required
                  value={form.lvid}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lvid: e.target.value,
                    })
                  }
                  className="ledger-input px-3 py-2 text-sm w-full mb-4"
                >

                  <option value="">
                    Select leave type
                  </option>

                  {Object.entries(
                    leaveTypes
                  ).map(
                    ([id, name]) => (

                      <option
                        key={id}
                        value={id}
                      >
                        {name}
                      </option>

                    )
                  )}

                </select>

              </>

            )}


            {/* EDIT INFORMATION */}

            {editingBalance && (

              <div className="mb-4 p-3 bg-paper border border-paper-line rounded-md text-sm">

                <p>

                  <span className="text-(--color-ink-faint)">
                    Employee ID:
                  </span>{" "}

                  <span className="font-mono">
                    {editingBalance.empid}
                  </span>

                </p>


                <p className="mt-1">

                  <span className="text-(--color-ink-faint)">
                    Leave Type:
                  </span>{" "}

                  {leaveTypes[
                    editingBalance.lvid
                  ] ||
                    `Leave type #${editingBalance.lvid}`}

                </p>

              </div>

            )}


            {/* OPENING BALANCE */}

            <label className="block text-xs font-mono uppercase tracking-wide text-(--color-ink-faint) mb-1">
              Opening Balance
            </label>

            <input
              type="number"
              min="0"
              required
              value={form.opening_bal}
              onChange={(e) =>
                setForm({
                  ...form,
                  opening_bal: e.target.value,
                })
              }
              className="ledger-input px-3 py-2 text-sm w-full"
            />


            {/* ERROR */}

            {error && (

              <p className="text-sm text-(--color-absent) mt-3">
                {error}
              </p>

            )}


            {/* BUTTONS */}

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={closeForm}
                className="text-sm px-4 py-2 rounded-md border border-paper-line"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={saving}
                className="bg-ink text-paper text-sm px-4 py-2 rounded-md disabled:opacity-50"
              >

                {saving
                  ? "Saving..."
                  : editingBalance
                    ? "Save Changes"
                    : "Add Balance"}

              </button>

            </div>

          </form>

        </div>

      )}

    </div>
  );
}