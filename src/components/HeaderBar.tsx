"use client";

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, Clock, AlertTriangle, MapPin, Users, Settings, Share, Download, Plus } from 'lucide-react';

export default function HeaderBar() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleTimeRangeChange = (preset: string) => {
    let start: Date;
    const end = new Date();

    switch (preset) {
      case 'live':
        start = new Date(Date.now() - 15 * 60 * 1000); // Last 15 minutes
        break;
      case '15m':
        start = new Date(Date.now() - 15 * 60 * 1000);
        break;
      case '1h':
        start = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '4h':
        start = new Date(Date.now() - 4 * 60 * 60 * 1000);
        break;
      case '24h':
        start = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    dispatch({
      type: 'SET_FILTERS',
      payload: {
        timeRange: { start, end, preset: preset as any }
      }
    });

    // Toggle live mode based on selection
    dispatch({ type: 'SET_LIVE_MODE', payload: preset === 'live' });
  };

  const handleSeverityFilter = (severity: string) => {
    const currentSeverities = state.filters.severity;
    const newSeverities = currentSeverities.includes(severity as any)
      ? currentSeverities.filter(s => s !== severity)
      : [...currentSeverities, severity as any];

    dispatch({
      type: 'SET_FILTERS',
      payload: { severity: newSeverities }
    });
  };

  // Calculate KPIs
  const kpis = {
    activeIncidents: state.incidents.filter(i => ['open', 'acknowledged', 'investigating'].includes(i.status)).length,
    criticalCount: state.incidents.filter(i => i.severity === 'critical').length,
    peopleAtRisk: state.humans.filter(h => h.status === 'emergency').length,
    machinesDown: state.machines.filter(m => m.status === 'fault' || m.status === 'offline').length,
    meanTimeToAcknowledge: '8m 32s', // Mock calculation
    meanTimeToResolve: '2h 15m', // Mock calculation
    checklistCompletion: '87%' // Mock calculation
  };

  return (
    <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-4">
      {/* Logo and Title */}
      <div className="flex items-center gap-3 min-w-fit">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">OE</span>
        </div>
        <h1 className="text-xl font-semibold text-white hidden sm:block">OpsEcho</h1>
      </div>

      <Separator orientation="vertical" className="h-8 bg-gray-600" />

      {/* Global Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search people, machines, incidents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        />
      </div>

      {/* Time Selector */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <Select value={state.filters.timeRange.preset} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-24 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="15m">15m</SelectItem>
            <SelectItem value="1h">1h</SelectItem>
            <SelectItem value="4h">4h</SelectItem>
            <SelectItem value="24h">24h</SelectItem>
          </SelectContent>
        </Select>
        {state.liveMode && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">LIVE</span>
          </div>
        )}
      </div>

      {/* Severity Filters */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1">
          {['critical', 'high', 'medium', 'low'].map((severity) => (
            <Badge
              key={severity}
              variant={state.filters.severity.includes(severity as any) ? 'default' : 'outline'}
              className={`cursor-pointer text-xs ${
                severity === 'critical' ? 'bg-red-500 hover:bg-red-600' :
                severity === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                severity === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                'bg-blue-500 hover:bg-blue-600'
              } ${!state.filters.severity.includes(severity as any) ? 'bg-transparent border-gray-600 text-gray-400' : ''}`}
              onClick={() => handleSeverityFilter(severity)}
            >
              {severity.charAt(0).toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>

      {/* Site Selector */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        <Select>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="all">All Sites</SelectItem>
            <SelectItem value="ghawar">Ghawar</SelectItem>
            <SelectItem value="abqaiq">Abqaiq</SelectItem>
            <SelectItem value="khursaniyah">Khursaniyah</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Role View */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <Select defaultValue="operator">
          <SelectTrigger className="w-28 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="hse">HSE</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-8 bg-gray-600" />

      {/* KPIs */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="font-semibold text-white">{kpis.activeIncidents}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-400">{kpis.criticalCount}</div>
          <div className="text-xs text-gray-400">Critical</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-yellow-400">{kpis.peopleAtRisk}</div>
          <div className="text-xs text-gray-400">At Risk</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-orange-400">{kpis.machinesDown}</div>
          <div className="text-xs text-gray-400">Down</div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-8 bg-gray-600" />

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="bg-green-600 hover:bg-green-700 border-green-600 text-white">
          <Plus className="w-4 h-4 mr-1" />
          Incident
        </Button>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Download className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Share className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}