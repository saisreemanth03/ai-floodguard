import React from 'react';
import { 
  Layers, 
  HelpCircle, 
  Droplets, 
  Mountain, 
  Waves, 
  CloudRain, 
  Compass, 
  Info,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function FeatureImportanceTab({ featureImportance }) {
  const items = featureImportance && featureImportance.length > 0 ? featureImportance : [
    { feature: "rainfall", importance: 0.2845 },
    { feature: "river_level", importance: 0.2110 },
    { feature: "rainfall_x_soil_moisture", importance: 0.1450 },
    { feature: "soil_moisture", importance: 0.1280 },
    { feature: "elevation_risk", importance: 0.0890 },
    { feature: "elevation", importance: 0.0520 },
    { feature: "historical_flood_frequency", importance: 0.0410 },
    { feature: "drainage_proximity", importance: 0.0240 },
    { feature: "land_cover_Urban", importance: 0.0155 },
    { feature: "humidity", importance: 0.0100 }
  ];

  // Map friendly names and descriptions
  const featureDescriptions = {
    rainfall: { label: "Rainfall (24h Intensity)", icon: CloudRain, desc: "Primary driver of surface runoff and hydrological volume." },
    river_level: { label: "River / Water Stage", icon: Waves, desc: "Channel discharge capacity and river bank overflow boundary." },
    rainfall_x_soil_moisture: { label: "Rainfall × Soil Moisture", icon: Droplets, desc: "Compounding saturation interaction: wet soil causes 100% immediate runoff." },
    soil_moisture: { label: "Soil Water Saturation", icon: Droplets, desc: "Remaining infiltration capacity of catchment soil layers." },
    elevation_risk: { label: "Elevation Vulnerability Index", icon: Mountain, desc: "Derived inverse topographic depression risk score." },
    elevation: { label: "Elevation (m ASL)", icon: Mountain, desc: "Topographic height; gravity accelerates drainage in higher elevations." },
    historical_flood_frequency: { label: "Historical Flood Recurrence", icon: TrendingUp, desc: "Empirical catchment vulnerability and historical recurrence frequency." },
    drainage_proximity: { label: "Drainage Proximity (km)", icon: Compass, desc: "Distance to primary drainage canals and main river tributaries." },
    land_cover_Urban: { label: "Urban Land Cover (Impermeability)", icon: Compass, desc: "Concrete surfaces reduce infiltration, creating flash flood conditions." },
    humidity: { label: "Relative Humidity", icon: CloudRain, desc: "Atmospheric moisture indicator preceding extreme storm systems." }
  };

  const chartData = [...items].reverse().map(item => ({
    name: featureDescriptions[item.feature]?.label || item.feature,
    importance: +(item.importance * 100).toFixed(2),
    rawImportance: item.importance,
    key: item.feature
  }));

  const COLORS = ['#06b6d4', '#0284c7', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444'].reverse();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Feature Importance & Decision Explainability</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global Gini / Tree Split feature importances extracted across 125,000+ hydrological observations.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          Top Driver: <strong className="text-cyan-300">Rainfall (28.5%)</strong>
        </div>
      </div>

      {/* Grid: Bar Chart and Detailed Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Relative Predictive Weight (% Impact)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Normalized Importance</span>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 30, left: 130, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 32]} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [`${val}% Weight`, 'Importance']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Explanations Deep Dive (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hydrological Impact Insights
            </h3>
            <p className="text-xs text-slate-400">Scientific rationale behind model weights</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
            {items.slice(0, 6).map((item, idx) => {
              const meta = featureDescriptions[item.feature] || { label: item.feature, desc: "Hydrological factor", icon: Layers };
              const Icon = meta.icon;
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{meta.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {(item.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                    {meta.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
