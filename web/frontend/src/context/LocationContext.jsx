// src/context/LocationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Current Location",
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, error }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
