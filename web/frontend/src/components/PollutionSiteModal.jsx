import { useEffect, useState } from "react";
import LocationPickerMap from "../utils/LocationPickerMap";
import { geocodePlace, reverseGeocode } from "../utils/geocoding";

const PollutionSiteModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  submitting,
}) => {
  const [locationName, setLocationName] = useState("Detecting location...");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!form.latitude || !form.longitude) return;

    reverseGeocode(form.latitude, form.longitude).then((name) => {
      setLocationName(name || "Selected location");
    });
  }, [isOpen, form.latitude, form.longitude]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q || searchLoading) return;

    setSearchError("");

    try {
      setSearchLoading(true);
      const place = await geocodePlace(q);

      if (!place) {
        setSearchError("No location found");
        return;
      }

      setForm((prev) => ({
        ...prev,
        latitude: place.latitude,
        longitude: place.longitude,
      }));

      setLocationName(place.label || "Selected location");
      setSearchQuery("");
    } catch {
      setSearchError("Search failed. Try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
      {/* shell */}
      <div className="w-full max-w-5xl max-h-[80vh] bg-gray-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* header fixed */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white text-xl font-semibold">
            Register Pollution Site
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* body scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-6 modal-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm">Site Name</label>
                <input
                  placeholder="e.g. ABC Construction"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-2 p-3 rounded-xl bg-gray-700 text-white outline-none border border-white/10"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm">Site Type</label>
                <select
                  className="w-full mt-2 p-3 rounded-xl bg-gray-700 text-white outline-none border border-white/10"
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
              </div>

              <div>
                <label className="text-white/70 text-sm">Emission Type</label>
                <select
                  className="w-full mt-2 p-3 rounded-xl bg-gray-700 text-white outline-none border border-white/10"
                  value={form.emissionType}
                  onChange={(e) =>
                    setForm({ ...form, emissionType: e.target.value })
                  }
                >
                  <option value="PM10">PM10</option>
                  <option value="PM2.5">PM2.5</option>
                  <option value="CO">CO</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gray-600 hover:bg-gray-500 text-white"
                >
                  Close
                </button>

                <button
                  onClick={onSubmit}
                  disabled={
                    submitting || !form.name || !form.latitude || !form.longitude
                  }
                  className={`px-5 py-2.5 rounded-xl text-white transition ${
                    submitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <div>
                <p className="text-white/70 text-sm">Selected Location</p>
                <p className="text-white text-sm mt-1">📍 {locationName}</p>
                <p className="text-white/50 text-xs mt-1">
                  Lat: {form.latitude ?? "-"} , Lng: {form.longitude ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-700/30 border border-white/10 p-3">
                <div className="flex items-center gap-2">
                  <div className="text-white/50 text-sm">🔎</div>

                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (searchError) setSearchError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search city / area..."
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                    disabled={searchLoading}
                  />

                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {searchLoading ? "..." : "Go"}
                  </button>
                </div>

                {searchError && (
                  <p className="text-xs text-red-400 mt-2">{searchError}</p>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 bg-gray-900 h-[280px] sm:h-[320px] lg:h-[420px]">
                <LocationPickerMap
                  key={`${form.latitude}-${form.longitude}`}
                  initialLocation={{
                    latitude: form.latitude,
                    longitude: form.longitude,
                  }}
                  onSelect={(lat, lng) => {
                    setForm((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }));
                  }}
                />
              </div>

              <p className="text-xs text-white/40">
                Tip: Click on the map to set the pollution site location.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .modal-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .modal-scroll::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
      `}</style>
    </div>
  );
};

export default PollutionSiteModal;
