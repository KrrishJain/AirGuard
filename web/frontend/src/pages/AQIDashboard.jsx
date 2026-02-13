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

  const { location, setLocation, error, requestLocation, setError } =
    useLocationContext();

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

  if (!location) {
    return <div className="text-slate-300 p-6">Getting your location...</div>;
  }

  if (loading && !aqiData) {
    return <div className="text-slate-300 p-6">Loading AQI...</div>;
  }

  if (!aqiData) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="max-w-md w-full rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md p-5 text-center shadow-lg">
          <p className="text-red-400 font-semibold text-lg mb-1">
            Unable to load AQI data
          </p>

          <p className="text-red-300 text-sm">
            {aqiError ||
              "Since this is a prototype, AQI data is available only for the Matunga region. Please enter Matunga in the search location."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-8 space-y-8  sm:px-6">
        <MainAQICard
          data={aqiData}
          onRefresh={fetchAQIData}
          loading={loading}
        />
        <MajorPollutants data={aqiData} />
        {/* <AQIHistoryChart /> */}
      </div>
    </div>
  );
};

export default AQIDashboard;
