"use client";

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { 
  X, 
  AlertTriangle, 
  Users, 
  Cog, 
  Activity, 
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Radio,
  FileText,
  Wrench,
  Shield,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Flag,
  CheckCircle,
  XCircle,
  Upload
} from 'lucide-react';

export default function ContextPanel() {
  const { state, dispatch } = useApp();

  // Get selected incident details
  const selectedIncident = useMemo(() => {
    if (state.selectedIncidentIds.length === 0) return null;
    return state.incidents.find(i => i.id === state.selectedIncidentIds[0]);
  }, [state.selectedIncidentIds, state.incidents]);

  // Get involved entities
  const involvedHumans = useMemo(() => {
    if (!selectedIncident) return [];
    return state.humans.filter(h => selectedIncident.involvedHumans.includes(h.id));
  }, [selectedIncident, state.humans]);

  const involvedMachines = useMemo(() => {
    if (!selectedIncident) return [];
    return state.machines.filter(m => selectedIncident.involvedMachines.includes(m.id));
  }, [selectedIncident, state.machines]);

  // Get relevant telemetry channels
  const relevantChannels = useMemo(() => {
    if (!selectedIncident) return [];
    const machineIds = selectedIncident.involvedMachines;
    return state.telemetryChannels.filter(c => machineIds.includes(c.machineId)).slice(0, 3);
  }, [selectedIncident, state.telemetryChannels]);

  // Generate mock telemetry data for charts
  const generateMockData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h`,
      value: 75 + Math.sin(i * 0.2) * 10 + Math.random() * 5
    }));
  };

  const handleClosePanel = () => {
    dispatch({ type: 'SET_RIGHT_PANEL', payload: false });
    dispatch({ type: 'SELECT_INCIDENTS', payload: [] });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-600';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-400';
      case 'acknowledged': return 'text-yellow-400';
      case 'investigating': return 'text-blue-400';
      case 'resolved': return 'text-green-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  if (!selectedIncident) {
    return (
      <div className="h-full bg-gray-900 flex flex-col">
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-sm font-medium text-white">Context Panel</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClosePanel}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <p>Select an incident to view details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-sm font-medium text-white">Incident Details</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClosePanel}
          className="text-gray-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={state.selectedTab} onValueChange={(tab) => dispatch({ type: 'SET_SELECTED_TAB', payload: tab as any })} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-b border-gray-700">
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            <TabsTrigger value="entities" className="text-xs">Entities</TabsTrigger>
            <TabsTrigger value="telemetry" className="text-xs">Telemetry</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Incident Header */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{selectedIncident.title}</h3>
                      <Badge className={`${getSeverityColor(selectedIncident.severity)}`}>
                        {selectedIncident.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-2 font-medium ${getStatusColor(selectedIncident.status)}`}>
                          {selectedIncident.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <span className="ml-2 text-white">{selectedIncident.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Priority:</span>
                        <span className="ml-2 text-white">{selectedIncident.priority}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Risk Score:</span>
                        <span className="ml-2 text-white">{selectedIncident.riskScore}/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{formatTimeAgo(selectedIncident.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Update:</span>
                      <span className="text-white">{formatTimeAgo(selectedIncident.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">SLA Deadline:</span>
                      <span className={`${selectedIncident.sla.isOverdue ? 'text-red-400' : 'text-white'}`}>
                        {selectedIncident.sla.resolveBy.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Site:</span>
                      <span className="text-white">{selectedIncident.site}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unit:</span>
                      <span className="text-white">{selectedIncident.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Coordinates:</span>
                      <span className="text-white font-mono">
                        {selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">{selectedIncident.description}</p>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                {selectedIncident.causeHypothesis && (
                  <Card className="bg-gray-800 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        AI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Cause Hypothesis:</span>
                          <p className="text-gray-300 mt-1">{selectedIncident.causeHypothesis}</p>
                        </div>
                        {selectedIncident.rootCause && (
                          <div>
                            <span className="text-gray-400">Root Cause:</span>
                            <p className="text-gray-300 mt-1">{selectedIncident.rootCause}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="entities" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Humans */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Personnel ({involvedHumans.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {involvedHumans.map((human) => (
                      <div key={human.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{human.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {human.role}
                            </Badge>
                            <span className="text-gray-400">{human.badgeId}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Last seen: {formatTimeAgo(human.lastSeen)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="p-1">
                            <Phone className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="p-1">
                            <Radio className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="p-1">
                            <Mail className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Machines */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Cog className="w-4 h-4" />
                      Equipment ({involvedMachines.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {involvedMachines.map((machine) => (
                      <div key={machine.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">{machine.name}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary" className="text-xs">
                                {machine.type}
                              </Badge>
                              <span className="text-gray-400">{machine.model}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white">{machine.healthScore}%</p>
                            <p className="text-xs text-gray-400">Health</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <span className={`ml-1 ${
                              machine.status === 'operational' ? 'text-green-400' :
                              machine.status === 'fault' ? 'text-red-400' :
                              machine.status === 'maintenance' ? 'text-yellow-400' :
                              'text-gray-400'
                            }`}>
                              {machine.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <span className="ml-1 text-white">{machine.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="telemetry" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {relevantChannels.map((channel) => (
                  <Card key={channel.id} className="bg-gray-800 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white flex items-center justify-between">
                        {channel.name}
                        <Badge variant="outline" className="text-xs">
                          {channel.unit}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Current:</span>
                          <span className="text-white font-mono">{channel.currentValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-400">Trend:</span>
                          <span className={`${
                            channel.trendDirection === 'up' ? 'text-red-400' :
                            channel.trendDirection === 'down' ? 'text-blue-400' :
                            'text-gray-400'
                          }`}>
                            {channel.trendDirection}
                          </span>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={generateMockData()}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={channel.isAnomalous ? "#EF4444" : "#3B82F6"}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      {channel.isAnomalous && (
                        <div className="mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-red-400">Anomaly detected</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {relevantChannels.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <p>No telemetry data available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Quick Actions */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Acknowledge Incident
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Owner
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <Flag className="w-4 h-4 mr-2" />
                      Escalate
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <XCircle className="w-4 h-4 mr-2" />
                      Declare Emergency
                    </Button>
                  </CardContent>
                </Card>

                {/* Workflow Actions */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <Wrench className="w-4 h-4 mr-2" />
                      Create Work Order
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Attach Evidence
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                    <Button className="w-full justify-start" size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Link SOP
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="documents" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* SOPs */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Standard Operating Procedures
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-gray-750">
                      <span className="text-sm text-white">Emergency Response Protocol</span>
                      <Button size="sm" variant="ghost" className="p-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-gray-750">
                      <span className="text-sm text-white">Equipment Shutdown Procedure</span>
                      <Button size="sm" variant="ghost" className="p-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-gray-750">
                      <span className="text-sm text-white">Incident Investigation Guide</span>
                      <Button size="sm" variant="ghost" className="p-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Safety Forms */}
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Safety Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-gray-750">
                      <span className="text-sm text-white">Risk Assessment Form</span>
                      <Button size="sm" variant="ghost" className="p-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-gray-750">
                      <span className="text-sm text-white">Incident Report Template</span>
                      <Button size="sm" variant="ghost" className="p-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
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