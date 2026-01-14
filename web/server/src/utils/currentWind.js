// src/utils/wind.utils.js
import axios from "axios";

const degreeToCompass = (deg) => {
  const directions = [
    "N","NNE","NE","ENE",
    "E","ESE","SE","SSE",
    "S","SSW","SW","WSW",
    "W","WNW","NW","NNW"
  ];
  return directions[Math.round(deg / 22.5) % 16];
};

const toCardinalShort = (compass) => compass[0]; // N/E/S/W

export const fetchCurrentWind = async (lat, lon) => {
  const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: {
      lat,
      lon,
      appid: process.env.OPENWEATHER_API_KEY,
      units: "metric",
    },
  });

  const speed = res.data.wind.speed;
  const deg = res.data.wind.deg;
  const compass = degreeToCompass(deg);

  return {
    speed,
    deg,
    direction: `${compass} ${deg}°`,
    direction_short: toCardinalShort(compass),
  };
};
