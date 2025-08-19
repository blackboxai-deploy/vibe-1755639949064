"use client";

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Cog, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  FileText,
  Phone,
  Wrench,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { HumanMachineInteraction } from '@/types';

export default function HMIPanel() {
  const { state } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');

  // Mock additional interactions for demonstration
  const mockInteractions: HumanMachineInteraction[] = [
    {
      id: 'hmi_demo_1',
      humanId: 'human_1',
      machineId: 'machine_1_1',
      type: 'operation',
      action: 'Manual start sequence initiated',
      result: 'success',
      timestamp: new Date(Date.now() - 5 * 60000),
      duration: 180,
      notes: 'Started compressor unit after maintenance completion'
    },
    {
      id: 'hmi_demo_2',
      humanId: 'human_2',
      machineId: 'machine_1_2',
      type: 'inspection',
      action: 'Visual inspection and parameter check',
      result: 'partial',
      timestamp: new Date(Date.now() - 15 * 60000),
      duration: 300,
      notes: 'Minor oil leak detected, requires attention'
    },
    {
      id: 'hmi_demo_3',
      humanId: 'human_3',
      machineId: 'machine_1_1',
      type: 'override',
      action: 'Emergency pressure relief override',
      result: 'success',
      timestamp: new Date(Date.now() - 25 * 60000),
      duration: 45,
      notes: 'Manual override to prevent overpressure situation'
    },
    {
      id: 'hmi_demo_4',
      humanId: 'human_4',
      machineId: 'machine_1_3',
      type: 'maintenance',
      action: 'Scheduled lubrication service',
      result: 'success',
      timestamp: new Date(Date.now() - 45 * 60000),
      duration: 1200,
      notes: 'Routine maintenance completed successfully'
    },
    {
      id: 'hmi_demo_5',
      humanId: 'human_1',
      machineId: 'machine_1_4',
      type: 'proximity',
      action: 'Proximity alert triggered',
      result: 'pending',
      timestamp: new Date(Date.now() - 2 * 60000),
      duration: 0,
      notes: 'Worker entered restricted zone around pump station'
    }
  ];

  // Combine mock data with real data
  const allInteractions = [...state.humanMachineInteractions, ...mockInteractions];

  // Filter interactions
  const filteredInteractions = useMemo(() => {
    return allInteractions.filter(interaction => {
      if (filterType !== 'all' && interaction.type !== filterType) return false;
      if (filterResult !== 'all' && interaction.result !== filterResult) return false;
      
      if (filterRole !== 'all') {
        const human = state.humans.find(h => h.id === interaction.humanId);
        if (!human || human.role !== filterRole) return false;
      }
      
      // Filter by selected incidents
      if (state.selectedIncidentIds.length > 0) {
        const selectedIncidents = state.incidents.filter(i => 
          state.selectedIncidentIds.includes(i.id)
        );
        const involvedMachineIds = selectedIncidents.flatMap(i => i.involvedMachines);
        if (!involvedMachineIds.includes(interaction.machineId)) return false;
      }
      
      return true;
    });
  }, [allInteractions, filterType, filterRole, filterResult, state.selectedIncidentIds, state.incidents, state.humans]);

  // Get statistics
  const statistics = {
    firstResponderTypePercentage: state.statistics.humanMachineInteractions.firstResponderTypePercentage,
    successRates: state.statistics.humanMachineInteractions.successRates,
    interactionsLast24h: state.statistics.humanMachineInteractions.interactionsLast24h
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'operation': return Cog;
      case 'inspection': return Eye;
      case 'maintenance': return Wrench;
      case 'override': return AlertTriangle;
      case 'proximity': return Users;
      case 'emergency_stop': return XCircle;
      default: return Activity;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success': return 'text-green-400';
      case 'failure': return 'text-red-400';
      case 'partial': return 'text-yellow-400';
      case 'pending': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success': return CheckCircle;
      case 'failure': return XCircle;
      case 'partial': return AlertTriangle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Ongoing';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  const getHumanName = (humanId: string) => {
    const human = state.humans.find(h => h.id === humanId);
    return human ? human.name : 'Unknown';
  };

  const getHumanRole = (humanId: string) => {
    const human = state.humans.find(h => h.id === humanId);
    return human ? human.role : 'unknown';
  };

  const getMachineName = (machineId: string) => {
    const machine = state.machines.find(m => m.id === machineId);
    return machine ? machine.name : 'Unknown Machine';
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header with Statistics */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-white">Human–Machine Interactions</h3>
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
            <User className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">Human first:</span>
            <span className="text-white font-medium">{statistics.firstResponderTypePercentage.human}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Cog className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Machine first:</span>
            <span className="text-white font-medium">{statistics.firstResponderTypePercentage.machine}%</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Human success:</span>
            <span className="text-white font-medium">{statistics.successRates.human}%</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">Machine success:</span>
            <span className="text-white font-medium">{statistics.successRates.machine}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400">24h interactions:</span>
            <span className="text-white font-medium">{statistics.interactionsLast24h}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Action:</span>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 h-7 text-xs bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="operation">Operation</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="override">Override</SelectItem>
                <SelectItem value="proximity">Proximity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Role:</span>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-32 h-7 text-xs bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="hse">HSE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Result:</span>
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="w-32 h-7 text-xs bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Interactions Feed */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredInteractions.map((interaction) => {
            const ActionIcon = getActionIcon(interaction.type);
            const ResultIcon = getResultIcon(interaction.result);
            const humanName = getHumanName(interaction.humanId);
            const humanRole = getHumanRole(interaction.humanId);
            const machineName = getMachineName(interaction.machineId);

            return (
              <Card key={interaction.id} className="bg-gray-800 border-gray-600 hover:bg-gray-750 transition-colors">
                <CardContent className="p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ActionIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">{interaction.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ResultIcon className={`w-4 h-4 ${getResultColor(interaction.result)}`} />
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          interaction.result === 'success' ? 'border-green-500 text-green-400' :
                          interaction.result === 'failure' ? 'border-red-500 text-red-400' :
                          interaction.result === 'partial' ? 'border-yellow-500 text-yellow-400' :
                          'border-blue-500 text-blue-400'
                        }`}
                      >
                        {interaction.result}
                      </Badge>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">Actor:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{humanName}</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {humanRole}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Cog className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">Target:</span>
                      </div>
                      <span className="text-white font-medium">{machineName}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">Duration:</span>
                      </div>
                      <span className="text-gray-300">{formatDuration(interaction.duration || 0)}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">Time:</span>
                      </div>
                      <span className="text-gray-300">{formatTimeAgo(interaction.timestamp)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {interaction.notes && (
                    <div className="mt-3 pt-2 border-t border-gray-600">
                      <p className="text-xs text-gray-300">{interaction.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    {interaction.permitId && (
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        View Permit
                      </Button>
                    )}
                    {interaction.workOrderId && (
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        <Wrench className="w-3 h-3 mr-1" />
                        Work Order
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    {interaction.evidenceUrl && (
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Evidence
                      </Button>
                    )}
                  </div>

                  {/* Risk Assessment */}
                  {interaction.riskAssessment && (
                    <div className="mt-3 pt-2 border-t border-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Risk Level:</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            interaction.riskAssessment.level === 'critical' ? 'border-red-500 text-red-400' :
                            interaction.riskAssessment.level === 'high' ? 'border-orange-500 text-orange-400' :
                            interaction.riskAssessment.level === 'medium' ? 'border-yellow-500 text-yellow-400' :
                            'border-green-500 text-green-400'
                          }`}
                        >
                          {interaction.riskAssessment.level}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredInteractions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No interactions found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}