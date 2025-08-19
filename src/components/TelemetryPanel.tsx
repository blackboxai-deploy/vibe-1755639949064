"use client";

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { 
  Activity, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Pin,
  Bot,
  MapPin
} from 'lucide-react';

export default function TelemetryPanel() {
  const { state } = useApp();
  const [selectedChannel, setSelectedChannel] = useState<'pressure' | 'temperature' | 'vibration' | 'flow' | 'power'>('pressure');
  const [pinnedChannels, setPinnedChannels] = useState<string[]>([]);

  // Mock telemetry data for charts
  const generateTelemetryData = (channelType: string) => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000); // Last 24 minutes
      let value = 0;
      let isAnomaly = false;
      
      switch (channelType) {
        case 'pressure':
          value = 75 + Math.sin(i * 0.2) * 10 + Math.random() * 5;
          isAnomaly = value > 85 || value < 65;
          break;
        case 'temperature':
          value = 80 + Math.sin(i * 0.1) * 20 + Math.random() * 8;
          isAnomaly = value > 100 || value < 60;
          break;
        case 'vibration':
          value = 2 + Math.random() * 3;
          isAnomaly = value > 4;
          break;
        case 'flow':
          value = 500 + Math.sin(i * 0.15) * 100 + Math.random() * 50;
          isAnomaly = value > 650 || value < 400;
          break;
        case 'power':
          value = 250 + Math.sin(i * 0.1) * 50 + Math.random() * 25;
          isAnomaly = value > 320 || value < 200;
          break;
      }
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: parseFloat(value.toFixed(2)),
        isAnomaly,
        timestamp: time
      });
    }
    return data;
  };

  // Filter channels based on selected machines
  const relevantChannels = useMemo(() => {
    if (state.selectedIncidentIds.length === 0) {
      return state.telemetryChannels.slice(0, 20); // Show first 20 for demo
    }
    
    const selectedIncidents = state.incidents.filter(i => 
      state.selectedIncidentIds.includes(i.id)
    );
    const involvedMachineIds = selectedIncidents.flatMap(i => i.involvedMachines);
    
    return state.telemetryChannels.filter(channel => 
      involvedMachineIds.includes(channel.machineId)
    );
  }, [state.selectedIncidentIds, state.incidents, state.telemetryChannels]);

  // Filter channels by type
  const channelsByType = useMemo(() => {
    return relevantChannels.filter(channel => channel.type === selectedChannel);
  }, [relevantChannels, selectedChannel]);

  // Get statistics
  const statistics = {
    sitesActive: state.statistics.telemetry.sitesActive,
    machinesActive: state.statistics.telemetry.machinesActive,
    anomalyPercentage: state.statistics.telemetry.anomalyPercentage,
    dataQuality: state.statistics.telemetry.dataQuality
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'pressure': return Gauge;
      case 'temperature': return Thermometer;
      case 'vibration': return Activity;
      case 'flow': return Droplets;
      case 'power': return Zap;
      default: return Activity;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Minus;
      default: return Minus;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-red-400';
      case 'down': return 'text-blue-400';
      case 'stable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const togglePinChannel = (channelId: string) => {
    setPinnedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header with Statistics */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-white">Machine Telemetry</h3>
          </div>
          {state.selectedIncidentIds.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Filtered by Incident
            </Badge>
          )}
        </div>
        
        {/* Statistics Bar */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">Sites active:</span>
            <span className="text-white font-medium">{statistics.sitesActive}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Machines active:</span>
            <span className="text-white font-medium">{statistics.machinesActive}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span className="text-gray-400">Anomalies:</span>
            <span className="text-white font-medium">{statistics.anomalyPercentage}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Data quality:</span>
            <span className="text-white font-medium">{statistics.dataQuality}%</span>
          </div>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Channel Type:</span>
          <div className="flex gap-1">
            {['pressure', 'temperature', 'vibration', 'flow', 'power'].map((type) => {
              const Icon = getChannelIcon(type);
              return (
                <Button
                  key={type}
                  size="sm"
                  variant={selectedChannel === type ? 'default' : 'outline'}
                  onClick={() => setSelectedChannel(type as any)}
                  className="text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="trend" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-b border-gray-700">
            <TabsTrigger value="trend" className="text-xs">Trend</TabsTrigger>
            <TabsTrigger value="anomalies" className="text-xs">Anomalies</TabsTrigger>
            <TabsTrigger value="setpoints" className="text-xs">Setpoints</TabsTrigger>
            <TabsTrigger value="health" className="text-xs">Health Score</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="flex-1 flex flex-col m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Main Chart */}
                {channelsByType.length > 0 && (
                  <Card className="bg-gray-800 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white flex items-center justify-between">
                        {channelsByType[0].name}
                        <Badge variant="outline" className="text-xs">
                          {channelsByType[0].unit}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={generateTelemetryData(selectedChannel)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#9CA3AF"
                            fontSize={10}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            fontSize={10}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '6px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Channel Sparklines */}
                <div className="grid grid-cols-1 gap-3">
                  {channelsByType.slice(0, 8).map((channel) => {
                    const Icon = getChannelIcon(channel.type);
                    const TrendIcon = getTrendIcon(channel.trendDirection);
                    const sparklineData = generateTelemetryData(channel.type).slice(-12);
                    
                    return (
                      <div
                        key={channel.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          channel.isAnomalous 
                            ? 'bg-red-900/20 border-red-600' 
                            : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-white font-medium">{channel.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePinChannel(channel.id)}
                              className="p-1 h-auto"
                            >
                              <Pin className={`w-3 h-3 ${
                                pinnedChannels.includes(channel.id) ? 'text-blue-400' : 'text-gray-500'
                              }`} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-mono text-white">
                              {channel.currentValue.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">{channel.unit}</span>
                            <TrendIcon className={`w-3 h-3 ${getTrendColor(channel.trendDirection)}`} />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 h-8">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparklineData}>
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={channel.isAnomalous ? "#EF4444" : "#3B82F6"}
                                  strokeWidth={1}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="ml-3 text-xs text-gray-400">
                            Updated {Math.floor((Date.now() - channel.lastUpdate.getTime()) / 1000)}s ago
                          </div>
                        </div>

                        {channel.isAnomalous && (
                          <div className="mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-red-400">Anomaly detected</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="anomalies" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {channelsByType.filter(c => c.isAnomalous).map((channel) => (
                  <Card key={channel.id} className="bg-red-900/20 border-red-600">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{channel.name}</span>
                        <Badge variant="destructive" className="text-xs">
                          ANOMALY
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p>Current: {channel.currentValue.toFixed(2)} {channel.unit}</p>
                        <p>Threshold: {channel.criticalThreshold} {channel.unit}</p>
                        <p>Deviation: {((channel.currentValue / (channel.criticalThreshold || 1) - 1) * 100).toFixed(1)}%</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {channelsByType.filter(c => c.isAnomalous).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>No anomalies detected</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="setpoints" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {channelsByType.map((channel) => (
                  <Card key={channel.id} className="bg-gray-800 border-gray-600">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">{channel.name}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Value:</span>
                          <span className="text-white">{channel.currentValue.toFixed(2)} {channel.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Warning Threshold:</span>
                          <span className="text-yellow-400">{channel.warningThreshold} {channel.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Critical Threshold:</span>
                          <span className="text-red-400">{channel.criticalThreshold} {channel.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Operating Range:</span>
                          <span className="text-gray-300">{channel.minValue} - {channel.maxValue} {channel.unit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="health" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4">
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI Health Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-300">
                      <p className="mb-2">
                        <span className="text-gray-400">Overall Health Score:</span>
                        <span className="text-white font-medium ml-2">78/100</span>
                      </p>
                      <p className="mb-3">
                        Analysis of {channelsByType.length} channels shows moderate performance 
                        with {channelsByType.filter(c => c.isAnomalous).length} anomalies detected.
                      </p>
                      <div className="space-y-2">
                        <p className="text-gray-400 font-medium">Key Insights:</p>
                        <ul className="space-y-1 text-gray-300">
                          <li>• Pressure systems operating within normal parameters</li>
                          <li>• Temperature fluctuations detected in 2 units</li>
                          <li>• Vibration levels elevated on Compressor C-101</li>
                          <li>• Flow rates stable across all monitored systems</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}