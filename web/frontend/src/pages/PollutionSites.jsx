import { useEffect, useState } from "react";
import axios from "axios";
import PollutionMap from "../utils/PollutionMap.jsx";
import { useLocationContext } from "../context/LocationContext";
import LocationPickerMap from "../components/LocationPickerMap";

/* ---------- short reverse geocode ---------- */
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return (
      data.address?.suburb ||
      data.address?.neighbourhood ||
      data.address?.city ||
      "Selected location"
    );
  } catch {
    return "Selected location";
  }
};

const PollutionSites = () => {
  const { location } = useLocationContext();

  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    siteType: "construction",
    emissionType: "PM10",
    latitude: null,
    longitude: null,
    locationLabel: "",
  });

  /* ---------- fetch sites ---------- */
  useEffect(() => {
    if (!location) return;

    const fetchSites = async () => {
      const res = await axios.get(
        "http://localhost:3001/api/get-pollution-site",
        {
          params: {
            lat: location.latitude,
            lng: location.longitude,
            radius: 30,
          },
        }
      );
      setSites(res.data.data);
    };

    fetchSites();
  }, [location]);

  /* ---------- open modal ---------- */
  const openModal = async () => {
    if (!location) return;

    const label = await reverseGeocode(
      location.latitude,
      location.longitude
    );

    setForm({
      name: "",
      siteType: "construction",
      emissionType: "PM10",
      latitude: location.latitude,
      longitude: location.longitude,
      locationLabel: label,
    });

    setShowModal(true);
  };

  /* ---------- submit site ---------- */
  const submitSite = async () => {
    if (submitting) return;

    if (!form.name || !form.latitude || !form.longitude) {
      alert("All fields + location required");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post("http://localhost:3001/api/add-pollution-site", {
        name: form.name,
        siteType: form.siteType,
        emissionType: form.emissionType,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      setShowModal(false);
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">
          Pollution Source Registry
        </h1>

        <button
          onClick={openModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl"
        >
          Register Pollution Site
        </button>
      </div>

      {/* MAP */}
      <PollutionMap
        location={location}
        sites={sites}
        selectedSiteId={selectedSiteId}
      />

      {/* CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl">
        {sites.map((site) => {
          const active = site.id === selectedSiteId;

          return (
            <div
              key={site.id}
              onClick={() => setSelectedSiteId(site.id)}
              className={`cursor-pointer rounded-xl p-4 border transition
                ${
                  active
                    ? "bg-emerald-500/20 border-emerald-400"
                    : "bg-slate-800/60 border-white/10 hover:border-white/30"
                } text-white`}
            >
              <div className="font-semibold text-lg">{site.name}</div>
              <div className="text-sm text-slate-300">
                Type: {site.siteType}
              </div>
              <div className="text-sm text-slate-300">
                Emission: {site.emissionType}
              </div>
              <div className="text-sm text-emerald-400 mt-1">
                Distance: {site.distance_km?.toFixed(2)} km
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- MODAL ---------- */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-semibold">
                Register Pollution Site
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* LOCATION PICKER */}
            <LocationPickerMap
              lat={form.latitude}
              lng={form.longitude}
              onPick={async (lat, lng) => {
                const label = await reverseGeocode(lat, lng);
                setForm((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                  locationLabel: label,
                }));
              }}
            />

            <div className="text-sm mb-3">
  {form.locationLabel ? (
    <span className="text-emerald-400">
      📍 {form.locationLabel}
    </span>
  ) : (
    <span className="text-white/60 animate-pulse">
      Detecting location...
    </span>
  )}
</div>


            <input
              placeholder="Site name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
            />

            <select
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
              value={form.siteType}
              onChange={(e) =>
                setForm({ ...form, siteType: e.target.value })
              }
            >
              <option value="construction">Construction</option>
              <option value="industry">Industry</option>
              <option value="traffic">Traffic</option>
              <option value="waste">Waste</option>
            </select>

            <select
              className="w-full mb-5 p-2 rounded bg-gray-700 text-white"
              value={form.emissionType}
              onChange={(e) =>
                setForm({ ...form, emissionType: e.target.value })
              }
            >
              <option value="PM10">PM10</option>
              <option value="PM2.5">PM2.5</option>
              <option value="CO">CO</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 px-4 py-2 rounded text-white"
              >
                Close
              </button>
              <button
                onClick={submitSite}
                disabled={submitting}
                className={`px-4 py-2 rounded text-white ${
                  submitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollutionSites;
