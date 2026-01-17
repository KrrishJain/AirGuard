import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../services/api"; // ✅ Added
import { useLocationContext } from "../context/LocationContext";
import LocationPickerMap from "../components/LocationPickerMap";

/* -------- Reverse Geocoding -------- */
const getLocationName = async (lat, lon) => {
  try {
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );

    return (
      data.address?.suburb ||
      data.address?.neighbourhood ||
      data.address?.city ||
      data.address?.town ||
      "Unknown Location"
    );
  } catch {
    return "Unknown Location";
  }
};

const Complaints = () => {
  const [complaints, setComplaints] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    complaintType: "dust",
    pollutant: "PM10",
    description: "",
    latitude: null,
    longitude: null,
  });
  const [locationName, setLocationName] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!form.latitude || !form.longitude) return;

    getLocationName(form.latitude, form.longitude).then((name) => {
      setLocationName(name);
    });
  }, [form.latitude, form.longitude]);

  /* -------- Get Current Location -------- */
  const { location } = useLocationContext();

  useEffect(() => {
    if (!location) return;

    setForm((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }, [location]);

  /* -------- Fetch Complaints -------- */
  const fetchComplaints = async () => {
    try {
      // ✅ Changed to use api instance
      const { data: json } = await api.get('/api/get-all-complaints');

      const enriched = await Promise.all(
        json.data.map(async (c) => {
          const locationName = await getLocationName(c.latitude, c.longitude);
          return { ...c, locationName };
        })
      );

      setComplaints(enriched);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  /* -------- Submit Complaint -------- */
  const submitComplaint = async () => {
    if (isSubmitting) return;

    if (!form.latitude || !form.longitude) {
      alert("Location not available yet.");
      return;
    }

    if (!form.description.trim()) {
      alert("Description is required");
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Changed to use api instance
      await api.post('/api/report-complaint', form, {
        headers: { "Content-Type": "application/json" }
      });

      setShowModal(false);
      setForm((prev) => ({ ...prev, description: "" }));
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!complaints) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-white text-3xl font-semibold">
            Pollution Complaints
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm"
          >
            Report Complaint
          </button>
        </div>

        {/* Complaints List */}
        {complaints.map((c) => (
          <div
            key={c.complaintId}
            className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/10"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-white text-xl font-semibold capitalize">
                  {c.complaintType} Complaint
                </h2>
                <p className="text-white/60 text-sm">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-white/70 text-sm">📍 {c.locationName}</div>
            </div>

            <p className="text-white/80 mb-5">{c.description}</p>

            <h3 className="text-white font-semibold mb-3">
              Likely Pollution Sources
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {c.rankedSites.map((site) => (
                <div
                  key={site.siteId}
                  className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                >
                  <div className="text-white font-semibold">{site.name}</div>
                  <div className="text-white/60 text-sm">
                    Distance: {site.distanceKm} km
                  </div>
                  <div className="text-white/60 text-sm">
                    Risk Score:{" "}
                    <span className="text-rose-400 font-semibold">
                      {site.riskScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-white/5 rounded-xl p-4 text-white/70 text-sm">
              {c.analysisSummary}
            </div>
          </div>
        ))}
      </div>

      {/* -------- Modal -------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-semibold">
                Report Pollution Complaint
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <select
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
              value={form.complaintType}
              onChange={(e) =>
                setForm({ ...form, complaintType: e.target.value })
              }
            >
              <option value="dust">Dust</option>
              <option value="smoke">Smoke</option>
              <option value="odor">Odor</option>
            </select>

            <select
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
              value={form.pollutant}
              onChange={(e) =>
                setForm({ ...form, pollutant: e.target.value })
              }
            >
              <option value="PM10">PM10</option>
              <option value="PM2.5">PM2.5</option>
              <option value="CO">CO</option>
            </select>

            <textarea
              placeholder="Describe the issue"
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="flex items-center justify-between mb-4">
              <div className="text-white/70 text-sm">
                📍 {locationName || "Detecting location..."}
              </div>

              <button
                onClick={() => {
                  if (!form.latitude || !form.longitude) {
                    alert("Location not ready yet. Please wait.");
                    return;
                  }
                  setShowMapPicker(true);
                }}
                className="text-emerald-400 hover:text-emerald-300 text-sm"
              >
                Change
              </button>

              {showMapPicker && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-gray-900 rounded-2xl p-4 w-full max-w-lg h-[420px] border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-semibold">
                        Select Complaint Location
                      </h3>
                      <button
                        onClick={() => setShowMapPicker(false)}
                        className="text-white/60 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <LocationPickerMap
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
                        setShowMapPicker(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>

              <button
                onClick={submitComplaint}
                disabled={isSubmitting || !form.latitude || !form.longitude}
                className={`px-4 py-2 rounded text-white transition ${
                  isSubmitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-rose-500 hover:bg-rose-600"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;