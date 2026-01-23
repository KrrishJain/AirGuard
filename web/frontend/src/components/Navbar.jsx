import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useLocationContext } from "../context/LocationContext";
import { geocodePlace } from "../utils/geocoding";

const Navbar = () => {
  const { location, setLocation } = useLocationContext();
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-base ${
      isActive
        ? "bg-emerald-500/10 text-emerald-400"
        : "text-white/90 hover:bg-white/5 hover:text-emerald-400"
    }`;

  const tabClass = ({ isActive }) =>
    `${isActive ? "text-emerald-400" : "hover:text-emerald-400"}`;

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
    setMenuOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white px-4 sm:px-6 py-4 relative z-50">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <h1 className="text-xl font-bold text-emerald-400 shrink-0">AirGuard</h1>

        {/* Center: Tabs (desktop >= 1024) */}
        <ul className="hidden lg:flex gap-6 text-sm font-medium flex-1 justify-center">
          <li><NavLink to="/" className={tabClass}>Home</NavLink></li>
          <li><NavLink to="/alerts" className={tabClass}>Alerts</NavLink></li>
          <li><NavLink to="/complaints" className={tabClass}>Complaints</NavLink></li>
          <li><NavLink to="/pollution-sites" className={tabClass}>Pollution Sites</NavLink></li>
        </ul>

        {/* Right: Search (desktop >= 1024) */}
        <div className="hidden lg:flex flex-col w-[320px]">
          <div className="flex items-center gap-3 bg-slate-800 px-3 py-2 rounded-lg">
            <FaSearch className="text-slate-400 text-sm shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (searchError) setSearchError("");
              }}
              onKeyDown={searchLocation}
              placeholder={location?.label || "Search location"}
              className="bg-transparent outline-none text-sm w-full text-white"
            />
          </div>
          {searchError && <p className="text-xs text-red-400 mt-1">{searchError}</p>}
        </div>

        {/* Hamburger for < 1024 */}
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 shrink-0"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile/Tablet Search (below top row, < 1024) */}
      <div className="lg:hidden mt-3 flex flex-col">
        <div className="flex items-center gap-3 bg-slate-800 px-3 py-2 rounded-lg w-full">
          <FaSearch className="text-slate-400 text-sm shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searchError) setSearchError("");
            }}
            onKeyDown={searchLocation}
            placeholder={location?.label || "Search location"}
            className="bg-transparent outline-none text-sm w-full text-white"
          />
        </div>
        {searchError && <p className="text-xs text-red-400 mt-1">{searchError}</p>}
      </div>

      {/* Standard dropdown menu for < 1024 */}
      {menuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[9998] bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          <div className="lg:hidden fixed top-[76px] left-0 right-0 z-[9999] px-4 sm:px-6">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-[slideDown_.18s_ease-out]">
              <div className="p-2">
                <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Home
                </NavLink>
                <NavLink to="/alerts" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Alerts
                </NavLink>
                <NavLink to="/complaints" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Complaints
                </NavLink>
                <NavLink to="/pollution-sites" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Pollution Sites
                </NavLink>
              </div>
            </div>

            <style>{`
              @keyframes slideDown {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
