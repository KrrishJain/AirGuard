// src/utils/geocoding.js
import axios from "axios";

// Name -> lat/lng
export const geocodePlace = async (query) => {
  const q = (query || "").trim();
  if (!q) return null;

  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q, format: "json", limit: 1 },
      timeout: 8000,
    });

    if (!res.data?.length) return null;

    const place = res.data[0];

    return {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      label: place.display_name,
    };
  } catch {
    return null;
  }
};

// lat/lng -> Name
export const reverseGeocode = async (lat, lon) => {
  try {
    const { data: geo } = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: { format: "json", lat, lon },
        timeout: 8000,
      }
    );

    const address = geo?.address || {};
    const name =
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.city ||
      address.town ||
      address.village ||
      "Unknown location";

    const state = address.state || "";

    return state ? `${name}, ${state}` : name;
  } catch {
    return "Unknown location";
  }
};
