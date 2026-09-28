import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Activity, 
  Radio, 
  Info,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function EarlyWarningCenter({ mapPoints = [], onSelectStation, onNavigateTab }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const highRiskStations = mapPoints.filter(p => p.risk_level === 'HIGH' || p.risk_score >= 65);
  const medRiskStations = mapPoints.filter(p => p.risk_level === 'MEDIUM' || (p.risk_score >= 35 && p.risk_score < 65));
  const monitoringStations = mapPoints.filter(p => p.risk_level === 'LOW' || p.risk_score < 35);

  const getFilteredStations = () => {
    if (selectedCategory === 'HIGH') return highRiskStations;
    if (selectedCategory === 'MEDIUM') return medRiskStations;
    if (selectedCategory === 'MONITORING') return monitoringStations;
    return [...highRiskStations, ...medRiskStations, ...monitoringStations];
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Early Warning Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active catchment advisories, trigger conditions, and standardized response protocols.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: `All Advisories (${mapPoints.length})` },
            { id: 'HIGH', label: `High Risk (${highRiskStations.length})` },
            { id: 'MEDIUM', label: `Medium Risk (${medRiskStations.length})` },
            { id: 'MONITORING', label: `Monitoring (${monitoringStations.length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Status Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Risk Category */}
        <div className="card-surface p-4 border-l-4 border-l-red-600 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
              High Risk Category (Immediate Threat)
            </span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold font-mono-num">
              {highRiskStations.length} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-data">
            Precipitation and water discharge exceeding safety thresholds. Immediate pre-evacuation alert and gate inspection protocol.
          </p>
        </div>

        {/* Medium Risk Category */}
        <div className="card-surface p-4 border-l-4 border-l-amber-500 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
              Medium Risk Category (Advisory Watch)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold font-mono-num">
              {medRiskStations.length} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-data">
            Elevated river inflow and saturated catchment soils. Heightened radar surveillance and drainage maintenance advised.
          </p>
        </div>

        {/* Monitoring Baseline */}
        <div className="card-surface p-4 border-l-4 border-l-emerald-600 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
              Monitoring Category (Routine Baseline)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono-num">
              {monitoringStations.length} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-data">
            Hydrological metrics within normal seasonal parameters. Regular telemetry recording active across catchment grid.
          </p>
        </div>
      </div>

      {/* Advisory Feed Grid */}
      <div className="card-surface">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Station Warning Registry
          </h3>
          <span className="text-xs text-slate-500 font-mono-num">
            Showing {getFilteredStations().length} records
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {getFilteredStations().slice(0, 15).map((st) => {
            const isHigh = st.risk_level === 'HIGH';
            const isMed = st.risk_level === 'MEDIUM';

            return (
              <div key={st.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 font-data text-xs">
                {/* Station Info & Coordinates */}
                <div className="space-y-1 md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isHigh ? 'bg-red-600' : isMed ? 'bg-amber-500' : 'bg-emerald-600'
                    }`} />
                    <span className="font-bold text-slate-900 text-[13px]">
                      {st.location_name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-4">
                    {st.river_basin} • {st.latitude?.toFixed(3)}°N, {st.longitude?.toFixed(3)}°E
                  </div>
                </div>

                {/* Trigger Conditions */}
                <div className="md:w-1/3 space-y-0.5 text-[11px] text-slate-700">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                    Trigger Conditions
                  </span>
                  <div>🌧️ Rain: <strong className="font-mono-num">{st.rainfall} mm</strong> • 🌊 River: <strong className="font-mono-num">{st.river_level} m</strong></div>
                  <div>🌱 Soil Saturation: <strong className="font-mono-num">{st.soil_moisture}%</strong> • ⛰️ Elev: <strong className="font-mono-num">{st.elevation} m</strong></div>
                </div>

                {/* Score & Recommended Response */}
                <div className="md:w-1/3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isHigh ? 'bg-red-100 text-red-800' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Score: {st.risk_score} / 100 ({st.risk_level})
                    </span>
                    <div className="text-[11px] text-slate-600 truncate max-w-xs">
                      {st.recommended_action || 'Routine catchment monitoring.'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectStation) onSelectStation(st);
                      if (onNavigateTab) onNavigateTab('map');
                    }}
                    className="p-1.5 rounded border border-slate-300 hover:bg-slate-200 text-slate-700 shrink-0 cursor-pointer"
                    title="View on Map"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
