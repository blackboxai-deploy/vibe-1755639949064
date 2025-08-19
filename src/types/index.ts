// Core Entity Types for OpsEcho Operations Dashboard

export interface Location {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
}

export interface Human {
  id: string;
  name: string;
  role: 'operator' | 'supervisor' | 'hse' | 'maintenance' | 'contractor';
  badgeId: string;
  certifications: string[];
  location: Location;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'emergency' | 'offline';
  contact: {
    phone?: string;
    radio?: string;
    email?: string;
  };
  shift: {
    start: Date;
    end: Date;
    site: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Machine {
  id: string;
  name: string;
  type: 'pump' | 'compressor' | 'valve' | 'tank' | 'sensor' | 'vehicle' | 'generator' | 'other';
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: Location;
  status: 'operational' | 'maintenance' | 'fault' | 'offline' | 'emergency';
  healthScore: number; // 0-100
  lastMaintenance: Date;
  nextMaintenance: Date;
  assignedOperator?: string; // Human ID
  tags: string[];
  specifications: {
    capacity?: string;
    pressure?: string;
    temperature?: string;
    power?: string;
    [key: string]: string | undefined;
  };
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  type: 'safety' | 'equipment' | 'environmental' | 'security' | 'operational';
  priority: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
  detectedBy: 'ai' | 'human' | 'sensor';
  location: Location;
  site: string;
  unit: string;
  owner?: string; // Human ID
  assignee?: string; // Human ID
  involvedHumans: string[]; // Human IDs
  involvedMachines: string[]; // Machine IDs
  sla: {
    acknowledgeBy: Date;
    resolveBy: Date;
    isOverdue: boolean;
  };
  riskScore: number; // 0-100
  causeHypothesis?: string;
  rootCause?: string;
  resolution?: string;
  evidenceUrls: string[];
  workOrderId?: string;
  tags: string[];
}

export interface TelemetryChannel {
  id: string;
  machineId: string;
  name: string;
  type: 'pressure' | 'temperature' | 'vibration' | 'flow' | 'gas' | 'power' | 'level' | 'speed' | 'custom';
  unit: string;
  minValue: number;
  maxValue: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  currentValue: number;
  lastUpdate: Date;
  isAnomalous: boolean;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface TelemetryData {
  channelId: string;
  timestamp: Date;
  value: number;
  quality: 'good' | 'poor' | 'uncertain' | 'bad';
  isAnomaly: boolean;
  confidence?: number;
}

export interface HumanMachineInteraction {
  id: string;
  humanId: string;
  machineId: string;
  type: 'operation' | 'inspection' | 'maintenance' | 'override' | 'proximity' | 'emergency_stop';
  action: string;
  result: 'success' | 'failure' | 'partial' | 'pending';
  timestamp: Date;
  duration?: number; // seconds
  evidenceUrl?: string;
  notes?: string;
  permitId?: string;
  workOrderId?: string;
  riskAssessment?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
}

export interface ChatMessage {
  id: string;
  senderId: string; // Human ID
  senderName: string;
  senderRole: string;
  timestamp: Date;
  content: string;
  type: 'text' | 'voice' | 'file' | 'system';
  threadId?: string;
  incidentId?: string;
  replyToId?: string;
  attachments: {
    url: string;
    type: string;
    name: string;
    size: number;
  }[];
  isRadioTranscript: boolean;
  isEmergency: boolean;
  mentions: string[]; // Human or Machine IDs
  tags: string[];
}

export interface ChatThread {
  id: string;
  incidentId?: string;
  title: string;
  participants: string[]; // Human IDs
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  isActive: boolean;
  summary?: string;
}

// UI State Types
export interface MapViewport {
  center: Location;
  zoom: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface FilterState {
  timeRange: {
    start: Date;
    end: Date;
    preset?: 'live' | '15m' | '1h' | '4h' | '24h' | 'custom';
  };
  severity: ('critical' | 'high' | 'medium' | 'low' | 'info')[];
  status: string[];
  sites: string[];
  units: string[];
  machineTypes: string[];
  roles: string[];
  tags: string[];
}

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: FilterState;
  mapViewport: MapViewport;
  selectedLayers: string[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  language: 'en' | 'ar';
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  defaultView: string;
  notifications: {
    incidents: boolean;
    telemetryAlerts: boolean;
    chatMentions: boolean;
    systemUpdates: boolean;
  };
  dashboard: {
    refreshInterval: number; // seconds
    autoAcknowledge: boolean;
    soundAlerts: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'operator' | 'viewer';
  permissions: string[];
  sites: string[]; // Accessible sites
  preferences: UserPreferences;
  lastLogin: Date;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'incident_update' | 'telemetry_data' | 'chat_message' | 'human_location' | 'machine_status' | 'system_alert';
  data: any;
  timestamp: Date;
}

// AI Analysis Types
export interface IncidentAnalysis {
  incidentId: string;
  rootCauseHypotheses: {
    hypothesis: string;
    confidence: number;
    contributingFactors: string[];
    recommendations: string[];
  }[];
  riskAssessment: {
    currentRisk: number;
    potentialEscalation: number;
    mitigationSteps: string[];
  };
  similarIncidents: {
    incidentId: string;
    similarity: number;
    resolution: string;
  }[];
  nextSteps: string[];
  confidence: number;
}

export interface ChatSummary {
  threadId: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: {
    description: string;
    assignee?: string;
    dueDate?: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  sentiment: 'positive' | 'neutral' | 'concerned' | 'urgent';
  confidence: number;
}

// Statistics Types
export interface PanelStatistics {
  chatFeed: {
    activeTeams: number;
    activeParticipants: number;
    messagesLast24h: number;
  };
  telemetry: {
    sitesActive: number;
    machinesActive: number;
    anomalyPercentage: number;
    dataQuality: number;
  };
  humanMachineInteractions: {
    firstResponderTypePercentage: {
      human: number;
      machine: number;
    };
    successRates: {
      human: number;
      machine: number;
    };
    interactionsLast24h: number;
  };
}

// Export all types as a single namespace
export * from './index';