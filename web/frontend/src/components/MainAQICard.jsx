import { useEffect, useState } from "react";
import { RefreshCw, MapPin, Cloud, Droplets, Wind, Sun } from "lucide-react";
import { fmt } from "../utils/format.js";
import { getAQICategory } from "../utils/AqiCategory.jsx";

const MainAQICard = ({ data, onRefresh, loading }) => {
  const category = getAQICategory(data.aqi);
  const [locationName, setLocationName] = useState("Detecting location...");

  // 🔹 reverse geocode lat/lng → location name
  useEffect(() => {
    if (!data?.latitude || !data?.longitude) return;

    const fetchLocationName = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}`
        );
        const geo = await res.json();

        const address = geo.address || {};
        const name =
          address.suburb ||
          address.neighbourhood ||
          address.city_district ||
          address.city ||
          address.town ||
          address.village ||
          "Unknown location";

        const state = address.state || "";

        setLocationName(
          state ? `${name}, ${state}` : name
        );
      } catch (err) {
        console.error("Reverse geocode failed:", err);
        setLocationName("Unknown location");
      }
    };

    fetchLocationName();
  }, [data.latitude, data.longitude]);

  return (
    <div
      className={`bg-gradient-to-br ${category.color} rounded-3xl p-8 shadow-2xl relative`}
    >
      <div className="flex justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            {locationName}
          </div>

          <h1 className="text-white text-2xl font-semibold mt-1">
            Real-time Air Quality Index (AQI)
          </h1>

          <p className="text-white/70 text-sm">
            Last Updated: {new Date(data.time).toLocaleString()}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="bg-white/20 hover:bg-white/30 text-white px-4  rounded-full"
        >
          <RefreshCw className={`${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* LEFT */}
        <div>
          <div className="text-8xl font-bold text-white">
            {fmt(data.aqi, 0)}
          </div>

          <div className="text-3xl font-semibold text-white mt-2">
            {category.label}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-white">
            <div>
              <div className="text-white/70 text-sm">PM10</div>
              <div className="text-2xl">{fmt(data.pm10)} µg/m³</div>
            </div>
            <div>
              <div className="text-white/70 text-sm">PM2.5</div>
              <div className="text-2xl">{fmt(data.pm25)} µg/m³</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <Cloud className="w-10 h-10 text-white" />
            <div>
              <div className="text-4xl text-white">
                {fmt(data.temperature)}°C
              </div>
              <div className="text-white/70">Overcast</div>
            </div>
          </div>

          <div className="grid grid-cols-3 text-white text-center">
            <div>
              <Droplets className="mx-auto mb-2" />
              {fmt(data.humidity)}%
            </div>
            <div>
              <Wind className="mx-auto mb-2" />
              {fmt(data.wind_speed)} km/h
            </div>
            <div>
              <Sun className="mx-auto mb-2" />
              5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAQICard;
