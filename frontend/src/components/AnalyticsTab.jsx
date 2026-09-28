import React from 'react';
import { 
  LineChart as LineIcon, 
  BarChart3, 
  PieChart as PieIcon, 
  Droplets, 
  Waves, 
  Mountain, 
  CloudRain,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AnalyticsTab({ datasetInfo }) {
  // 1. Rainfall Trend vs Flood Probability
  const rainfallTrendData = [
    { range: '0–25 mm', floodRate: 4.2, baseline: 95.8 },
    { range: '25–50 mm', floodRate: 14.5, baseline: 85.5 },
    { range: '50–80 mm', floodRate: 32.0, baseline: 68.0 },
    { range: '80–120 mm', floodRate: 64.8, baseline: 35.2 },
    { range: '120–180 mm', floodRate: 88.5, baseline: 11.5 },
    { range: '180+ mm', floodRate: 97.4, baseline: 2.6 }
  ];

  // 2. River Stage vs Inundation Rate
  const riverTrendData = [
    { stage: '< 2.0 m', floodProb: 5.1 },
    { stage: '2.0–4.0 m', floodProb: 18.4 },
    { stage: '4.0–6.0 m', floodProb: 46.2 },
    { stage: '6.0–8.0 m', floodProb: 79.5 },
    { stage: '8.0+ m', floodProb: 96.8 }
  ];

  // 3. Soil Saturation Trend
  const soilTrendData = [
    { saturation: '0–30%', floodRate: 3.5 },
    { saturation: '30–50%', floodRate: 16.2 },
    { saturation: '50–70%', floodRate: 42.0 },
    { saturation: '70–85%', floodRate: 78.4 },
    { saturation: '85–100%', floodRate: 94.2 }
  ];

  // 4. Elevation vs Vulnerability
  const elevationTrendData = [
    { elevation: '0–25 m', floodRate: 72.5 },
    { elevation: '25–75 m', floodRate: 51.0 },
    { elevation: '75–150 m', floodRate: 32.5 },
    { elevation: '150–300 m', floodRate: 16.0 },
    { elevation: '300+ m', floodRate: 4.2 }
  ];

  // 5. Target Classification Balance
  const distributionData = [
    { name: 'Baseline Non-Flood (70.2%)', value: 87750, color: '#334155' },
    { name: 'Inundation Events (29.8%)', value: 37250, color: '#DC2626' }
  ];

  // 6. Risk Tier Breakdown
  const riskTierData = [
    { tier: 'Low Risk (<35)', count: 137, color: '#059669' },
    { tier: 'Medium Risk (35–64)', count: 126, color: '#D97706' },
    { tier: 'High Risk (≥65)', count: 87, color: '#DC2626' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Description */}
      <div className="card-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Hydrological Exploratory Data Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical distribution of environmental triggers and risk correlations across 125,000 observations.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded font-mono-num">
          Sample: 125,000 Records
        </div>
      </div>

      {/* Grid: 6 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Rainfall vs Inundation */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-600" />
              Rainfall vs Inundation Rate
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">% Inundated</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainfallTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis dataKey="range" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }} />
                <Area type="monotone" dataKey="floodRate" name="Inundation Rate (%)" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: River Stage vs Flood Rate */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-blue-600" />
              River Stage vs Inundation Rate
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">% Inundated</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riverTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis dataKey="stage" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }} />
                <Bar dataKey="floodProb" name="Inundation Rate (%)" fill="#1E40AF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Soil Moisture Trend */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-teal-600" />
              Soil Saturation vs Flood Rate
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">% Inundated</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={soilTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis dataKey="saturation" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }} />
                <Area type="monotone" dataKey="floodRate" name="Inundation Rate (%)" stroke="#0D9488" fill="#14B8A6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Elevation Vulnerability */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-slate-700" />
              Topographic Elevation Vulnerability
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">% Inundated</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elevationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis dataKey="elevation" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }} />
                <Bar dataKey="floodRate" name="Inundation Rate (%)" fill="#475569" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Target Distribution (Donut) */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-slate-700" />
              Dataset Inundation Event Split
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">125K Samples</span>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Risk Tier Stations Breakdown */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              Monitoring Network Risk Tiers
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">350 Stations</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskTierData} layout="vertical" margin={{ top: 10, right: 20, left: 35, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={10} />
                <YAxis dataKey="tier" type="category" stroke="#64748B" fontSize={10} width={75} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }} />
                <Bar dataKey="count" name="Stations Count" radius={[0, 3, 3, 0]}>
                  {riskTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
