import React from 'react';
import { 
  Layers, 
  CloudRain, 
  Waves, 
  Droplets, 
  Mountain, 
  Compass, 
  TrendingUp, 
  Info 
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

export default function RiskDriversTab({ featureImportance }) {
  const drivers = [
    { key: "rainfall", name: "Rainfall (24h Intensity)", importance: 28.5, desc: "Primary driver of surface runoff volume and catchment inflow discharge." },
    { key: "river_level", name: "River / Water Level Stage", importance: 21.1, desc: "Channel discharge capacity and river embankment overtopping boundary." },
    { key: "rainfall_x_soil_moisture", name: "Rainfall × Soil Moisture", importance: 14.5, desc: "Compounding saturation interaction: pre-saturated soils produce immediate 100% surface runoff." },
    { key: "soil_moisture", name: "Soil Water Saturation", importance: 12.8, desc: "Remaining hydrological infiltration capacity in localized soil horizons." },
    { key: "elevation", name: "Topographic Elevation", importance: 8.9, desc: "Topographic height; gravity accelerates drainage in higher elevations." },
    { key: "historical_flood_frequency", name: "Historical Flood Recurrence", importance: 5.2, desc: "Empirical catchment vulnerability and historical recurrence frequency." },
    { key: "land_cover", name: "Land Cover (Urban Impermeability)", importance: 4.8, desc: "Impervious concrete surfaces amplify peak flash flood volumes." },
    { key: "drainage_proximity", name: "Drainage Channel Proximity", importance: 4.2, desc: "Distance to primary drainage canals and main river tributaries." }
  ];

  const chartData = [...drivers].reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Risk Drivers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relative contribution of model input variables to the risk assessment.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded font-mono-num">
          Dominant Driver: Rainfall (28.5%)
        </div>
      </div>

      {/* Grid: Bar Chart & Driver Descriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 card-surface p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Relative Feature Predictive Contribution
            </h3>
            <span className="text-[11px] text-slate-500 font-mono-num">Percentage Weight (%)</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 30, left: 140, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={10} domain={[0, 32]} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={140} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }}
                  formatter={(val) => [`${val}% Contribution`, 'Weight']}
                />
                <Bar dataKey="importance" fill="#1E40AF" radius={[0, 3, 3, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.importance > 20 ? '#1E40AF' : entry.importance > 10 ? '#3B82F6' : '#64748B'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Descriptions List (5 Cols) */}
        <div className="lg:col-span-5 card-surface p-4 space-y-3">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Hydrological Factor Definitions
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hydrological mechanisms influencing prediction weights
            </p>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 text-xs font-data">
            {drivers.map((d, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">{d.name}</span>
                  <span className="font-mono-num font-bold text-blue-700">{d.importance}%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
