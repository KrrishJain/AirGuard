import { fmt } from "../utils/format.js";

const MajorPollutants = ({ data }) => {
  const pollutants = [
    { name: "PM2.5", value: data.pm25, unit: "µg/m³" },
    { name: "PM10", value: data.pm10, unit: "µg/m³" },
    { name: "CO", value: data.mq135, unit: "ppb" },
    { name: "SO₂", value: 10, unit: "ppb" },
    { name: "NO₂", value: 20, unit: "ppb" },
    { name: "O₃", value: 18, unit: "ppb" },
  ];

  return (
    <div className="bg-gray-800/50 rounded-3xl p-8">
      <h2 className="text-white text-2xl mb-6">Major Air Pollutants</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {pollutants.map((p, i) => (
          <div key={i} className="bg-gray-700/50 rounded-xl p-4">
            <div className="text-white/70 text-sm">{p.name}</div>
            <div className="text-white text-2xl font-bold">
              {fmt(p.value)}
            </div>
            <div className="text-white/50 text-xs">{p.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MajorPollutants;
