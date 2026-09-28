import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Sliders, 
  LineChart, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  Database,
  Shield,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, highRiskCount = 87, apiStatus = 'online' }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'risk-assessment', label: 'Risk Assessment', icon: Sliders },
    { id: 'map', label: 'Flood Risk Map', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'models', label: 'Model Performance', icon: Cpu },
    { id: 'drivers', label: 'Risk Drivers', icon: Layers },
    { id: 'warnings', label: 'Early Warnings', icon: AlertTriangle, badge: highRiskCount },
    { id: 'data', label: 'Data Sources', icon: Database },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-200 flex flex-col justify-between shrink-0 border-r border-slate-800 z-30 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-tight">
                FloodGuard
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Flood Risk Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Operational Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-blue-900' : 'bg-red-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / System Telemetry */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">System Status</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            Operational
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Telemetry Updated</span>
          <span className="font-mono text-slate-300">11:15 UTC</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
          <span>Version</span>
          <span className="font-mono text-slate-400">v1.2.0-prod</span>
        </div>
      </div>
    </aside>
  );
}
