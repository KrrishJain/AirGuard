import { useEffect, useState } from "react";
import { api } from "../services/api";
import PollutionMap from "../components/PollutionMap.jsx";
import { useLocationContext } from "../context/LocationContext";
import PollutionSiteModal from "../components/PollutionSiteModal";
import { reverseGeocode } from "../utils/geocoding";

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

  const fetchSites = async () => {
    if (!location) return;

    const res = await api.get("/get-pollution-site", {
      params: { lat: location.latitude, lng: location.longitude, radius: 30 },
    });

    setSites(res.data.data);
  };

  useEffect(() => {
    fetchSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const openModal = async () => {
    if (!location) return;

    const label = await reverseGeocode(location.latitude, location.longitude);

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

  const submitSite = async () => {
    if (submitting) return;

    if (!form.name || !form.latitude || !form.longitude) {
      alert("All fields + location required");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/add-pollution-site", {
        name: form.name,
        siteType: form.siteType,
        emissionType: form.emissionType,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      setShowModal(false);
      await fetchSites();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ✅ remove side padding on mobile */}
      <div className="max-w-7xl mx-auto lg:px-6 py-6 sm:py-8 space-y-6">
        {/* ✅ responsive header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            Pollution Source Registry
          </h1>

          <button
            onClick={openModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl w-fit"
          >
            Register Pollution Site
          </button>
        </div>

        {/* ✅ map padding only on mobile */}
        <div className=" m:px-0">
          <PollutionMap
            location={location}
            sites={sites}
            selectedSiteId={selectedSiteId}
          />
        </div>

        {/* ✅ cards padding only on mobile */}
        <div className="sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl">
            {sites.map((site) => {
              const active = site.id === selectedSiteId;

              return (
                <div
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition ${
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
        </div>
      </div>

      <PollutionSiteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={submitSite}
        submitting={submitting}
      />
    </div>
  );
};

export default PollutionSites;
