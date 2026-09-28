import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Droplets, 
  Waves, 
  Mountain, 
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Layers,
  MapPin,
  Clock
} from 'lucide-react';

export default function OverviewTab({ 
  datasetInfo, 
  modelMetrics, 
  mapPoints = [], 
  onSelectStation,
  onNavigateTab,
  selectedState = 'All India'
}) {
  const totalStations = mapPoints.length || 350;
  const highRiskStations = mapPoints.filter(p => p.risk_level === 'HIGH' || p.risk_score >= 65);
  const medRiskStations = mapPoints.filter(p => p.risk_level === 'MEDIUM' || (p.risk_score >= 35 && p.risk_score < 65));
  const lowRiskStations = mapPoints.filter(p => p.risk_level === 'LOW' || p.risk_score < 35);

  const avgRainfall = (mapPoints.reduce((acc, p) => acc + (p.rainfall || 0), 0) / (mapPoints.length || 1)).toFixed(1);
  const avgRiver = (mapPoints.reduce((acc, p) => acc + (p.river_level || 0), 0) / (mapPoints.length || 1)).toFixed(2);

  const basinSummary = [
    { basin: "Ganges Basin", stations: 75, highRisk: 28, medRisk: 26, avgRain: 124.5, stageStatus: "Critical Inflow" },
    { basin: "Brahmaputra Basin", stations: 50, highRisk: 24, medRisk: 18, avgRain: 148.0, stageStatus: "Warning Level" },
    { basin: "Yamuna Basin", stations: 45, highRisk: 12, medRisk: 19, avgRain: 76.5, stageStatus: "Advisory" },
    { basin: "Godavari Basin", stations: 40, highRisk: 8, medRisk: 16, avgRain: 54.0, stageStatus: "Normal Stage" },
    { basin: "Krishna Basin", stations: 35, highRisk: 6, medRisk: 14, avgRain: 48.2, stageStatus: "Normal Stage" },
    { basin: "Mahanadi Basin", stations: 35, highRisk: 5, medRisk: 13, avgRain: 51.8, stageStatus: "Normal Stage" },
    { basin: "Delta & Urban Catchments", stations: 70, highRisk: 4, medRisk: 20, avgRain: 42.0, stageStatus: "Tidal Inflow" }
  ];

  return (
    <div className="space-y-6">
      <div className="card-surface p-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Active state</div>
          <div className="text-sm font-semibold text-slate-900">{selectedState}</div>
        </div>
        <div className="text-[11px] text-slate-500">
          {totalStations} stations in current scope
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
            Monitoring Stations
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-slate-900">
              {totalStations}
            </span>
            <span className="text-[11px] text-slate-500">Active</span>
          </div>
        </div>

        {/* Metric 2: High Risk */}
        <div className="card-surface p-4 border-l-4 border-l-red-600 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
            High Risk Stations
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-red-600">
              {highRiskStations.length}
            </span>
            <span className="text-[11px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              {((highRiskStations.length / totalStations) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Metric 3: Medium Risk */}
        <div className="card-surface p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
            Medium Risk Stations
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-amber-600">
              {medRiskStations.length}
            </span>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              {((medRiskStations.length / totalStations) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Metric 4: Average Rainfall */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
            Average Rainfall (24h)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-slate-900">
              {avgRainfall}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">mm</span>
          </div>
        </div>

        {/* Metric 5: Average River Level */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
            Average River Stage
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-slate-900">
              {avgRiver}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">meters</span>
          </div>
        </div>

        {/* Metric 6: Model Reliability */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
            Model Validation F1
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-num text-blue-700">
              {modelMetrics?.models?.[0]?.f1 ? `${(modelMetrics.models[0].f1 * 100).toFixed(1)}%` : '91.6%'}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
              Reliable
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Basin Overview Table & Recent Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Basin Risk Summary Table (7 cols) */}
        <div className="lg:col-span-7 card-surface">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Hydrological Basin Risk Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated telemetry across major Indian river catchment networks
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">River Basin</th>
                  <th className="py-2.5 px-3">Stations</th>
                  <th className="py-2.5 px-3">High Risk</th>
                  <th className="py-2.5 px-3">Avg Rain</th>
                  <th className="py-2.5 px-4">Discharge Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-data">
                {basinSummary.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.basin}</td>
                    <td className="py-3 px-3 font-mono-num">{b.stations}</td>
                    <td className="py-3 px-3">
                      {b.highRisk > 0 ? (
                        <span className="font-bold font-mono-num text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {b.highRisk}
                        </span>
                      ) : (
                        <span className="font-mono-num text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono-num">{b.avgRain} mm</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        b.stageStatus === 'Critical Inflow' ? 'bg-red-100 text-red-800' :
                        b.stageStatus === 'Warning Level' ? 'bg-orange-100 text-orange-800' :
                        b.stageStatus === 'Advisory' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {b.stageStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Locations Alert List (5 cols) */}
        <div className="lg:col-span-5 card-surface flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Critical Monitoring Alerts
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stations exceeding high-risk hydrological thresholds
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-semibold">
                {highRiskStations.length} Active
              </span>
            </div>

            <div className="p-3 space-y-2.5 max-h-[340px] overflow-y-auto">
              {highRiskStations.slice(0, 5).map((st) => (
                <div 
                  key={st.id} 
                  onClick={() => onSelectStation(st)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      {st.location_name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white font-mono-num">
                      Score: {st.risk_score || st.risk_percentage} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-data">
                    <div>🌧️ {st.rainfall} mm</div>
                    <div>🌊 {st.river_level} m</div>
                    <div>🌱 {st.soil_moisture}% sat.</div>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate">
                    Drivers: {st.primary_drivers ? st.primary_drivers.slice(0, 2).join(' • ') : 'High rainfall surge • River swelling'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-between items-center text-xs">
            <span className="text-slate-500">Showing top critical telemetry</span>
            <button
              onClick={() => onNavigateTab('warnings')}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Open Early Warning Center &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
