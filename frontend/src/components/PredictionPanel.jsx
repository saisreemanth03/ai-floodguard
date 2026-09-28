import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Droplets, 
  Mountain, 
  Compass, 
  CloudRain, 
  Thermometer, 
  Waves,
  Zap,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';
import { predictFloodRisk } from '../services/api';

const SCENARIOS = {
  highRisk: {
    name: "Monsoon Cloudburst / Urban Basin",
    label: "Sample High-Risk Scenario",
    type: "high",
    data: {
      rainfall: 165.0,
      river_level: 9.8,
      soil_moisture: 88.0,
      elevation: 22.0,
      historical_flood_frequency: 0.45,
      latitude: 25.594,
      longitude: 85.137,
      temperature: 28.0,
      humidity: 92.0,
      land_cover: "Urban",
      drainage_proximity: 0.4
    }
  },
  moderateRisk: {
    name: "Persistent Moderate Rain / Swelling Catchment",
    label: "Sample Moderate-Risk Scenario",
    type: "moderate",
    data: {
      rainfall: 72.0,
      river_level: 5.4,
      soil_moisture: 62.0,
      elevation: 65.0,
      historical_flood_frequency: 0.15,
      latitude: 35.149,
      longitude: -90.048,
      temperature: 22.5,
      humidity: 75.0,
      land_cover: "Agricultural",
      drainage_proximity: 2.1
    }
  },
  lowRisk: {
    name: "Dry Mountain Plateau / Well-Drained Forest",
    label: "Sample Low-Risk Scenario",
    type: "low",
    data: {
      rainfall: 12.0,
      river_level: 1.8,
      soil_moisture: 28.0,
      elevation: 480.0,
      historical_flood_frequency: 0.05,
      latitude: 47.497,
      longitude: 19.040,
      temperature: 19.0,
      humidity: 45.0,
      land_cover: "Forest",
      drainage_proximity: 8.5
    }
  }
};

export default function PredictionPanel({ onPredictionComplete }) {
  const [formData, setFormData] = useState(SCENARIOS.highRisk.data);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'land_cover' ? value : parseFloat(value) || 0
    }));
  };

  const loadScenario = (scenarioKey) => {
    const sc = SCENARIOS[scenarioKey];
    if (sc) {
      setFormData(sc.data);
      setErrorMessage(null);
    }
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await predictFloodRisk(formData);
      setResult(response);
      if (onPredictionComplete) {
        onPredictionComplete(response, formData);
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setErrorMessage(err.message || "Failed to calculate flood risk. Please check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColorTheme = (cat) => {
    switch (cat) {
      case 'Very High Risk':
        return {
          badge: 'bg-red-500/20 text-red-400 border-red-500/40 animate-danger-pulse',
          bar: 'bg-gradient-to-r from-red-600 to-rose-500',
          card: 'border-red-500/30 bg-red-950/20',
          text: 'text-red-400'
        };
      case 'High Risk':
        return {
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          bar: 'bg-gradient-to-r from-orange-600 to-amber-500',
          card: 'border-orange-500/30 bg-orange-950/20',
          text: 'text-orange-400'
        };
      case 'Moderate Risk':
        return {
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          bar: 'bg-gradient-to-r from-yellow-500 to-amber-400',
          card: 'border-amber-500/30 bg-amber-950/20',
          text: 'text-amber-400'
        };
      case 'Low Risk':
      default:
        return {
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          card: 'border-emerald-500/30 bg-emerald-950/20',
          text: 'text-emerald-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Scenario Presets Bar */}
      <div className="glass-panel p-4 rounded-xl border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Demo Scenarios:
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => loadScenario('highRisk')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Load Sample High-Risk Scenario</span>
          </button>

          <button
            type="button"
            onClick={() => loadScenario('moderateRisk')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Load Sample Moderate-Risk Scenario</span>
          </button>

          <button
            type="button"
            onClick={() => loadScenario('lowRisk')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Load Sample Low-Risk Scenario</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form & Real-Time Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs Panel (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Hydrological & Terrestrial Input Parameters</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">10 Multi-Modal Features</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Rainfall */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Rainfall (24h mm)
                  </label>
                  <span className="font-mono text-cyan-300 font-bold">{formData.rainfall} mm</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange('rainfall', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 2. River Water Level */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-blue-400" /> River / Water Level (m)
                  </label>
                  <span className="font-mono text-blue-300 font-bold">{formData.river_level} m</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={formData.river_level}
                  onChange={(e) => handleInputChange('river_level', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 3. Soil Moisture */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-teal-400" /> Soil Moisture Saturation
                  </label>
                  <span className="font-mono text-teal-300 font-bold">{formData.soil_moisture}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.soil_moisture}
                  onChange={(e) => handleInputChange('soil_moisture', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 4. Elevation */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-indigo-400" /> Elevation (m ASL)
                  </label>
                  <span className="font-mono text-indigo-300 font-bold">{formData.elevation} m</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  step="1"
                  value={formData.elevation}
                  onChange={(e) => handleInputChange('elevation', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 5. Historical Flood Frequency */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Historical Flood Frequency
                  </label>
                  <span className="font-mono text-amber-300 font-bold">{formData.historical_flood_frequency}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.historical_flood_frequency}
                  onChange={(e) => handleInputChange('historical_flood_frequency', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 6. Land Cover */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <label className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" /> Land Cover / Terrain
                </label>
                <select
                  value={formData.land_cover}
                  onChange={(e) => handleInputChange('land_cover', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Urban">Urban (High Runoff)</option>
                  <option value="Agricultural">Agricultural (Moderate)</option>
                  <option value="Forest">Forest (High Absorption)</option>
                  <option value="Wetland">Wetland / Marsh</option>
                  <option value="Grassland">Grassland</option>
                  <option value="Barren">Barren Land</option>
                </select>
              </div>

              {/* 7. Latitude */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <label className="font-semibold text-slate-200 text-xs">Latitude</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 8. Longitude */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <label className="font-semibold text-slate-200 text-xs">Longitude</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 9. Temperature */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <label className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 10. Drainage Proximity */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <label className="font-semibold text-slate-200 text-xs">Drainage Proximity (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.05"
                  value={formData.drainage_proximity}
                  onChange={(e) => handleInputChange('drainage_proximity', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Large Predict CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wider uppercase shadow-xl shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Model Inference...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-cyan-200 fill-cyan-200" />
                  <span>PREDICT FLOOD RISK</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {result ? (
            (() => {
              const theme = getRiskColorTheme(result.risk_category);
              return (
                <div className={`glass-panel p-6 rounded-2xl border ${theme.card} space-y-5 flex-1 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          Inference Results
                        </h3>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${theme.badge}`}>
                        {result.risk_category}
                      </span>
                    </div>

                    {/* Main Probability Display */}
                    <div className="mt-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Inundation Probability
                      </span>
                      <div className="text-6xl font-black bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                        {result.risk_percentage}%
                      </div>
                      <div className="text-sm font-extrabold" style={{ color: theme.text }}>
                        Risk Level: {result.risk_category.toUpperCase()}
                      </div>

                      {/* Probability Meter Bar */}
                      <div className="w-full bg-slate-800 h-3 rounded-full mt-3 overflow-hidden p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${theme.bar}`}
                          style={{ width: `${result.risk_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Top Contributing Factors */}
                    <div className="mt-5 space-y-3">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                        Contributing Risk Factors:
                      </span>
                      <div className="space-y-2">
                        {result.top_factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Advisory Box */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Operational Advisory</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {result.recommended_action}
                    </p>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="glass-panel p-8 rounded-2xl border-slate-800 flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Awaiting Parameter Input</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Adjust rainfall, river stage, soil moisture, and elevation, or click a demo scenario above, then press "PREDICT FLOOD RISK".
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
