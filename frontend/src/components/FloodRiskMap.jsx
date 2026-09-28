import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Search, MapPin, Info } from 'lucide-react';
import { STATE_CENTERS } from '../utils/stateLookup';

const LazyTerrainMap3D = React.lazy(() => import('./TerrainMap3D'));

function MapController({ center, zoom, onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });

  return null;
}

export default function FloodRiskMap({
  mapPoints = [],
  onSelectStation,
  selectedState = 'All India',
  selectedStation: externalSelectedStation,
  visualizationMode = '2d',
  onSetVisualizationMode
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [mapCenter, setMapCenter] = useState([22.5, 82.0]);

  useEffect(() => {
    if (externalSelectedStation) {
      setSelectedStation(externalSelectedStation);
      setMapCenter([externalSelectedStation.latitude, externalSelectedStation.longitude]);
      setCurrentZoom(7);
      return;
    }

    const fallbackCenter = STATE_CENTERS[selectedState] || [22.5, 82.0];
    setMapCenter(fallbackCenter);
    setCurrentZoom(selectedState === 'All India' ? 5 : 6);
  }, [externalSelectedStation, selectedState]);

  const getRiskLevel = (st) => {
    return (st.risk_level || (st.risk_score >= 65 ? 'HIGH' : st.risk_score >= 35 ? 'MEDIUM' : 'LOW')).toUpperCase();
  };

  const filteredStations = useMemo(() => {
    return mapPoints.filter((st) => {
      const level = getRiskLevel(st);
      const matchesFilter = riskFilter === 'ALL' || level === riskFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = term === '' ||
        st.location_name?.toLowerCase().includes(term) ||
        st.river_basin?.toLowerCase().includes(term) ||
        st.land_cover?.toLowerCase().includes(term) ||
        st.latitude?.toString().includes(term) ||
        st.longitude?.toString().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [mapPoints, riskFilter, searchTerm]);

  const clusters = useMemo(() => {
    if (currentZoom >= 7) return [];

    const gridSize = currentZoom <= 5 ? 4.5 : 2.5;
    const gridMap = new Map();

    filteredStations.forEach((st) => {
      const gridX = Math.floor(st.latitude / gridSize);
      const gridY = Math.floor(st.longitude / gridSize);
      const key = `${gridX}_${gridY}`;

      if (!gridMap.has(key)) {
        gridMap.set(key, {
          id: key,
          stations: [],
          latSum: 0,
          lonSum: 0,
          highCount: 0,
          medCount: 0,
          lowCount: 0
        });
      }

      const cluster = gridMap.get(key);
      cluster.stations.push(st);
      cluster.latSum += st.latitude;
      cluster.lonSum += st.longitude;

      const lvl = getRiskLevel(st);
      if (lvl === 'HIGH') cluster.highCount++;
      else if (lvl === 'MEDIUM') cluster.medCount++;
      else cluster.lowCount++;
    });

    return Array.from(gridMap.values()).map((c) => {
      const count = c.stations.length;
      return {
        id: c.id,
        count,
        lat: c.latSum / count,
        lon: c.lonSum / count,
        highCount: c.highCount,
        medCount: c.medCount,
        lowCount: c.lowCount,
        dominantRisk: c.highCount >= c.medCount && c.highCount >= c.lowCount ? 'HIGH' : c.medCount >= c.lowCount ? 'MEDIUM' : 'LOW',
        stations: c.stations
      };
    });
  }, [filteredStations, currentZoom]);

  const handleStationClick = (st) => {
    setSelectedStation(st);
    setMapCenter([st.latitude, st.longitude]);
    if (onSelectStation) onSelectStation(st);
  };

  const handleClusterClick = (cluster) => {
    setMapCenter([cluster.lat, cluster.lon]);
    setCurrentZoom((prev) => Math.min(prev + 2, 8));
  };

  const getMarkerColor = (level) => {
    const lvl = (level || '').toUpperCase();
    if (lvl === 'HIGH') return '#DC2626';
    if (lvl === 'MEDIUM') return '#D97706';
    return '#059669';
  };

  const weatherDemoCells = useMemo(() => {
    return filteredStations.slice(0, 7).map((station, index) => ({
      center: [station.latitude + (index % 2 === 0 ? 0.22 : -0.18), station.longitude + 0.15 * index],
      radius: 22000 + (station.risk_score || 20) * 250,
      intensity: station.risk_score || 50,
      risk: getRiskLevel(station)
    }));
  }, [filteredStations]);

  const renderFloodMarkers = () => {
    if (currentZoom < 7) {
      return clusters.map((c) => {
        const color = getMarkerColor(c.dominantRisk);
        const radius = Math.min(26, Math.max(16, 12 + Math.sqrt(c.count) * 2));
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lon]}
            radius={radius}
            pathOptions={{ color: '#FFFFFF', fillColor: color, fillOpacity: 0.85, weight: 2 }}
            eventHandlers={{ click: () => handleClusterClick(c) }}
          >
            <Popup>
              <div className="p-3 text-xs space-y-2 font-data">
                <div className="font-bold text-slate-900 border-b pb-1">Regional Catchment Cluster ({c.count} Stations)</div>
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between"><span className="text-red-600 font-semibold">● High Risk:</span><span className="font-mono-num font-bold">{c.highCount}</span></div>
                  <div className="flex justify-between"><span className="text-amber-600 font-semibold">● Medium Risk:</span><span className="font-mono-num font-bold">{c.medCount}</span></div>
                  <div className="flex justify-between"><span className="text-emerald-600 font-semibold">● Low Risk:</span><span className="font-mono-num font-bold">{c.lowCount}</span></div>
                </div>
                <div className="text-[11px] text-blue-600 font-semibold cursor-pointer pt-1">Click to zoom into this cluster →</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      });
    }

    return filteredStations.map((st) => {
      const color = getMarkerColor(st.risk_level);
      const isSelected = selectedStation?.id === st.id;
      const radius = st.risk_level === 'HIGH' ? 6 : st.risk_level === 'MEDIUM' ? 5 : 4;

      return (
        <CircleMarker
          key={st.id}
          center={[st.latitude, st.longitude]}
          radius={isSelected ? radius + 3 : radius}
          pathOptions={{
            color: isSelected ? '#0F172A' : '#FFFFFF',
            fillColor: color,
            fillOpacity: visualizationMode === '3d' ? 1 : 0.9,
            weight: isSelected ? 3 : 1.5
          }}
          eventHandlers={{ click: () => handleStationClick(st) }}
        >
          <Popup>
            <div className="p-3 text-xs space-y-1.5 font-data min-w-[200px]">
              <div className="font-bold text-slate-900">{st.location_name}</div>
              <div className="text-[11px] text-slate-500 font-mono-num">{st.river_basin} • {st.latitude.toFixed(3)}°N, {st.longitude.toFixed(3)}°E</div>
              <div className="border-t border-slate-200 pt-1.5 space-y-1 text-slate-700">
                <div className="flex justify-between"><span>Risk Score:</span><span className="font-bold font-mono-num" style={{ color }}>{st.risk_score} / 100 ({st.risk_level})</span></div>
                <div className="flex justify-between"><span>Rainfall:</span><span className="font-mono-num">{st.rainfall} mm</span></div>
                <div className="flex justify-between"><span>River Stage:</span><span className="font-mono-num">{st.river_level} m</span></div>
                <div className="flex justify-between"><span>Soil Saturation:</span><span className="font-mono-num">{st.soil_moisture}%</span></div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="card-surface p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search location, basin, or coordinate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-data"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium mr-1">Filter:</span>
          {[
            { id: 'ALL', label: `All (${mapPoints.length})` },
            { id: 'HIGH', label: 'High Risk' },
            { id: 'MEDIUM', label: 'Medium Risk' },
            { id: 'LOW', label: 'Low Risk' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRiskFilter(f.id)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                riskFilter === f.id ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="inline-flex shrink-0 rounded-md border border-slate-200 bg-white p-0.5" aria-label="Map view">
            {[
              { id: '2d', label: '2D MAP' },
              { id: '3d', label: '3D TERRAIN' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={visualizationMode === mode.id}
                onClick={() => onSetVisualizationMode?.(mode.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  visualizationMode === mode.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-8 card-surface h-[580px] relative overflow-hidden flex flex-col map-shell map-shell--${visualizationMode}`}>
          {visualizationMode !== '3d' && (
            <>
              <div
                className="absolute inset-0 pointer-events-none z-[999]"
                style={{
                  background: visualizationMode === 'weather'
                    ? 'radial-gradient(circle at 20% 30%, rgba(96,165,250,0.12), transparent 32%), linear-gradient(180deg, rgba(15,23,42,0.03), rgba(14,116,144,0.12))'
                    : 'transparent'
                }}
              />

                {visualizationMode === 'weather' && (
                  <>
                    <div className="storm-ribbon storm-ribbon--one" />
                    <div className="storm-ribbon storm-ribbon--two" />
                    <div className="storm-ribbon storm-ribbon--three" />
                  </>
                )}

                <MapContainer center={mapCenter} zoom={currentZoom} scrollWheelZoom className="map-surface w-full h-full relative z-10">
            <MapController center={mapCenter} zoom={currentZoom} onZoomChange={setCurrentZoom} />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />

            {visualizationMode === 'weather' && weatherDemoCells.map((cell, index) => (
              <Circle
                key={`weather-${index}`}
                center={cell.center}
                radius={cell.radius}
                pathOptions={{
                  color: cell.risk === 'HIGH' ? '#F59E0B' : cell.risk === 'MEDIUM' ? '#60A5FA' : '#93C5FD',
                  fillColor: cell.risk === 'HIGH' ? '#F59E0B' : cell.risk === 'MEDIUM' ? '#60A5FA' : '#93C5FD',
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '5 8'
                }}
              />
            ))}

            {renderFloodMarkers()}
          </MapContainer>
            </>
          )}

          {visualizationMode === '3d' && (
            <Suspense fallback={<div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 text-sm text-slate-600">Loading 3D terrain...</div>}>
              <LazyTerrainMap3D
                mapPoints={filteredStations}
                selectedState={selectedState}
                selectedStation={selectedStation}
                onSelectStation={handleStationClick}
              />
            </Suspense>
          )}

          <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 border border-slate-200 px-3 py-2 rounded-md shadow-sm text-xs font-data space-y-1">
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
              {visualizationMode === 'weather' ? 'Weather Demo Overlay' : 'Risk Thresholds'}
            </div>
            {visualizationMode === 'weather' ? (
              <>
                <div className="flex items-center gap-2 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /><span>Storm cells • demonstration data</span></div>
                <div className="flex items-center gap-2 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" /><span>Moderate rainfall advisory</span></div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /><span>High Risk (Score ≥65)</span></div>
                <div className="flex items-center gap-2 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /><span>Medium Risk (35–64)</span></div>
                <div className="flex items-center gap-2 text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /><span>Low Risk (&lt;35)</span></div>
              </>
            )}
          </div>

          <div className="absolute top-4 left-4 z-[1000] bg-white/90 border border-slate-200 px-2.5 py-1 rounded text-[11px] text-slate-600 font-data">
            {visualizationMode === '2d' && <span>2D map • flood risk primary layer</span>}
            {visualizationMode === '3d' && <span>3D terrain • enhanced elevation context</span>}
            {visualizationMode === 'weather' && <span>Weather Visualization — Demonstration Data</span>}
          </div>
        </div>

        <div className="lg:col-span-4 card-surface flex flex-col justify-between">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" />Hydrological Telemetry</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monitoring station diagnostics for {selectedState}</p>
          </div>

          {selectedStation ? (
            <div className="p-4 space-y-4 font-data text-xs overflow-y-auto max-h-[480px]">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedStation.location_name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium">{selectedStation.river_basin || 'Catchment Basin'}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${selectedStation.risk_level === 'HIGH' ? 'bg-red-600 text-white' : selectedStation.risk_level === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                    {selectedStation.risk_level} RISK
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                  <span className="text-slate-600">Calculated Risk Score:</span>
                  <span className="text-xl font-bold font-mono-num text-slate-900">{selectedStation.risk_score} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Location Coordinates</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200"><span className="text-slate-500 text-[11px] block">Latitude</span><span className="font-mono-num font-semibold text-slate-900">{selectedStation.latitude}° N</span></div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200"><span className="text-slate-500 text-[11px] block">Longitude</span><span className="font-mono-num font-semibold text-slate-900">{selectedStation.longitude}° E</span></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Hydrological Conditions</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200"><span className="text-slate-600">Rainfall (24h):</span><span className="font-mono-num font-bold text-slate-900">{selectedStation.rainfall} mm</span></div>
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200"><span className="text-slate-600">River / Water Stage:</span><span className="font-mono-num font-bold text-slate-900">{selectedStation.river_level} m</span></div>
                  <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200"><span className="text-slate-600">Soil Saturation:</span><span className="font-mono-num font-bold text-slate-900">{selectedStation.soil_moisture}%</span></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Terrain Characteristics</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200"><span className="text-slate-500 text-[11px] block">Elevation</span><span className="font-mono-num font-semibold text-slate-900">{selectedStation.elevation} m ASL</span></div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200"><span className="text-slate-500 text-[11px] block">Land Cover</span><span className="font-semibold text-slate-900">{selectedStation.land_cover || 'Urban'}</span></div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900">
                <div className="font-semibold text-[11px] uppercase tracking-wide text-blue-800">Recommended Response</div>
                <p className="text-[11px] mt-0.5 leading-relaxed text-blue-950">{selectedStation.recommended_action || 'Maintain routine gauge inspection and catchment drainage surveillance.'}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 font-data">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">Select a monitoring location on the map to view hydrological telemetry and risk diagnostics.</p>
            </div>
          )}

          <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-lg text-[11px] text-slate-500 flex items-center justify-between">
            <span>Data: Demonstration Grid</span>
            <span className="font-mono-num">350 Stations Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
