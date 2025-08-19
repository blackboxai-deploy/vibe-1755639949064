"use client";

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronLeft, 
  Filter, 
  Bookmark, 
  Layers, 
  Users, 
  Cog, 
  Map,
  Eye,
  EyeOff,
  Star,
  ChevronRight
} from 'lucide-react';

export default function LeftRail() {
  const { state, dispatch } = useApp();
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    savedViews: true,
    mapLayers: true,
    tools: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleLayer = (layerName: string) => {
    dispatch({ type: 'TOGGLE_LAYER', payload: layerName });
  };

  const mapLayers = [
    { id: 'humans', name: 'Personnel', icon: Users, count: state.humans.length, color: 'text-blue-400' },
    { id: 'machines', name: 'Equipment', icon: Cog, count: state.machines.length, color: 'text-green-400' },
    { id: 'incidents', name: 'Incidents', icon: Filter, count: state.incidents.length, color: 'text-red-400' },
    { id: 'sensors', name: 'Sensors', icon: Map, count: 24, color: 'text-purple-400' },
    { id: 'geofences', name: 'Geofences', icon: Map, count: 8, color: 'text-yellow-400' },
    { id: 'heatmap', name: 'Risk Heatmap', icon: Map, count: 0, color: 'text-orange-400' },
    { id: 'weather', name: 'Weather', icon: Map, count: 0, color: 'text-cyan-400' },
    { id: 'permits', name: 'Work Permits', icon: Map, count: 12, color: 'text-indigo-400' },
    { id: 'roads', name: 'Roads & Routes', icon: Map, count: 0, color: 'text-gray-400' }
  ];

  const savedViews = [
    { id: 'abqaiq-critical', name: 'Abqaiq – Critical Live', isStarred: true, filters: 'Critical, Live' },
    { id: 'khursaniyah-compressors', name: 'Khursaniyah – Compressors', isStarred: false, filters: 'Compressors, 24h' },
    { id: 'hse-audit', name: 'HSE Audit Week', isStarred: true, filters: 'Safety, Environmental' },
    { id: 'maintenance-schedule', name: 'Maintenance Schedule', isStarred: false, filters: 'Maintenance, This Week' },
    { id: 'emergency-response', name: 'Emergency Response', isStarred: true, filters: 'Critical, Emergency' }
  ];

  const filterCategories = [
    {
      name: 'Status',
      options: [
        { id: 'open', label: 'Open', count: 12 },
        { id: 'acknowledged', label: 'Acknowledged', count: 8 },
        { id: 'investigating', label: 'Investigating', count: 5 },
        { id: 'resolved', label: 'Resolved', count: 23 }
      ]
    },
    {
      name: 'Machine Type',
      options: [
        { id: 'pump', label: 'Pumps', count: 45 },
        { id: 'compressor', label: 'Compressors', count: 23 },
        { id: 'valve', label: 'Valves', count: 67 },
        { id: 'tank', label: 'Tanks', count: 12 },
        { id: 'sensor', label: 'Sensors', count: 156 }
      ]
    },
    {
      name: 'Contractor',
      options: [
        { id: 'aramco', label: 'Saudi Aramco', count: 89 },
        { id: 'sabic', label: 'SABIC', count: 34 },
        { id: 'schlumberger', label: 'Schlumberger', count: 23 },
        { id: 'halliburton', label: 'Halliburton', count: 18 }
      ]
    },
    {
      name: 'Shift',
      options: [
        { id: 'day', label: 'Day Shift', count: 67 },
        { id: 'night', label: 'Night Shift', count: 45 },
        { id: 'rotating', label: 'Rotating', count: 23 }
      ]
    }
  ];

  const tools = [
    { id: 'geofence', name: 'Draw Geofence', icon: Map },
    { id: 'measure', name: 'Measure Distance', icon: Map },
    { id: 'trace', name: 'Path Trace', icon: Map },
    { id: 'exclusion', name: 'Exclusion Zone', icon: Map },
    { id: 'snapshot', name: 'Snapshot', icon: Map }
  ];

  if (state.leftRailCollapsed) {
    return (
      <div className="w-12 bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_LEFT_RAIL' })}
          className="text-gray-400 hover:text-white p-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Separator className="w-6 bg-gray-600" />
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
          <Bookmark className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-sm font-medium text-white">Controls</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_LEFT_RAIL' })}
          className="text-gray-400 hover:text-white p-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Filters Section */}
          <Collapsible open={expandedSections.filters} onOpenChange={() => toggleSection('filters')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Filters</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.filters ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-3">
              {filterCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {category.name}
                  </h4>
                  {category.options.map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id={option.id} className="border-gray-600" />
                        <label
                          htmlFor={option.id}
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-400">
                        {option.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator className="bg-gray-700" />

          {/* Saved Views Section */}
          <Collapsible open={expandedSections.savedViews} onOpenChange={() => toggleSection('savedViews')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Saved Views</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.savedViews ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {savedViews.map((view) => (
                <div
                  key={view.id}
                  className="p-3 rounded-lg bg-gray-800 hover:bg-gray-750 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {view.isStarred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                      <span className="text-sm text-white font-medium">{view.name}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{view.filters}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator className="bg-gray-700" />

          {/* Map Layers Section */}
          <Collapsible open={expandedSections.mapLayers} onOpenChange={() => toggleSection('mapLayers')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Map Layers</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.mapLayers ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {mapLayers.map((layer) => {
                const Icon = layer.icon;
                const isVisible = state.selectedLayers.includes(layer.id);
                return (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {isVisible ? (
                          <Eye className="w-4 h-4 text-gray-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <Icon className={`w-4 h-4 ${isVisible ? layer.color : 'text-gray-600'}`} />
                      <span className={`text-sm ${isVisible ? 'text-white' : 'text-gray-500'}`}>
                        {layer.name}
                      </span>
                    </div>
                    {layer.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${isVisible ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-600'}`}
                      >
                        {layer.count}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          <Separator className="bg-gray-700" />

          {/* Tools Section */}
          <Collapsible open={expandedSections.tools} onOpenChange={() => toggleSection('tools')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Cog className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Tools</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.tools ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tool.name}
                  </Button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}