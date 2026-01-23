import { useState } from "react";
import { useLocationContext } from "../context/LocationContext";
import { geocodePlace } from "../utils/geocoding"; // ✅ add

const LocationGate = ({ children }) => {
  const { error, setLocation, setError } = useLocationContext();

  const [manualQuery, setManualQuery] = useState("");
  const [manualError, setManualError] = useState("");

  const searchManualLocation = async () => {
    const place = await geocodePlace(manualQuery);

    if (!place) {
      setManualError("No location found");
      return;
    }

    setManualError("");
    setLocation(place);
    setError(null);
    setManualQuery("");
  };

  if (!error) return children;

  return (
    <div className="min-h-[75vh] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-700/60 shadow-xl p-6">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            className="text-emerald-400"
          >
            <path
              d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white text-center">
          Allow Location Access
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          <p className="mt-2 text-sm text-slate-300 text-center leading-relaxed">
            Location access is blocked. Click the{" "}
            <span className="text-white">lock icon</span> near the URL, set{" "}
            <span className="text-white">Location</span> to{" "}
            <span className="text-white">Allow</span>, then refresh this page —
            or search your area manually below.
          </p>

          <div className="w-full rounded-xl bg-slate-800/60 border border-slate-700 p-3">
            <p className="text-xs text-slate-300 mb-2">Or search manually</p>

            <input
              value={manualQuery}
              onChange={(e) => {
                setManualQuery(e.target.value);
                if (manualError) setManualError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && searchManualLocation()}
              placeholder="Type city / area name..."
              className="w-full bg-transparent outline-none text-sm text-white"
            />

            {manualError && (
              <p className="text-xs text-red-400 mt-2">{manualError}</p>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center">
            Tip: If you clicked “Block”, enable location in your browser site
            settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationGate;
