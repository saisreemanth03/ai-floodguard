import React from 'react';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  Activity,
  Layers,
  Globe2,
  Mountain,
  CloudRain
} from 'lucide-react';

export default function Header({ 
  title, 
  subtitle, 
  onSelectScenario, 
  activeScenario = 'Heavy Rainfall',
  locationScope = 'Indian River Basins & Catchment Grid',
  states = [],
  selectedState = 'All India',
  onSelectState,
  mapViewMode = '2d',
  onSetMapViewMode
}) {
  const scenarios = [
    { id: 'baseline', label: 'Baseline Conditions' },
    { id: 'heavyRainfall', label: 'Heavy Rainfall' },
    { id: 'riverSurge', label: 'River Surge' },
    { id: 'urbanRunoff', label: 'Urban Runoff' },
  ];

  const mapModes = [
    { id: '2d', label: '2D Map', icon: MapPin },
    { id: '3d', label: '3D Terrain', icon: Mountain },
    { id: 'weather', label: 'Weather', icon: CloudRain }
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.12),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] backdrop-blur-sm">
      {/* Top Subtle Disclaimer Strip */}
      <div className="border-b border-slate-200/80 bg-slate-950/95 px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] inline-block"></span>
          <span className="font-medium text-white">Decision-Support Platform:</span>
          <span className="text-slate-300">FloodGuard provides analytical decision-support estimates for demonstration and research purposes.</span>
        </div>
        <div className="hidden md:flex items-center space-x-4 font-mono text-[11px] text-slate-400">
          <span>Scope: 350 Stations</span>
          <span>•</span>
          <span>Sample: 125,000 Records</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Metadata */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {locationScope}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Telemetry: 25 Sep 2026, 11:15 UTC
            </span>
          </div>
        </div>

        {/* Action / Demo Scenarios Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-2 py-1.5 shadow-sm shadow-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">State</span>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => onSelectState && onSelectState(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 pr-8 text-xs text-slate-700 focus:border-blue-600 focus:outline-none shadow-inner"
              >
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-2 py-1.5 shadow-sm shadow-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Scenario</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer ${
                    activeScenario === sc.id
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-2 py-1.5 shadow-sm shadow-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">View</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {mapModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = mapViewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onSetMapViewMode && onSetMapViewMode(mode.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer ${
                      isActive ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
