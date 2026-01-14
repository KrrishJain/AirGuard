import React from "react";
import PredictedAQI from "../components/PredictedAQI";
import WindRiskAnalysis from "../components/WindRiskAnalysis";

const Alert = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto my-8 space-y-6">
        <PredictedAQI />
        <WindRiskAnalysis />
      </div>
    </div>
  );
};

export default Alert;
