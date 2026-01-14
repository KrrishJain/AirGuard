import { FaSearch, FaMapMarkedAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useLocationContext } from "../context/LocationContext";
import LocationPickerMap from "../components/LocationPickerMap.jsx";

const Navbar = () => {
  const { location, setLocation } = useLocationContext();
  const [query, setQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const linkClass = ({ isActive }) =>
    `cursor-pointer ${
      isActive ? "text-emerald-400" : "hover:text-emerald-400"
    }`;

  const searchLocation = async (e) => {
    if (e.key !== "Enter" || !query.trim()) return;

    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: query,
        format: "json",
        limit: 1,
      },
    });

    if (!res.data.length) return;

    const place = res.data[0];

    setLocation({
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      label: place.display_name,
    });

    setQuery(""); // clears input, placeholder updates
  };

  return (
    <>
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-emerald-400">AirGuard</h1>

        <ul className="flex gap-6 text-sm font-medium">
          <li>
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/alerts" className={linkClass}>
              Alerts
            </NavLink>
          </li>
          <li>
            <NavLink to="/complaints" className={linkClass}>
              Complaints
            </NavLink>
          </li>
          <li>
            <NavLink to="/pollution-sites" className={linkClass}>
              Pollution Sites
            </NavLink>
          </li>
        </ul>

        {/* Location + Search */}
        <div className="flex items-center gap-3 bg-slate-800 px-3 py-2 rounded-lg max-w-[320px]">
          <FaSearch className="text-slate-400 text-sm shrink-0" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={searchLocation}
            placeholder={location?.label || "Search location"}
            className="bg-transparent outline-none text-sm ml-2 w-44 text-white"
          />

          <FaMapMarkedAlt
            onClick={() => setShowMap(true)}
            className="cursor-pointer text-slate-400 hover:text-emerald-400 shrink-0"
            title="Pick from map"
          />
        </div>
      </nav>

      {showMap && <LocationPickerMap onClose={() => setShowMap(false)} />}
    </>
  );
};

export default Navbar;
