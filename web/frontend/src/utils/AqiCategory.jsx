// src/utils/aqiCategory.js
export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { label: "Good", color: "from-green-400 to-green-600" };
  if (aqi <= 100) return { label: "Moderate", color: "from-yellow-400 to-yellow-600" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "from-orange-400 to-orange-600" };
  if (aqi <= 200) return { label: "Unhealthy", color: "from-red-400 to-red-600" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "from-purple-500 to-purple-700" };
  return { label: "Hazardous", color: "from-pink-600 to-red-800" };
};
