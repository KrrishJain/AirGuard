// src/utils/reverseGeocode.js
import axios from "axios";

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
