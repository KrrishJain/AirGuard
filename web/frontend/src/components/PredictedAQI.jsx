import React, { useEffect, useState } from "react";
import axios from "axios";

const PredictedAQI = () => {
  const [predictedAQI, setPredictedAQI] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPredictedAQI = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/predicted-aqi`
        );
        setPredictedAQI(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictedAQI();
  }, []);

  if (loading || !predictedAQI) return null;

  return (
    <div className="bg-gray-800/40 backdrop-blur-lg rounded-3xl p-6 mb-8 shadow-xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">
          AQI Forecast (Next 6 Hours)
        </h2>
        <span className="text-white/50 text-sm">ML Prediction</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* AQI */}
        <div>
          <div className="text-6xl font-bold text-rose-400">
            {Math.round(predictedAQI.predicted_aqi)}
          </div>
          <p className="text-white/60 text-sm mt-1">Expected AQI</p>
        </div>

        {/* Message */}
        <div>
          <div className="inline-block bg-rose-500/20 text-rose-300 px-4 py-2 rounded-xl text-lg font-semibold">
            Very Unhealthy
          </div>
          <p className="text-white/60 text-sm mt-3">
            Air quality likely to worsen. Avoid outdoor activity.
          </p>
        </div>

        {/* Time */}
        <div className="text-white/70 text-sm">
          <p>
            Forecast Time:
            <br />
            <span className="text-white">
              {new Date(predictedAQI.prediction_time).toLocaleString()}
            </span>
          </p>
          <p className="mt-2">
            Generated:
            <br />
            <span className="text-white">
              {new Date(predictedAQI.created_at).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictedAQI;
