import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  Radio, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Activity, 
  PhoneCall, 
  Flame,
  Info,
  ArrowUpRight
} from 'lucide-react';

export default function EarlyWarningPanel({ lastPrediction, lastInputs, onNavigateToPredict }) {
  const isHighRisk = (lastPrediction?.risk_percentage || 78.5) >= 60;
  const isCritical = (lastPrediction?.risk_percentage || 78.5) >= 80;

  const simulatedActiveAlerts = [
    {
      id: "WRN-2026-0924-01",
      location: "Ganges Basin (Patna - Sector 4)",
      coordinates: "25.594° N, 85.137° E",
      probability: 88.5,
      category: "Very High Risk",
      factors: ["Extreme rainfall (165 mm)", "River stage at 9.8m", "Soil saturation 88%"],
      time: "10 mins ago",
      status: "IMMINENT INUNDATION"
    },
    {
      id: "WRN-2026-0924-02",
      location: "Mississippi Lowlands (Memphis North)",
      coordinates: "35.149° N, -90.048° W",
      probability: 74.2,
      category: "High Risk",
      factors: ["High soil moisture (82%)", "Low elevation (28m)", "River swelling (7.4m)"],
      time: "28 mins ago",
      status: "ADVISORY STAGE"
    },
    {
      id: "WRN-2026-0924-03",
      location: "Danube Valley (Bratislava Basin)",
      coordinates: "48.148° N, 17.107° E",
      probability: 63.8,
      category: "High Risk",
      factors: ["Continuous heavy rain (92 mm)", "Urban drainage congestion"],
      time: "45 mins ago",
      status: "WATCH ACTIVE"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Main Warning Card (Triggered on High / Very High Risk) */}
      {isHighRisk ? (
        <div className={`p-6 md:p-8 rounded-2xl border ${
          isCritical 
            ? 'bg-gradient-to-br from-red-950/70 via-slate-900 to-red-950/40 border-red-500/60 shadow-2xl shadow-red-950/50 animate-danger-pulse' 
            : 'bg-gradient-to-br from-orange-950/60 via-slate-900 to-amber-950/30 border-orange-500/50 shadow-2xl'
        } space-y-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'} animate-bounce`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest uppercase font-bold text-red-400">
                  CRITICAL HYDROLOGICAL EARLY WARNING
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Potential Flood Risk Detected
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-red-500/40 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Calculated Probability</span>
                <div className="text-2xl font-black text-red-400">
                  {lastPrediction ? `${lastPrediction.risk_percentage}%` : '78.5%'}
                </div>
              </div>
              <span className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                isCritical ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-orange-500 text-slate-950'
              }`}>
                {lastPrediction?.risk_category || 'High Risk'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Location & Time */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Geographic Target</span>
              </div>
              <div className="font-mono text-cyan-300 font-semibold">
                Lat: {lastInputs?.latitude || '25.594'}°, Lon: {lastInputs?.longitude || '85.137'}°
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Telemetry Timestamp: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Critical Compounding Factors */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>Primary Escalation Drivers</span>
              </div>
              <div className="space-y-1">
                {(lastPrediction?.top_factors || [
                  'Heavy rainfall surge (>140 mm)',
                  'River discharge near spillway crest',
                  'Saturated sub-surface soil strata'
                ]).map((f, i) => (
                  <div key={i} className="text-slate-300 flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Protocol Action */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Standard Incident Action Plan</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {lastPrediction?.recommended_action || 'Immediate alert status: Inspect retention basins, notify downstream settlements, verify flood barrier integrity.'}
              </p>
            </div>
          </div>

          {/* Legal Emergency Non-Official Disclaimer */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/20 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Legal Operational Disclaimer: </strong>
              This alert is generated via machine learning algorithms for exploratory and simulation decision-support. <strong>It does not constitute an official government meteorological warning.</strong> Always adhere to instructions from civil defense authorities.
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border-slate-800 text-center space-y-4">
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-16 h-16 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Critical Inundation Alert for Current Query</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              The currently selected scenario is within safe/moderate thresholds ({lastPrediction?.risk_percentage || 24.5}% probability).
            </p>
          </div>
          <button
            onClick={onNavigateToPredict}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-all cursor-pointer"
          >
            Simulate High-Risk Storm Scenario in Prediction Panel
          </button>
        </div>
      )}

      {/* Active Regional Watchlist Feed */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulated Regional Flood Watchlist Feed
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">3 Active Monitored Catchments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {simulatedActiveAlerts.map((alert) => (
            <div key={alert.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{alert.id}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  alert.probability >= 80 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {alert.probability}%
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">{alert.location}</h4>
                <div className="text-[10px] font-mono text-slate-400">{alert.coordinates}</div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-2">
                {alert.factors.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                <span>{alert.time}</span>
                <span className="font-semibold text-amber-400">{alert.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
