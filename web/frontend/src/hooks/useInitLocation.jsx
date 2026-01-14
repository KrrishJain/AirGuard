import { useEffect } from "react";
import { useLocationContext } from "../context/LocationContext";

const useInitLocation = () => {
  const { location, setLocation } = useLocationContext();

  useEffect(() => {
    if (location) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Current Location",
        });
      },
      () => {
        console.error("Location permission denied");
      },
      { enableHighAccuracy: true }
    );
  }, [location, setLocation]);
};

export default useInitLocation;
