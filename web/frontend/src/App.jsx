import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LocationGate from "./components/LocationGate";
import AQIDashboard from "./pages/AQIDashboard";
import Complaints from "./pages/Complaints";
import PollutionSites from "./pages/PollutionSites";
import Alert from "./pages/Alert";
import useInitLocation from "./hooks/useInitLocation";

const App = () => {
  useInitLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      {/* 🔹 Fixed width wrapper */}
      <main className="max-w-7xl mx-auto px-5 py-6">
        <LocationGate>
          <Routes>
            <Route path="/" element={<AQIDashboard />} />
            <Route path="/alerts" element={<Alert />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/pollution-sites" element={<PollutionSites />} />
          </Routes>
        </LocationGate>
      </main>
    </div>
  );
};

export default App;
