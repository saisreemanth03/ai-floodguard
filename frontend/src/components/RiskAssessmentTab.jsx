import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Activity, 
  Droplets, 
  Waves, 
  Mountain, 
  Compass, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { predictFloodRisk } from '../services/api';

export default function RiskAssessmentTab({ onAssessmentComplete, initialInputs, selectedState = 'All India', selectedScenario = 'urbanRunoff' }) {
  const [formData, setFormData] = useState(initialInputs || {
    rainfall: 165.0,
    river_level: 9.8,
    soil_moisture: 88.0,
    elevation: 22.0,
    historical_flood_frequency: 0.45,
    latitude: 25.594,
    longitude: 85.137,
    temperature: 28.0,
    humidity: 92.0,
    land_cover: 'Urban',
    drainage_proximity: 0.4
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState({
    flood_probability: 0.885,
    risk_percentage: 88.5,
    risk_score: 88,
    risk_level: 'HIGH',
    risk_category: 'High Risk',
    top_factors: [
      'Elevated precipitation surge (165.0 mm/24h)',
      'Critical river water stage (9.8 m)',
      'High soil water saturation (88.0%)',
      'Low topographic elevation (22.0 m ASL)'
    ],
    explanation: 'Elevated precipitation, river stage and saturated soil conditions are contributing to the current high-risk assessment.',
    recommended_action: 'Pre-evacuation advisory in effect. Deploy flood barriers and inspect drainage gates.',
    assessment_time: '25 Sep 2026, 11:15 UTC'
  });
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (initialInputs) {
      setFormData(initialInputs);
    }
  }, [initialInputs]);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'land_cover' ? val : parseFloat(val) || 0
    }));
  };

  const handleRunAssessment = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await predictFloodRisk(formData);
      const score = Math.round(response.flood_probability * 100);
      const level = score >= 65 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW';

      // Generate factual concise explanation
      let explanation = '';
      if (level === 'HIGH') {
        explanation = `Elevated rainfall (${formData.rainfall} mm), river water stage (${formData.river_level} m) and soil saturation (${formData.soil_moisture}%) are contributing to the current high-risk assessment.`;
      } else if (level === 'MEDIUM') {
        explanation = `Moderate precipitation (${formData.rainfall} mm) and rising river stage (${formData.river_level} m) require active catchment monitoring.`;
      } else {
        explanation = `Hydrological and topographical conditions remain within normal safe baseline operating thresholds.`;
      }

      const formattedResult = {
        ...response,
        risk_score: score,
        risk_level: level,
        explanation: explanation,
        assessment_time: new Date().toUTCString().replace('GMT', 'UTC')
      };

      setResult(formattedResult);
      if (onAssessmentComplete) {
        onAssessmentComplete(formattedResult, formData);
      }
    } catch (err) {
      console.error('Assessment error:', err);
      setErrorMessage('Risk assessment service is temporarily unavailable. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (lvl) => {
    if (lvl === 'HIGH') return { bg: 'bg-red-600', text: 'text-red-600', badge: 'bg-red-50 text-red-700 border-red-200' };
    if (lvl === 'MEDIUM') return { bg: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { bg: 'bg-emerald-600', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Fieldsets Panel (7 Cols) */}
        <div className="lg:col-span-7 card-surface">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Hydrological & Environmental Input Variables
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter localized monitoring metrics or select a scenario to evaluate inundation risk.
            </p>
          </div>

          <form onSubmit={handleRunAssessment} className="p-5 space-y-5 font-data text-xs">
            {/* 1. HYDROLOGICAL CONDITIONS */}
            <fieldset className="space-y-3">
              <legend className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 pb-1 border-b border-slate-200 w-full">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                Hydrological Conditions
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Rainfall (24h mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="0.5"
                    value={formData.rainfall}
                    onChange={(e) => handleInputChange('rainfall', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    River / Water Level (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.1"
                    value={formData.river_level}
                    onChange={(e) => handleInputChange('river_level', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Soil Moisture (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.soil_moisture}
                    onChange={(e) => handleInputChange('soil_moisture', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </fieldset>

            {/* 2. TERRAIN CONDITIONS */}
            <fieldset className="space-y-3">
              <legend className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 pb-1 border-b border-slate-200 w-full">
                <Mountain className="w-3.5 h-3.5 text-blue-600" />
                Terrain & Proximity
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Elevation (m ASL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    step="1"
                    value={formData.elevation}
                    onChange={(e) => handleInputChange('elevation', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Land Cover
                  </label>
                  <select
                    value={formData.land_cover}
                    onChange={(e) => handleInputChange('land_cover', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Urban">Urban</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Forest">Forest</option>
                    <option value="Wetland">Wetland</option>
                    <option value="Grassland">Grassland</option>
                    <option value="Barren">Barren</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Drainage Proximity (km)
                  </label>
                  <input
                    type="number"
                    min="0.05"
                    max="50"
                    step="0.1"
                    value={formData.drainage_proximity}
                    onChange={(e) => handleInputChange('drainage_proximity', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </fieldset>

            {/* 3. HISTORICAL CONDITIONS & LOCATION */}
            <fieldset className="space-y-3">
              <legend className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 pb-1 border-b border-slate-200 w-full">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Historical Recurrence & Location Coordinates
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Historical Flood Frequency
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.historical_flood_frequency}
                    onChange={(e) => handleInputChange('historical_flood_frequency', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Latitude (°N)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Longitude (°E)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 font-mono-num text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </fieldset>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={handleRunAssessment}
                  className="font-semibold underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded bg-[#0F2942] hover:bg-[#1E3A8A] text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Running Risk Assessment...</span>
                ) : (
                  <span>Run Risk Assessment</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Assessment Results Panel (5 Cols) */}
        <div className="lg:col-span-5 card-surface flex flex-col justify-between">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Flood Risk Assessment Result
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hydrological model estimation & primary driver decomposition
            </p>
          </div>

          <div className="p-5 space-y-5 font-data text-xs flex-1">
            {/* Main Score Box */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                    Calculated Risk Score
                  </span>
                  <div className="text-3xl font-bold font-mono-num text-slate-900 mt-1">
                    {result.risk_score} <span className="text-sm font-normal text-slate-500">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                    Risk Level
                  </span>
                  <span className={`inline-block mt-1 px-3 py-1 rounded text-xs font-bold ${
                    result.risk_level === 'HIGH' ? 'bg-red-600 text-white' :
                    result.risk_level === 'MEDIUM' ? 'bg-amber-500 text-white' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {result.risk_level} RISK
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex justify-between text-[11px] text-slate-600">
                <span>Flood Probability: <strong>{result.risk_percentage}%</strong></span>
                <span className="font-mono-num">{result.assessment_time}</span>
              </div>
            </div>

            {/* Primary Risk Drivers (Clean Horizontal Bars) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block">
                Primary Risk Drivers
              </span>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span>Rainfall Volume ({formData.rainfall} mm)</span>
                    <span className="font-mono-num font-semibold">{Math.min(100, Math.round((formData.rainfall / 180) * 100))}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.round((formData.rainfall / 180) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span>River Water Stage ({formData.river_level} m)</span>
                    <span className="font-mono-num font-semibold">{Math.min(100, Math.round((formData.river_level / 12) * 100))}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.round((formData.river_level / 12) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span>Soil Water Saturation ({formData.soil_moisture}%)</span>
                    <span className="font-mono-num font-semibold">{formData.soil_moisture}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full" 
                      style={{ width: `${formData.soil_moisture}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span>Topographic Vulnerability (Elevation: {formData.elevation} m)</span>
                    <span className="font-mono-num font-semibold">{Math.max(5, Math.round(100 - (formData.elevation / 300) * 100))}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-700 h-full rounded-full" 
                      style={{ width: `${Math.max(5, Math.round(100 - (formData.elevation / 300) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Concise Factual Explanation */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wide block">
                Hydrological Explanation
              </span>
              <p className="text-slate-700 text-xs leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {/* Recommended Advisory Response */}
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 space-y-1 text-blue-900">
              <span className="font-semibold text-blue-800 text-[11px] uppercase tracking-wide block">
                Operational Advisory
              </span>
              <p className="text-xs leading-relaxed">
                {result.recommended_action}
              </p>
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-lg text-[11px] text-slate-500">
            *Inference powered by trained ensemble gradient boosted tree model.
          </div>
        </div>
      </div>
    </div>
  );
}
