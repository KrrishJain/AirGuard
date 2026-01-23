import { useEffect, useState } from "react";
import { RefreshCw, MapPin, Cloud, Droplets, Wind, Sun } from "lucide-react";
import { fmt } from "../utils/format.js";
import { getAQICategory } from "../utils/AqiCategory.jsx";
import { reverseGeocode } from "../utils/geocoding";

const MainAQICard = ({ data, onRefresh, loading }) => {
  const category = getAQICategory(data.aqi);
  const [locationName, setLocationName] = useState("Detecting location...");

  useEffect(() => {
    if (!data?.latitude || !data?.longitude) return;
    reverseGeocode(data.latitude, data.longitude).then(setLocationName);
  }, [data?.latitude, data?.longitude]);

  return (
    <div
      className={`bg-gradient-to-br ${category.color} rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{locationName}</span>
          </div>

          <h1 className="text-white font-semibold mt-1 text-lg sm:text-xl lg:text-2xl leading-snug">
            Real-time Air Quality Index (AQI)
          </h1>

          <p className="text-white/70 text-xs sm:text-sm">
            Last Updated: {new Date(data.time).toLocaleString()}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="bg-white/20 hover:bg-white/30 text-white p-3 sm:p-4 rounded-2xl shrink-0"
        >
          <RefreshCw className={`${loading ? "animate-spin" : ""} w-5 h-5`} />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* LEFT */}
        <div>
          <div className="font-bold text-white text-6xl sm:text-7xl lg:text-8xl">
            {fmt(data.aqi, 0)}
          </div>

          <div className="font-semibold text-white mt-2 text-2xl sm:text-3xl">
            {category.label}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 text-white">
            <div>
              <div className="text-white/70 text-xs sm:text-sm">PM10</div>
              <div className="text-lg sm:text-2xl">{fmt(data.pm10)} µg/m³</div>
            </div>
            <div>
              <div className="text-white/70 text-xs sm:text-sm">PM2.5</div>
              <div className="text-lg sm:text-2xl">{fmt(data.pm25)} µg/m³</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-5">
            <Cloud className="w-9 h-9 sm:w-10 sm:h-10 text-white shrink-0" />
            <div>
              <div className="text-3xl sm:text-4xl text-white">
                {fmt(data.temperature)}°C
              </div>
              <div className="text-white/70 text-sm">Overcast</div>
            </div>
          </div>

          <div className="grid grid-cols-3 text-white text-center text-sm sm:text-base">
            <div>
              <Droplets className="mx-auto mb-2 w-5 h-5 sm:w-6 sm:h-6" />
              {fmt(data.humidity)}%
            </div>
            <div>
              <Wind className="mx-auto mb-2 w-5 h-5 sm:w-6 sm:h-6" />
              {fmt(data.wind_speed)} km/h
            </div>
            <div>
              <Sun className="mx-auto mb-2 w-5 h-5 sm:w-6 sm:h-6" />5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAQICard;
