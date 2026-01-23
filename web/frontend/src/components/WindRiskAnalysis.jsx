import React, { useEffect, useState } from "react";
import { FaWind, FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineDangerous } from "react-icons/md";
import { api } from "../services/api"; // ✅ Added

const WindRiskAnalysis = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchWindRisk = async () => {
      try {
        // ✅ Changed to use api instance
        const { data: result } = await api.get("/wind-risk-analysis");
        setData(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWindRisk();
  }, []);

  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-lg rounded-3xl p-6 mb-8 shadow-2xl border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaWind className="text-blue-400 text-2xl" />
        <h2 className="text-white text-2xl font-semibold">
          Wind Risk Impact Analysis
        </h2>
      </div>

      {/* Source AQI */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-white/70 text-sm">Source AQI</span>
        <span className="text-5xl font-bold text-rose-400">
          {data.source_aqi}
        </span>
      </div>

      {/* Affected Locations */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-4">
          Affected Nearby Locations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.affected_locations.map((loc, idx) => (
            <div
              key={idx}
              className="bg-white/10 rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <FaMapMarkerAlt className="text-blue-400" />
                <span className="text-white font-semibold">{loc.name}</span>
              </div>

              <div className="text-white/70 text-sm">
                Distance: {loc.distance_km} km
              </div>

              <div className="text-white/70 text-sm">
                Risk Score:{" "}
                <span className="text-rose-400 font-semibold">
                  {loc.risk_score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence & Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <MdOutlineDangerous className="text-yellow-400" />
            <span className="text-white font-semibold">
              Prediction Confidence
            </span>
          </div>
          <p className="text-white/70 text-sm">{data.confidence}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <span className="text-white font-semibold">Assumptions</span>
          <p className="text-white/70 text-sm mt-1">{data.assumptions}</p>
        </div>
      </div>
    </div>
  );
};

export default WindRiskAnalysis;
