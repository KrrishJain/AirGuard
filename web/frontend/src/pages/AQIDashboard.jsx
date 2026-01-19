import { useEffect, useState } from "react";
import MainAQICard from "../components/MainAQICard";
import MajorPollutants from "../components/MajorPollutants";
import AQIHistoryChart from "../components/AQIHistoryChart";
import { useLocationContext } from "../context/LocationContext";
import { api } from "../services/api";
import axios from "axios";

const AQIDashboard = () => {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aqiError, setAqiError] = useState("");

  // manual location search (simple)
  const [manualQuery, setManualQuery] = useState("");
  const [manualError, setManualError] = useState("");

  const { location, setLocation, error, requestLocation, setError } = useLocationContext();

  useEffect(() => {
    if (!location) return;
    fetchAQIData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const fetchAQIData = async () => {
    try {
      setLoading(true);
      
      setAqiError("");

      const res = await api.get("/current-aqi", {
        params: { lat: location.latitude, lng: location.longitude },
      });

      setAqiData(res.data);
    } catch (err) {
      console.error("AQI fetch error:", err);
      setAqiData(null);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load AQI data.";

      setAqiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const searchManualLocation = async () => {
    const q = manualQuery.trim();
    if (!q) return;

    setManualError("");

    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q, format: "json", limit: 1 },
        timeout: 8000,
      });

      if (!res.data?.length) {
        setManualError("No location found");
        return;
      }

      const place = res.data[0];

      setLocation({
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        label: place.display_name,
      });
      setError(null); 
      setManualQuery("");
    } catch (e) {
      setManualError("Remember to type correct location");
    }
  };

  if (error) {
    return (
      <div className="min-h-[75vh] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-700/60 shadow-xl p-6">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
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

          <p className="mt-2 text-sm text-slate-300 text-center leading-relaxed">
            We need your location to show the AQI and nearby pollution updates.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={requestLocation}
              className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition"
            >
              Sure, I’d like that
            </button>

            {/* simple manual search input below */}
            <div className="w-full rounded-xl bg-slate-800/60 border border-slate-700 p-3">
              <p className="text-xs text-slate-300 mb-2">Or search your location manually</p>

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

              {manualError && <p className="text-xs text-red-400 mt-2">{manualError}</p>}
            </div>

            <p className="text-xs text-slate-400 text-center">
              Tip: If you clicked “Block”, enable location in your browser site settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return <div className="text-slate-300 p-6">Getting your location...</div>;
  }

  if (loading && !aqiData) {
    return <div className="text-slate-300 p-6">Loading AQI...</div>;
  }

  if (!aqiData) {
    return <div className="text-red-400 p-6">{aqiError || "Failed to load AQI data."}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto py-8 space-y-8">
        <MainAQICard data={aqiData} onRefresh={fetchAQIData} loading={loading} />
        <MajorPollutants data={aqiData} />
        <AQIHistoryChart />
      </div>
    </div>
  );
};

export default AQIDashboard;
