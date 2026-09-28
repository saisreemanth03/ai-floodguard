import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import FloodRiskMap from './components/FloodRiskMap';
import RiskAssessmentTab from './components/RiskAssessmentTab';
import AnalyticsTab from './components/AnalyticsTab';
import ModelPerformanceTab from './components/ModelPerformanceTab';
import RiskDriversTab from './components/RiskDriversTab';
import EarlyWarningCenter from './components/EarlyWarningCenter';
import DataSourcesTab from './components/DataSourcesTab';
import { STATE_OPTIONS, getFilteredPointsByState, deriveStateFromCoordinates } from './utils/stateLookup';

import { 
  fetchHealth, 
  fetchDatasetInfo, 
  fetchModelMetrics, 
  fetchFeatureImportance, 
  fetchRiskMapPoints,
  predictFloodRisk
} from './services/api';

const SCENARIO_PRESETS = {
  baseline: {
    label: 'Baseline Conditions',
    data: {
      rainfall: 15.0,
      river_level: 1.8,
      soil_moisture: 28.0,
      elevation: 450.0,
      historical_flood_frequency: 0.05,
      latitude: 29.956,
      longitude: 78.171,
      temperature: 21.0,
      humidity: 45.0,
      land_cover: 'Forest',
      drainage_proximity: 6.5
    }
  },
  heavyRainfall: {
    label: 'Heavy Rainfall',
    data: {
      rainfall: 145.0,
      river_level: 7.6,
      soil_moisture: 82.0,
      elevation: 45.0,
      historical_flood_frequency: 0.35,
      latitude: 25.308,
      longitude: 83.010,
      temperature: 26.5,
      humidity: 88.0,
      land_cover: 'Agricultural',
      drainage_proximity: 0.8
    }
  },
  riverSurge: {
    label: 'River Surge',
    data: {
      rainfall: 95.0,
      river_level: 10.4,
      soil_moisture: 86.0,
      elevation: 25.0,
      historical_flood_frequency: 0.40,
      latitude: 26.177,
      longitude: 91.688,
      temperature: 27.0,
      humidity: 91.0,
      land_cover: 'Wetland',
      drainage_proximity: 0.2
    }
  },
  urbanRunoff: {
    label: 'Urban Runoff',
    data: {
      rainfall: 165.0,
      river_level: 9.8,
      soil_moisture: 88.0,
      elevation: 22.0,
      historical_flood_frequency: 0.45,
      latitude: 25.632,
      longitude: 85.112,
      temperature: 28.0,
      humidity: 92.0,
      land_cover: 'Urban',
      drainage_proximity: 0.3
    }
  }
};

const TAB_TITLES = {
  'overview': { title: 'Flood Risk Intelligence Dashboard', subtitle: 'Executive hydrological risk monitoring & catchment telemetry' },
  'risk-assessment': { title: 'Hydrological Risk Assessment', subtitle: 'Localized vulnerability scoring & primary factor decomposition' },
  'map': { title: 'Spatial Flood Inundation Risk Map', subtitle: 'Clustered geographic monitoring across Indian river basins' },
  'analytics': { title: 'Hydrological Exploratory Analytics', subtitle: 'Statistical distributions, trigger correlations, and classification metrics' },
  'models': { title: 'Model Performance & Validation', subtitle: 'Test-set evaluated metrics across parametric & boosted tree models' },
  'drivers': { title: 'Risk Drivers & Feature Contributions', subtitle: 'Relative variable impact weights on flood risk assessments' },
  'warnings': { title: 'Early Warning Center', subtitle: 'Standardized catchment alerts, trigger conditions, and incident response protocols' },
  'data': { title: 'Data Sources & Methodology', subtitle: '125,000-record dataset schema, variables, and Kaggle integration' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiStatus, setApiStatus] = useState('checking');
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [activeScenario, setActiveScenario] = useState('urbanRunoff');
  const [assessmentInputs, setAssessmentInputs] = useState(SCENARIO_PRESETS.urbanRunoff.data);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedState, setSelectedState] = useState('All India');
  const [visualizationMode, setVisualizationMode] = useState('2d');

  useEffect(() => {
    setSelectedStation(null);
  }, [selectedState, activeScenario]);

  const filteredMapPoints = useMemo(
    () => getFilteredPointsByState(mapPoints, selectedState),
    [mapPoints, selectedState]
  );

  useEffect(() => {
    async function loadData() {
      // 1. Health check
      const health = await fetchHealth();
      setApiStatus(health.status === 'online' ? 'online' : 'offline');

      // 2. Dataset Info
      const dsInfo = await fetchDatasetInfo();
      setDatasetInfo(dsInfo);

      // 3. Model Metrics
      const metrics = await fetchModelMetrics();
      setModelMetrics(metrics);

      // 4. Feature Importance
      const featImp = await fetchFeatureImportance();
      setFeatureImportance(featImp);

      // 5. Risk Map Sample (350 Indian River Basin Stations)
      const points = await fetchRiskMapPoints();
      setMapPoints(points);
    }

    loadData();
  }, []);

  const handleScenarioChange = (scenarioId) => {
    setActiveScenario(scenarioId);
    if (SCENARIO_PRESETS[scenarioId]) {
      setAssessmentInputs(SCENARIO_PRESETS[scenarioId].data);
    }
  };

  const handleSelectState = (stateName) => {
    setSelectedState(stateName);
    setSelectedStation(null);
  };

  const handleSelectStation = (st) => {
    const stateName = deriveStateFromCoordinates(st?.latitude, st?.longitude);
    if (stateName) setSelectedState(stateName);
    setSelectedStation(st);
    setActiveTab('map');
  };

  const currentTabMeta = TAB_TITLES[activeTab] || { title: 'FloodGuard', subtitle: 'Flood Risk Intelligence' };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        highRiskCount={mapPoints.filter(p => p.risk_level === 'HIGH' || p.risk_score >= 65).length || 87}
        apiStatus={apiStatus}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header 
          title={currentTabMeta.title}
          subtitle={currentTabMeta.subtitle}
          activeScenario={activeScenario}
          onSelectScenario={handleScenarioChange}
          states={STATE_OPTIONS}
          selectedState={selectedState}
          onSelectState={handleSelectState}
          mapViewMode={visualizationMode}
          onSetMapViewMode={setVisualizationMode}
        />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab 
              datasetInfo={datasetInfo}
              modelMetrics={modelMetrics}
              mapPoints={filteredMapPoints}
              selectedState={selectedState}
              selectedScenario={activeScenario}
              onSelectStation={handleSelectStation}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'risk-assessment' && (
            <RiskAssessmentTab 
              initialInputs={assessmentInputs}
              selectedState={selectedState}
              selectedScenario={activeScenario}
              onAssessmentComplete={(res, inputs) => {
                setAssessmentInputs(inputs);
              }}
            />
          )}

          {activeTab === 'map' && (
            <FloodRiskMap 
              mapPoints={filteredMapPoints}
              selectedStation={selectedStation}
              selectedState={selectedState}
              visualizationMode={visualizationMode}
              onSelectStation={(st) => {
                setSelectedStation(st);
                const stateName = deriveStateFromCoordinates(st?.latitude, st?.longitude);
                if (stateName) setSelectedState(stateName);
              }}
              onSetVisualizationMode={setVisualizationMode}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab 
              datasetInfo={datasetInfo}
            />
          )}

          {activeTab === 'models' && (
            <ModelPerformanceTab 
              modelMetrics={modelMetrics}
            />
          )}

          {activeTab === 'drivers' && (
            <RiskDriversTab 
              featureImportance={featureImportance}
            />
          )}

          {activeTab === 'warnings' && (
            <EarlyWarningCenter 
              mapPoints={filteredMapPoints}
              selectedState={selectedState}
              selectedScenario={activeScenario}
              onSelectStation={handleSelectStation}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'data' && (
            <DataSourcesTab 
              datasetInfo={datasetInfo}
            />
          )}
        </main>

        {/* Clean Enterprise Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 font-data">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="font-semibold text-slate-800">FloodGuard</span>
              <span>•</span>
              <span>Hydrological Risk Decision Support Platform</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Risk assessments should be validated against official hydrological and emergency-management information before operational use.
            </div>
            <div className="font-mono-num text-[11px] text-slate-400">
              125K Records • 350 Stations
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
