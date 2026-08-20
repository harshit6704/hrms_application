import { useState } from "react";
import { punchIn, punchOut } from "../../services/attendanceService.js";
import { getErrorMessage } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import PageHeader from "../../components/PageHeader.jsx";

// "idle" | "locating" | "submitting" | "done"
function useGeoAction(action, toast, onDone) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  function run() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported by this browser.");
      return;
    }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setState("submitting");
        try {
          const { latitude, longitude } = position.coords;
          const result = await action(latitude, longitude);
          setState("done");
          toast.success("Success.");
          onDone?.(result);
        } catch (err) {
          setError(getErrorMessage(err));
          setState("idle");
        }
      },
      (geoErr) => {
        setState("idle");
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError("Location permission denied. Please allow location access to punch in/out.");
        } else {
          setError("Couldn't get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return { run, state, error };
}

export default function PunchClock() {
  const toast = useToast();
  const [lastResult, setLastResult] = useState(null);

  const punchInAction = useGeoAction(punchIn, toast, (r) => setLastResult({ type: "in", data: r }));
  const punchOutAction = useGeoAction(punchOut, toast, (r) => setLastResult({ type: "out", data: r }));

  function label(state, base) {
    if (state === "locating") return "Getting location…";
    if (state === "submitting") return `${base}…`;
    return base;
  }

  return (
    <div>
      <PageHeader title="Punch Clock" subtitle="Punch in and out using your current location" />

      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <div className="ledger-card p-6 text-center">
          <p className="font-display text-lg mb-4">Punch In</p>
          <button
            onClick={punchInAction.run}
            disabled={punchInAction.state === "locating" || punchInAction.state === "submitting"}
            className="w-full bg-(--color-present) text-paper rounded-md py-3 text-sm font-medium disabled:opacity-60"
          >
            {label(punchInAction.state, "Punch In")}
          </button>
          {punchInAction.error && <p className="text-xs text-(--color-absent) mt-2">{punchInAction.error}</p>}
        </div>

        <div className="ledger-card p-6 text-center">
          <p className="font-display text-lg mb-4">Punch Out</p>
          <button
            onClick={punchOutAction.run}
            disabled={punchOutAction.state === "locating" || punchOutAction.state === "submitting"}
            className="w-full bg-stamp text-paper rounded-md py-3 text-sm font-medium disabled:opacity-60"
          >
            {label(punchOutAction.state, "Punch Out")}
          </button>
          {punchOutAction.error && <p className="text-xs text-(--color-absent) mt-2">{punchOutAction.error}</p>}
        </div>
      </div>

      {lastResult && (
        <div className="ledger-card p-4 mt-6 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-wide text-(--color-ink-faint) mb-2">
            Last {lastResult.type === "in" ? "punch-in" : "punch-out"} response
          </p>
          <pre className="text-xs font-mono whitespace-pre-wrap break-all text-ink-soft">
            {JSON.stringify(lastResult.data, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
