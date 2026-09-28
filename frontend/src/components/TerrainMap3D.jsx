import { useEffect, useRef } from 'react';
import { Map as MapLibreMap, Marker, NavigationControl, Popup, setWorkerUrl } from 'maplibre-gl';
import { RotateCcw } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { deriveStateFromCoordinates, STATE_CENTERS } from '../utils/stateLookup';

setWorkerUrl(maplibreWorkerUrl);

function getRiskLevel(station) {
  return (station.risk_level || (station.risk_score >= 65 ? 'HIGH' : station.risk_score >= 35 ? 'MEDIUM' : 'LOW')).toUpperCase();
}

function getRiskColor(level) {
  if (level === 'HIGH') return '#DC2626';
  if (level === 'MEDIUM') return '#D97706';
  return '#059669';
}

function createStationPopup(station, color) {
  const content = document.createElement('div');
  content.className = 'font-data min-w-[190px] text-xs';

  const title = document.createElement('div');
  title.className = 'mb-1 font-bold text-slate-900';
  title.textContent = station.location_name || 'Monitoring Station';
  content.appendChild(title);

  const basin = document.createElement('div');
  basin.className = 'mb-2 text-[11px] text-slate-500';
  basin.textContent = station.river_basin || 'Catchment Basin';
  content.appendChild(basin);

  const details = [
    ['Risk', `${getRiskLevel(station)} (${station.risk_score ?? station.risk_percentage ?? 0}/100)`],
    ['Rainfall', `${station.rainfall ?? 'N/A'} mm`],
    ['River stage', `${station.river_level ?? 'N/A'} m`],
    ['Soil saturation', `${station.soil_moisture ?? 'N/A'}%`],
    ['Coordinates', `${Number(station.latitude).toFixed(4)}, ${Number(station.longitude).toFixed(4)}`]
  ];

  details.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'flex justify-between gap-3 border-t border-slate-100 py-1 text-slate-700';
    const labelNode = document.createElement('span');
    labelNode.textContent = label;
    const valueNode = document.createElement('strong');
    valueNode.textContent = value;
    if (label === 'Risk') valueNode.style.color = color;
    row.append(labelNode, valueNode);
    content.appendChild(row);
  });

  return content;
}

export default function TerrainMap3D({ mapPoints = [], selectedState = 'All India', selectedStation, onSelectStation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const onSelectStationRef = useRef(onSelectStation);

  useEffect(() => {
    onSelectStationRef.current = onSelectStation;
  }, [onSelectStation]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const center = STATE_CENTERS[selectedState] || STATE_CENTERS['All India'];
    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          streets: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          },
          'terrain-dem': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 15,
            encoding: 'terrarium',
            attribution: 'Elevation data: AWS Terrain Tiles / SRTM'
          }
        },
        layers: [{ id: 'streets', type: 'raster', source: 'streets' }],
        terrain: { source: 'terrain-dem', exaggeration: 1.35 },
        sky: {}
      },
      center: [center[1], center[0]],
      zoom: selectedState === 'All India' ? 4.5 : 6,
      pitch: 55,
      bearing: -15,
      maxPitch: 85,
      antialias: true,
      attributionControl: true
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const stationState = deriveStateFromCoordinates(selectedStation?.latitude, selectedStation?.longitude);
    if (selectedStation && stationState === selectedState) return;

    const center = STATE_CENTERS[selectedState] || STATE_CENTERS['All India'];
    map.flyTo({
      center: [center[1], center[0]],
      zoom: selectedState === 'All India' ? 4.5 : 6,
      duration: 650
    });
  }, [selectedState, selectedStation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = mapPoints
      .filter((station) => Number.isFinite(Number(station.latitude)) && Number.isFinite(Number(station.longitude)))
      .map((station) => {
        const level = getRiskLevel(station);
        const color = getRiskColor(level);
        const element = document.createElement('button');
        const isSelected = selectedStation?.id === station.id;
        element.type = 'button';
        element.className = 'flood-terrain-station';
        element.setAttribute('aria-label', `${station.location_name || 'Monitoring station'}, ${level} risk`);
        element.title = `${station.location_name || 'Monitoring station'} · ${level} risk`;
        const markerSize = level === 'HIGH' ? 12 : level === 'MEDIUM' ? 10 : 8;
        element.style.width = `${markerSize}px`;
        element.style.height = `${markerSize}px`;
        element.style.padding = '0';
        element.style.border = '2px solid #fff';
        element.style.borderRadius = '50%';
        element.style.cursor = 'pointer';
        element.style.backgroundColor = color;
        element.style.boxShadow = isSelected
          ? '0 0 0 3px #fff, 0 0 0 5px #0f172a, 0 2px 8px rgba(15,23,42,.45)'
          : '0 0 0 2px #fff, 0 2px 8px rgba(15,23,42,.4)';

        const marker = new Marker({ element, anchor: 'center' })
          .setLngLat([Number(station.longitude), Number(station.latitude)])
          .addTo(map);

        element.addEventListener('click', (event) => {
          event.stopPropagation();
          onSelectStationRef.current?.(station);
          new Popup({ offset: 14, closeButton: true, maxWidth: '280px' })
            .setLngLat([Number(station.longitude), Number(station.latitude)])
            .setDOMContent(createStationPopup(station, color))
            .addTo(map);
        });

        return marker;
      });
  }, [mapPoints, selectedStation]);

  useEffect(() => {
    if (!selectedStation || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [Number(selectedStation.longitude), Number(selectedStation.latitude)],
      zoom: Math.max(mapRef.current.getZoom(), 7),
      duration: 650
    });
  }, [selectedStation]);

  const resetCamera = () => {
    const map = mapRef.current;
    if (!map) return;
    const center = STATE_CENTERS[selectedState] || STATE_CENTERS['All India'];
    map.flyTo({
      center: [center[1], center[0]],
      zoom: selectedState === 'All India' ? 4.5 : 6,
      pitch: 55,
      bearing: -15,
      duration: 700
    });
  };

  return (
    <div className="absolute inset-0 z-10">
      <div ref={containerRef} className="h-full w-full" aria-label="Interactive 3D terrain map of Indian river basins" />
      <button
        type="button"
        onClick={resetCamera}
        title="Reset camera"
        aria-label="Reset camera"
        className="absolute bottom-4 left-4 z-[1000] inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-md hover:bg-slate-50"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}