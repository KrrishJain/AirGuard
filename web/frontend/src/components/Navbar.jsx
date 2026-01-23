import { FaSearch } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useLocationContext } from "../context/LocationContext";
import { geocodePlace } from "../utils/geocoding"; // ✅ use utility

const Navbar = () => {
  const { location, setLocation } = useLocationContext();
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const linkClass = ({ isActive }) =>
    `cursor-pointer ${
      isActive ? "text-emerald-400" : "hover:text-emerald-400"
    }`;

  const searchLocation = async (e) => {
    if (e.key !== "Enter") return;

    const place = await geocodePlace(query);

    if (!place) {
      setSearchError("No location found");
      return;
    }

    setSearchError("");
    setLocation(place);
    setQuery("");
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

        <div className="flex flex-col">
          <div className="flex items-center gap-3 bg-slate-800 px-3 py-2 rounded-lg max-w-[320px]">
            <FaSearch className="text-slate-400 text-sm shrink-0" />

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (searchError) setSearchError("");
              }}
              onKeyDown={searchLocation}
              placeholder={location?.label || "Search location"}
              className="bg-transparent outline-none text-sm ml-2 w-44 text-white"
            />
          </div>

          {searchError && (
            <p className="text-xs text-red-400 mt-1">{searchError}</p>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
