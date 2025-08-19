"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon factory
const createCustomIcon = (type: string, status: string) => {
  const getColor = () => {
    if (type === 'human') {
      switch (status) {
        case 'active': return '#22c55e';
        case 'emergency': return '#ef4444';
        case 'inactive': return '#6b7280';
        default: return '#3b82f6';
      }
    } else if (type === 'machine') {
      switch (status) {
        case 'operational': return '#22c55e';
        case 'fault': return '#ef4444';
        case 'maintenance': return '#f59e0b';
        case 'offline': return '#6b7280';
        default: return '#3b82f6';
      }
    } else if (type === 'incident') {
      switch (status) {
        case 'critical': return '#dc2626';
        case 'high': return '#ea580c';
        case 'medium': return '#d97706';
        case 'low': return '#0ea5e9';
        default: return '#6366f1';
      }
    }
    return '#3b82f6';
  };

  const color = getColor();
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: white;
        font-weight: bold;
      ">
        ${type === 'human' ? 'H' : type === 'machine' ? 'M' : 'I'}
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

// Map event handler component
function MapEventHandler() {
  const { dispatch } = useApp();
  
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      dispatch({
        type: 'SET_MAP_VIEWPORT',
        payload: {
          center: { lat: center.lat, lng: center.lng },
          zoom
        }
      });
    },
    click: (e) => {
      // Handle map click - could be used for creating new incidents
      console.log('Map clicked at:', e.latlng);
    }
  });

  return null;
}

// Playback controls component
function PlaybackControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentTime(new Date(Date.now() - 24 * 60 * 60 * 1000)); // 24 hours ago
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="absolute bottom-4 left-4 bg-gray-900/90 border-gray-700 text-white z-[1000]">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleRestart}
              className="text-gray-400 hover:text-white p-1"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-400 hover:text-white p-1"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handlePlayPause}
              className="text-white hover:bg-gray-700 p-1"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-400 hover:text-white p-1"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-400">Time: </span>
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {playbackSpeed}x Speed
          </Badge>
          
          {isPlaying && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-400">PLAYBACK</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function InteractiveMap() {
  const { state, dispatch } = useApp();
  const mapRef = useRef<L.Map>(null);
  const [mapKey, setMapKey] = useState(0);

  // Force map refresh when data changes
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [state.incidents, state.humans, state.machines]);

  // Handle entity selection
  const handleEntityClick = (type: 'human' | 'machine' | 'incident', id: string) => {
    if (type === 'incident') {
      dispatch({ type: 'SELECT_INCIDENTS', payload: [id] });
      dispatch({ type: 'SET_RIGHT_PANEL', payload: true });
    } else if (type === 'human') {
      dispatch({ type: 'SELECT_HUMANS', payload: [id] });
    } else if (type === 'machine') {
      dispatch({ type: 'SELECT_MACHINES', payload: [id] });
    }
  };

  // Filter entities based on selected layers
  const visibleHumans = state.selectedLayers.includes('humans') ? state.humans : [];
  const visibleMachines = state.selectedLayers.includes('machines') ? state.machines : [];
  const visibleIncidents = state.selectedLayers.includes('incidents') ? state.incidents : [];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        key={mapKey}
        center={[state.mapViewport.center.lat, state.mapViewport.center.lng]}
        zoom={state.mapViewport.zoom}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
      >
        {/* Base Tile Layer - Satellite imagery */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Event Handler */}
        <MapEventHandler />

        {/* Human Markers */}
        {visibleHumans.map((human) => (
          <Marker
            key={human.id}
            position={[human.location.lat, human.location.lng]}
            icon={createCustomIcon('human', human.status)}
            eventHandlers={{
              click: () => handleEntityClick('human', human.id)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-48">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{human.name}</h3>
                  <Badge 
                    variant={human.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {human.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Role:</span> {human.role}</p>
                  <p><span className="font-medium">Badge:</span> {human.badgeId}</p>
                  <p><span className="font-medium">Site:</span> {human.shift.site}</p>
                  <p><span className="font-medium">Last Seen:</span> {human.lastSeen.toLocaleTimeString()}</p>
                  {human.contact.radio && (
                    <p><span className="font-medium">Radio:</span> {human.contact.radio}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Machine Markers */}
        {visibleMachines.map((machine) => (
          <Marker
            key={machine.id}
            position={[machine.location.lat, machine.location.lng]}
            icon={createCustomIcon('machine', machine.status)}
            eventHandlers={{
              click: () => handleEntityClick('machine', machine.id)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-48">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                  <Badge 
                    variant={machine.status === 'operational' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {machine.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Type:</span> {machine.type}</p>
                  <p><span className="font-medium">Model:</span> {machine.model}</p>
                  <p><span className="font-medium">Health:</span> {machine.healthScore}%</p>
                  <p><span className="font-medium">Manufacturer:</span> {machine.manufacturer}</p>
                  {machine.specifications.capacity && (
                    <p><span className="font-medium">Capacity:</span> {machine.specifications.capacity}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident Markers with Circles */}
        {visibleIncidents.map((incident) => (
          <div key={incident.id}>
            {/* Incident Circle */}
            <Circle
              center={[incident.location.lat, incident.location.lng]}
              radius={incident.severity === 'critical' ? 200 : incident.severity === 'high' ? 150 : 100}
              pathOptions={{
                color: incident.severity === 'critical' ? '#dc2626' : 
                       incident.severity === 'high' ? '#ea580c' :
                       incident.severity === 'medium' ? '#d97706' : '#0ea5e9',
                fillColor: incident.severity === 'critical' ? '#dc2626' : 
                          incident.severity === 'high' ? '#ea580c' :
                          incident.severity === 'medium' ? '#d97706' : '#0ea5e9',
                fillOpacity: 0.2,
                weight: 2
              }}
            />
            
            {/* Incident Marker */}
            <Marker
              position={[incident.location.lat, incident.location.lng]}
              icon={createCustomIcon('incident', incident.severity)}
              eventHandlers={{
                click: () => handleEntityClick('incident', incident.id)
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-64">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                    <Badge 
                      variant={incident.severity === 'critical' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {incident.severity}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Status:</span> {incident.status}</p>
                    <p><span className="font-medium">Type:</span> {incident.type}</p>
                    <p><span className="font-medium">Site:</span> {incident.site}</p>
                    <p><span className="font-medium">Risk Score:</span> {incident.riskScore}/100</p>
                    <p><span className="font-medium">Created:</span> {incident.createdAt.toLocaleTimeString()}</p>
                  </div>
                  <p className="text-sm text-gray-700">{incident.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="text-xs">
                      Acknowledge
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Assign
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {/* Playback Controls */}
      <PlaybackControls />

      {/* Map Legend */}
      <Card className="absolute top-4 right-4 bg-gray-900/90 border-gray-700 text-white z-[1000]">
        <CardContent className="p-3">
          <h4 className="text-sm font-medium mb-2">Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Operational/Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Maintenance/Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Fault/Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Offline/Inactive</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}