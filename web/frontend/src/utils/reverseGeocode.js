import axios from "axios";

export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    const addr = res.data?.address;

    return (
      addr?.suburb ||
      addr?.neighbourhood ||
      addr?.city_district ||
      addr?.city ||
      "Selected location"
    );
  } catch {
    return "Selected location";
  }
};
