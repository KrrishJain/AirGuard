// src/context/LocationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Current Location",
        });
      },
      (err) => {
        if (err.code === 1) {
          setError(
            "Location is blocked in your browser. Please enable it from Site Settings (lock icon near the URL) and refresh.",
          );
        } else {
          setError("Couldn’t get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, error, requestLocation }} // ✅ expose retry
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
