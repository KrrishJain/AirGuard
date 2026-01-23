import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useLocationContext } from "../context/LocationContext";
import { reverseGeocode } from "../utils/geocoding";
import ComplaintModal from "../components/ComplaintModal";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { location } = useLocationContext();

  useEffect(() => {
    if (!location) return;
    setForm((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }, [location]);

  const fetchComplaints = async () => {
    try {
      const { data: json } = await api.get("/get-all-complaints");

      const enriched = await Promise.all(
        json.data.map(async (c) => {
          const locationName = await reverseGeocode(c.latitude, c.longitude);
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

      await api.post("/report-complaint", form, {
        headers: { "Content-Type": "application/json" },
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
      {/* ✅ remove side padding on mobile, keep on bigger screens */}
      <div className="max-w-7xl mx-auto lg:px-6 py-6 sm:py-8 space-y-6">
        {/* ✅ better mobile header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-0">
          <h1 className="text-white text-2xl sm:text-3xl font-semibold">
            Pollution Complaints
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm w-fit"
          >
            Report Complaint
          </button>
        </div>

        {/* ✅ cards padding only on mobile */}
        <div className=" sm:px-0 space-y-6">
          {complaints.map((c) => (
            <div
              key={c.complaintId}
              className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-5 sm:p-6 shadow-xl border border-white/10"
            >
              <div className="flex justify-between items-start mb-3 gap-4">
                <div>
                  <h2 className="text-white text-lg sm:text-xl font-semibold capitalize">
                    {c.complaintType} Complaint
                  </h2>
                  <p className="text-white/60 text-sm">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-white/70 text-sm text-right max-w-[45%] truncate">
                  📍 {c.locationName}
                </div>
              </div>

              <p className="text-white/80 mb-5">{c.description}</p>

              <h3 className="text-white font-semibold mb-3">
                Likely Pollution Sources
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      <ComplaintModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={submitComplaint}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Complaints;
