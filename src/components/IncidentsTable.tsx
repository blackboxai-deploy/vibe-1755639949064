"use client";

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  ArrowUpDown, 
  MoreVertical, 
  Users, 
  Cog, 
  Clock,
  AlertTriangle,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  User,
  MessageSquare
} from 'lucide-react';
import { Incident } from '@/types';

interface SortConfig {
  key: keyof Incident | 'age' | 'slaRemaining';
  direction: 'asc' | 'desc';
}

export default function IncidentsTable() {
  const { state, dispatch } = useApp();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [groupBy, setGroupBy] = useState<'none' | 'severity' | 'status' | 'site'>('none');

  // Filter incidents based on current filters
  const filteredIncidents = useMemo(() => {
    return state.incidents.filter(incident => {
      // Severity filter
      if (!state.filters.severity.includes(incident.severity)) {
        return false;
      }
      
      // Status filter
      if (state.filters.status.length > 0 && !state.filters.status.includes(incident.status)) {
        return false;
      }
      
      // Time range filter
      const incidentTime = new Date(incident.createdAt);
      if (incidentTime < state.filters.timeRange.start || incidentTime > state.filters.timeRange.end) {
        return false;
      }
      
      // Site filter
      if (state.filters.sites.length > 0 && !state.filters.sites.includes(incident.site)) {
        return false;
      }
      
      return true;
    });
  }, [state.incidents, state.filters]);

  // Sort incidents
  const sortedIncidents = useMemo(() => {
    const sorted = [...filteredIncidents].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'age') {
        aValue = Date.now() - new Date(a.createdAt).getTime();
        bValue = Date.now() - new Date(b.createdAt).getTime();
      } else if (sortConfig.key === 'slaRemaining') {
        aValue = new Date(a.sla.resolveBy).getTime() - Date.now();
        bValue = new Date(b.sla.resolveBy).getTime() - Date.now();
      } else {
        aValue = a[sortConfig.key as keyof Incident];
        bValue = b[sortConfig.key as keyof Incident];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredIncidents, sortConfig]);

  // Group incidents
  const groupedIncidents = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Incidents': sortedIncidents };
    }

    return sortedIncidents.reduce((groups, incident) => {
      const key = incident[groupBy];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(incident);
      return groups;
    }, {} as Record<string, Incident[]>);
  }, [sortedIncidents, groupBy]);

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowSelect = (incidentId: string) => {
    setSelectedRows(prev => 
      prev.includes(incidentId) 
        ? prev.filter(id => id !== incidentId)
        : [...prev, incidentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredIncidents.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredIncidents.map(i => i.id));
    }
  };

  const handleIncidentClick = (incident: Incident) => {
    dispatch({ type: 'SELECT_INCIDENTS', payload: [incident.id] });
    dispatch({ type: 'SET_RIGHT_PANEL', payload: true });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAge = (createdAt: Date) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatSlaTime = (resolveBy: Date, isOverdue: boolean) => {
    const diff = new Date(resolveBy).getTime() - Date.now();
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
    
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    return isOverdue ? `-${timeStr}` : timeStr;
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-white">
            Incidents ({filteredIncidents.length})
          </h2>
          
          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedRows.length} selected
              </Badge>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Assign Owner
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Escalate
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Change Status
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Group By */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Group: {groupBy === 'none' ? 'None' : groupBy}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem onClick={() => setGroupBy('none')}>None</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('severity')}>Severity</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('status')}>Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('site')}>Site</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-900 z-10">
            <TableRow className="border-gray-700 hover:bg-gray-800">
              <TableHead className="w-8">
                <Checkbox
                  checked={selectedRows.length === filteredIncidents.length && filteredIncidents.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-600"
                />
              </TableHead>
              <TableHead className="w-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('severity')}
                  className="h-auto p-0 text-gray-400 hover:text-white"
                >
                  Severity
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="min-w-64">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  className="h-auto p-0 text-gray-400 hover:text-white"
                >
                  Title
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-32">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('site')}
                  className="h-auto p-0 text-gray-400 hover:text-white"
                >
                  Site & Unit
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-24">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 text-gray-400 hover:text-white"
                >
                  Status
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-24">Owner</TableHead>
              <TableHead className="w-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('slaRemaining')}
                  className="h-auto p-0 text-gray-400 hover:text-white"
                >
                  SLA
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-16">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('age')}
                  className="h-auto p-0 text-gray-400 hover:text-white"
                >
                  Age
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-20">Involved</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedIncidents).map(([groupName, incidents]) => (
              <>
                {groupBy !== 'none' && (
                  <TableRow key={groupName} className="border-gray-700">
                    <TableCell colSpan={10} className="bg-gray-800 font-medium text-white">
                      {groupName} ({incidents.length})
                    </TableCell>
                  </TableRow>
                )}
                {incidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className={`border-gray-700 hover:bg-gray-800 cursor-pointer ${
                      state.selectedIncidentIds.includes(incident.id) ? 'bg-gray-800' : ''
                    }`}
                    onClick={() => handleIncidentClick(incident)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.includes(incident.id)}
                        onCheckedChange={() => handleRowSelect(incident.id)}
                        className="border-gray-600"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(incident.severity)}`}></div>
                        <AlertTriangle className={`w-4 h-4 ${
                          incident.severity === 'critical' ? 'text-red-400' :
                          incident.severity === 'high' ? 'text-orange-400' :
                          incident.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white font-medium text-sm">{incident.title}</p>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-1">{incident.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-white">
                          <MapPin className="w-3 h-3" />
                          {incident.site}
                        </div>
                        <p className="text-gray-400 text-xs">{incident.unit}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {incident.owner ? (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-300">{incident.owner}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${incident.sla.isOverdue ? 'text-red-400' : 'text-gray-400'}`} />
                        <span className={`text-xs ${incident.sla.isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
                          {formatSlaTime(incident.sla.resolveBy, incident.sla.isOverdue)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-400">{formatAge(incident.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          <span className="text-gray-300">{incident.involvedHumans.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Cog className="w-3 h-3 text-green-400" />
                          <span className="text-gray-300">{incident.involvedMachines.length}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-white">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-600">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            Acknowledge
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            Assign Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" />
                            Add Comment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <XCircle className="w-3 h-3" />
                            Escalate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}