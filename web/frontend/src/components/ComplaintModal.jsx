// src/components/ComplaintModal.jsx
import { useEffect, useState } from "react";
import LocationPickerMap from "../utils/LocationPickerMap";
import { geocodePlace, reverseGeocode } from "../utils/geocoding";

const ComplaintModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isSubmitting,
}) => {
  const [locationName, setLocationName] = useState("Detecting location...");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!form.latitude || !form.longitude) return;

    reverseGeocode(form.latitude, form.longitude).then((name) => {
      setLocationName(name || "Unknown location");
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* ✅ modal shell */}
      <div className="w-full max-w-5xl max-h-[80vh] bg-gray-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* ✅ header fixed */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white text-xl font-semibold">
            Report Pollution Complaint
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* ✅ body scroll (clean) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 modal-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm">Complaint Type</label>
                <select
                  className="w-full mt-2 p-3 rounded-xl bg-gray-700 text-white outline-none border border-white/10"
                  value={form.complaintType}
                  onChange={(e) =>
                    setForm({ ...form, complaintType: e.target.value })
                  }
                >
                  <option value="dust">Dust</option>
                  <option value="smoke">Smoke</option>
                  <option value="odor">Odor</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 text-sm">Pollutant</label>
                <select
                  className="w-full mt-2 p-3 rounded-xl bg-gray-700 text-white outline-none border border-white/10"
                  value={form.pollutant}
                  onChange={(e) => setForm({ ...form, pollutant: e.target.value })}
                >
                  <option value="PM10">PM10</option>
                  <option value="PM2.5">PM2.5</option>
                  <option value="CO">CO</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 text-sm">Description</label>
                <textarea
                  placeholder="Describe the issue..."
                  className="w-full mt-2 p-3 rounded-xl bg-gray-700 text-white outline-none border border-white/10 min-h-[170px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gray-600 hover:bg-gray-500 text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={onSubmit}
                  disabled={isSubmitting || !form.latitude || !form.longitude}
                  className={`px-5 py-2.5 rounded-xl text-white transition ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-rose-500 hover:bg-rose-600"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
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
                Tip: Click on the map to change the complaint location.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ clean scrollbar (hidden) */}
      <style>{`
        .modal-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .modal-scroll::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
      `}</style>
    </div>
  );
};

export default ComplaintModal;
