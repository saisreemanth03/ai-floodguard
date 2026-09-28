import React from 'react';
import { 
  Waves, 
  MapPin, 
  Cpu, 
  BarChart3, 
  Layers, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiStatus, onQuickDemo }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'map', label: 'Flood Risk Map', icon: MapPin },
    { id: 'predict', label: 'Prediction Panel', icon: Sliders },
    { id: 'models', label: 'Model Comparison', icon: Cpu },
    { id: 'features', label: 'Feature Importance', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'warning', label: 'Early Warnings', icon: AlertTriangle }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Banner Disclaimer */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 px-4 py-1.5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-medium text-slate-300">Hackathon Decision Support System:</span>
        <span>This system provides machine-learning-based risk estimates for demonstration and decision-support purposes. It is not an official emergency warning system.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <Waves className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent tracking-tight">
                  AI FloodGuard
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full uppercase tracking-wider">
                  ML v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Predict. Monitor. Prepare.
              </p>
            </div>
          </div>

          {/* Action & Status Badges */}
          <div className="flex items-center gap-3">
            {/* Quick Demo CTA Button */}
            <button
              onClick={onQuickDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              title="Auto-fill realistic high-risk flood scenario"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Judge Demo Mode</span>
            </button>

            {/* API Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                {apiStatus === 'online' ? 'ML Engine Online' : 'Standby / Demo'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
