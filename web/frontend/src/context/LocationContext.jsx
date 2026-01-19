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
        if (err.code === 1) setError("Please allow location access to show your current AQI.");
        else setError("Couldn’t get your location. Please try again.");
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, error, setError, requestLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
