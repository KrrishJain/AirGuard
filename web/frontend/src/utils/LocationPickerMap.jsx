import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = {
  latitude: 19.0760,   // Mumbai fallback
  longitude: 72.8777,
};

const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPickerMap = ({ initialLocation, onSelect }) => {
  const lat = initialLocation?.latitude;
  const lng = initialLocation?.longitude;

  // 🚨 HARD GUARD — DO NOT RENDER MAP UNTIL VALID COORDS
  if (typeof lat !== "number" || typeof lng !== "number") {
    return (
      <div className="h-full flex items-center justify-center text-white/60">
        Detecting location…
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      className="h-full w-full rounded-xl"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={[lat, lng]} />

      <ClickHandler onSelect={onSelect} />
    </MapContainer>
  );
};

export default LocationPickerMap;
