import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import { api } from "../services/api"; // ✅ Added

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 shadow-xl">
      <p className="text-slate-300 text-xs">{label}</p>
      <p className="text-white font-semibold text-sm">
        AQI: {payload[0].value}
      </p>
    </div>
  );
};

const AQIHistoryChart = () => {
  const [chartData, setChartData] = useState(null);
  const [location, setLocation] = useState("");

  // reverse geocode lat/lng → area name
  const fetchLocationName = async (lat, lon) => {
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      return (
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.city ||
        data.address?.town ||
        "Unknown Area"
      );
    } catch {
      return "Unknown Area";
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // ✅ Changed to use api instance
        const { data } = await api.get('/aqi-history');

        // take every 2nd hour → 24hr span (2-hour interval)
        const filtered = data.data.filter((_, idx) => idx % 2 === 0);

        const formatted = filtered.map((d) => ({
          ...d,
          timeLabel: new Date(d.time).toLocaleTimeString("en-IN", {
            hour: "numeric",
            hour12: true,
          }),
        }));

        setChartData({
          min: data.min,
          max: data.max,
          data: formatted,
        });

        // location from first data point
        if (data.data.length) {
          const loc = await fetchLocationName(
            data.data[0].latitude,
            data.data[0].longitude
          );
          setLocation(loc);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, []);

  if (!chartData) return null;

  // dynamic bar width so bars always fill chart
  const barWidth = Math.max(10, 600 / chartData.data.length);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-white/10">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold">
            AQI – Last 24 Hours
          </h2>

          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
            <FaMapMarkerAlt className="text-emerald-400" />
            <span>{location}</span>
          </div>
        </div>

        <div className="text-sm space-x-4">
          <span className="text-emerald-400">
            Min: <b>{chartData.min}</b>
          </span>
          <span className="text-rose-400">
            Max: <b>{chartData.max}</b>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-6xl mx-auto">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.data} barCategoryGap="0%" barGap={0}>
              {/* Gradient */}
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="timeLabel"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />

              <YAxis stroke="#94a3b8" />

              <Tooltip content={<CustomTooltip />} cursor={false} />

              <Bar dataKey="aqi" fill="url(#aqiGradient)" barSize={barWidth} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AQIHistoryChart;