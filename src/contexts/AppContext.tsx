"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Incident,
  Human,
  Machine,
  FilterState,
  MapViewport,
  User,
  SavedView,
  PanelStatistics,
  TelemetryChannel,
  ChatThread,
  HumanMachineInteraction
} from '@/types';

// App State Interface
interface AppState {
  // User and Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Core Data
  incidents: Incident[];
  humans: Human[];
  machines: Machine[];
  telemetryChannels: TelemetryChannel[];
  chatThreads: ChatThread[];
  humanMachineInteractions: HumanMachineInteraction[];
  
  // UI State
  selectedIncidentIds: string[];
  selectedHumanIds: string[];
  selectedMachineIds: string[];
  filters: FilterState;
  mapViewport: MapViewport;
  selectedLayers: string[];
  savedViews: SavedView[];
  
  // Panel States
  isRightPanelOpen: boolean;
  leftRailCollapsed: boolean;
  selectedTab: 'details' | 'entities' | 'telemetry' | 'actions' | 'documents';
  
  // Real-time Data
  liveMode: boolean;
  lastUpdate: Date | null;
  statistics: PanelStatistics;
  
  // Loading States
  loading: {
    incidents: boolean;
    humans: boolean;
    machines: boolean;
    telemetry: boolean;
    chat: boolean;
  };
  
  // Error States
  errors: {
    incidents?: string;
    humans?: string;
    machines?: string;
    telemetry?: string;
    chat?: string;
    connection?: string;
  };
}

// Action Types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_INCIDENTS'; payload: Incident[] }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_INCIDENT'; payload: Incident }
  | { type: 'SET_HUMANS'; payload: Human[] }
  | { type: 'UPDATE_HUMAN'; payload: Human }
  | { type: 'SET_MACHINES'; payload: Machine[] }
  | { type: 'UPDATE_MACHINE'; payload: Machine }
  | { type: 'SET_TELEMETRY_CHANNELS'; payload: TelemetryChannel[] }
  | { type: 'UPDATE_TELEMETRY_CHANNEL'; payload: TelemetryChannel }
  | { type: 'SET_CHAT_THREADS'; payload: ChatThread[] }
  | { type: 'ADD_CHAT_THREAD'; payload: ChatThread }
  | { type: 'SET_HMI_INTERACTIONS'; payload: HumanMachineInteraction[] }
  | { type: 'ADD_HMI_INTERACTION'; payload: HumanMachineInteraction }
  | { type: 'SELECT_INCIDENTS'; payload: string[] }
  | { type: 'SELECT_HUMANS'; payload: string[] }
  | { type: 'SELECT_MACHINES'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_MAP_VIEWPORT'; payload: MapViewport }
  | { type: 'TOGGLE_LAYER'; payload: string }
  | { type: 'SET_SELECTED_LAYERS'; payload: string[] }
  | { type: 'TOGGLE_RIGHT_PANEL' }
  | { type: 'SET_RIGHT_PANEL'; payload: boolean }
  | { type: 'TOGGLE_LEFT_RAIL' }
  | { type: 'SET_SELECTED_TAB'; payload: 'details' | 'entities' | 'telemetry' | 'actions' | 'documents' }
  | { type: 'SET_LIVE_MODE'; payload: boolean }
  | { type: 'SET_STATISTICS'; payload: PanelStatistics }
  | { type: 'SET_LOADING'; payload: { section: keyof AppState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { section: keyof AppState['errors']; error?: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_LAST_UPDATE'; payload: Date };

// Initial State
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  
  incidents: [],
  humans: [],
  machines: [],
  telemetryChannels: [],
  chatThreads: [],
  humanMachineInteractions: [],
  
  selectedIncidentIds: [],
  selectedHumanIds: [],
  selectedMachineIds: [],
  filters: {
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date(),
      preset: '24h'
    },
    severity: ['critical', 'high', 'medium', 'low', 'info'],
    status: ['open', 'acknowledged', 'investigating'],
    sites: [],
    units: [],
    machineTypes: [],
    roles: [],
    tags: []
  },
  mapViewport: {
    center: { lat: 25.2048, lng: 55.2708 }, // Dubai default
    zoom: 10
  },
  selectedLayers: ['humans', 'machines', 'incidents'],
  savedViews: [],
  
  isRightPanelOpen: false,
  leftRailCollapsed: false,
  selectedTab: 'details',
  
  liveMode: true,
  lastUpdate: null,
  statistics: {
    chatFeed: {
      activeTeams: 0,
      activeParticipants: 0,
      messagesLast24h: 0
    },
    telemetry: {
      sitesActive: 0,
      machinesActive: 0,
      anomalyPercentage: 0,
      dataQuality: 0
    },
    humanMachineInteractions: {
      firstResponderTypePercentage: {
        human: 0,
        machine: 0
      },
      successRates: {
        human: 0,
        machine: 0
      },
      interactionsLast24h: 0
    }
  },
  
  loading: {
    incidents: false,
    humans: false,
    machines: false,
    telemetry: false,
    chat: false
  },
  
  errors: {}
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload };
    
    case 'ADD_INCIDENT':
      return { 
        ...state, 
        incidents: [action.payload, ...state.incidents] 
      };
    
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(incident =>
          incident.id === action.payload.id ? action.payload : incident
        )
      };
    
    case 'SET_HUMANS':
      return { ...state, humans: action.payload };
    
    case 'UPDATE_HUMAN':
      return {
        ...state,
        humans: state.humans.map(human =>
          human.id === action.payload.id ? action.payload : human
        )
      };
    
    case 'SET_MACHINES':
      return { ...state, machines: action.payload };
    
    case 'UPDATE_MACHINE':
      return {
        ...state,
        machines: state.machines.map(machine =>
          machine.id === action.payload.id ? action.payload : machine
        )
      };
    
    case 'SET_TELEMETRY_CHANNELS':
      return { ...state, telemetryChannels: action.payload };
    
    case 'UPDATE_TELEMETRY_CHANNEL':
      return {
        ...state,
        telemetryChannels: state.telemetryChannels.map(channel =>
          channel.id === action.payload.id ? action.payload : channel
        )
      };
    
    case 'SET_CHAT_THREADS':
      return { ...state, chatThreads: action.payload };
    
    case 'ADD_CHAT_THREAD':
      return { 
        ...state, 
        chatThreads: [action.payload, ...state.chatThreads] 
      };
    
    case 'SET_HMI_INTERACTIONS':
      return { ...state, humanMachineInteractions: action.payload };
    
    case 'ADD_HMI_INTERACTION':
      return { 
        ...state, 
        humanMachineInteractions: [action.payload, ...state.humanMachineInteractions] 
      };
    
    case 'SELECT_INCIDENTS':
      return { ...state, selectedIncidentIds: action.payload };
    
    case 'SELECT_HUMANS':
      return { ...state, selectedHumanIds: action.payload };
    
    case 'SELECT_MACHINES':
      return { ...state, selectedMachineIds: action.payload };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      };
    
    case 'SET_MAP_VIEWPORT':
      return { ...state, mapViewport: action.payload };
    
    case 'TOGGLE_LAYER':
      const layers = state.selectedLayers.includes(action.payload)
        ? state.selectedLayers.filter(layer => layer !== action.payload)
        : [...state.selectedLayers, action.payload];
      return { ...state, selectedLayers: layers };
    
    case 'SET_SELECTED_LAYERS':
      return { ...state, selectedLayers: action.payload };
    
    case 'TOGGLE_RIGHT_PANEL':
      return { ...state, isRightPanelOpen: !state.isRightPanelOpen };
    
    case 'SET_RIGHT_PANEL':
      return { ...state, isRightPanelOpen: action.payload };
    
    case 'TOGGLE_LEFT_RAIL':
      return { ...state, leftRailCollapsed: !state.leftRailCollapsed };
    
    case 'SET_SELECTED_TAB':
      return { ...state, selectedTab: action.payload };
    
    case 'SET_LIVE_MODE':
      return { ...state, liveMode: action.payload };
    
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    
    case 'SET_LOADING':
      return { 
        ...state, 
        loading: { 
          ...state.loading, 
          [action.payload.section]: action.payload.loading 
        } 
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        errors: { 
          ...state.errors, 
          [action.payload.section]: action.payload.error 
        } 
      };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    
    case 'SET_LAST_UPDATE':
      return { ...state, lastUpdate: action.payload };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-save preferences to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('opsecho_user_preferences', JSON.stringify(state.user.preferences));
    }
  }, [state.user?.preferences]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('opsecho_user_preferences');
    if (savedPrefs) {
      try {
        const preferences = JSON.parse(savedPrefs);
        // Apply saved preferences to user state
        // This would normally be handled by authentication
      } catch (error) {
        console.warn('Failed to load saved preferences:', error);
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Selector Hooks for Optimized Re-renders
export function useIncidents() {
  const { state } = useApp();
  return state.incidents;
}

export function useSelectedIncidents() {
  const { state } = useApp();
  return state.incidents.filter(incident => 
    state.selectedIncidentIds.includes(incident.id)
  );
}

export function useHumans() {
  const { state } = useApp();
  return state.humans;
}

export function useMachines() {
  const { state } = useApp();
  return state.machines;
}

export function useFilters() {
  const { state } = useApp();
  return state.filters;
}

export function useMapViewport() {
  const { state } = useApp();
  return state.mapViewport;
}

export function useStatistics() {
  const { state } = useApp();
  return state.statistics;
}

export function useLoadingStates() {
  const { state } = useApp();
  return state.loading;
}

export function useErrors() {
  const { state } = useApp();
  return state.errors;
}