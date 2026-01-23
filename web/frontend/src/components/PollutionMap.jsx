import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FaIndustry,
  FaHardHat,
  FaCarSide,
  FaTrash,
} from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import { useLocationContext } from "../context/LocationContext";

/* fix marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* helpers */
const getIconComponent = (type) => {
  switch (type) {
    case "construction":
      return FaHardHat;
    case "traffic":
      return FaCarSide;
    case "waste":
      return FaTrash;
    default:
      return FaIndustry;
  }
};

const getColor = (distance, active) => {
  if (active) return "#22c55e";
  if (distance <= 3) return "#ef4444";
  if (distance <= 8) return "#f59e0b";
  return "#3b82f6";
};

const createIcon = (Icon, color) =>
  L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `
      <div style="
        width:32px;
        height:32px;
        background:${color};
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid white;
        box-shadow:0 0 12px ${color};
      ">
        ${renderToStaticMarkup(<Icon size={16} color="white" />)}
      </div>
    `,
  });

/* focus map on selected site */
const FocusOnSite = ({ site }) => {
  const map = useMap();

  useEffect(() => {
    if (site) {
      map.setView([site.latitude, site.longitude], 15, {
        animate: true,
      });
    }
  }, [site, map]);

  return null;
};

const MapClickHandler = () => {
  const { setLocation } = useLocationContext();

  useMapEvents({
    click(e) {
      setLocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        label: "Selected from map",
      });
    },
  });

  return null;
};

const PollutionMap = ({ location, sites, selectedSiteId }) => {
  if (!location) return null;

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl">
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />

        {selectedSite && <FocusOnSite site={selectedSite} />}

        {/* user */}
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>Your Location</Popup>
        </Marker>

        <Circle
          center={[location.latitude, location.longitude]}
          radius={30000}
          pathOptions={{ color: "#22c55e", fillOpacity: 0.08 }}
        />

        {/* sites */}
        {sites.map((site) => {
          const Icon = getIconComponent(site.siteType);
          const active = site.id === selectedSiteId;

          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={createIcon(
                Icon,
                getColor(site.distance_km ?? 999, active)
              )}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{site.name}</strong>
                  <br />
                  {site.siteType} • {site.emissionType}
                  <br />
                  {site.distance_km?.toFixed(2)} km away
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PollutionMap;
