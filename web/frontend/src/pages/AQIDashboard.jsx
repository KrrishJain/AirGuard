import axios from "axios";
import { useEffect, useState } from "react";
import MainAQICard from "../components/MainAQICard";
import MajorPollutants from "../components/MajorPollutants";
import AQIHistoryChart from "../components/AQIHistoryChart";
import { useLocationContext } from "../context/LocationContext";

const AQIDashboard = () => {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { location, error } = useLocationContext();

  useEffect(() => {
    if (!location) return;
    fetchAQIData();
  }, [location]);

  const fetchAQIData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/current-aqi`, {
        params: {
          lat: location.latitude,
          lng: location.longitude,
        },
      });
      setAqiData(res.data);
    } catch (err) {
      console.error("AQI fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-400 p-6">{error}</div>;
  }

  if (!aqiData) return null;

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
