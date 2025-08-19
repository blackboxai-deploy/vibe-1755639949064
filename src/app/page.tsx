"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/contexts/AppContext';
import HeaderBar from '@/components/HeaderBar';
import LeftRail from '@/components/LeftRail';
import IncidentsTable from '@/components/IncidentsTable';
import ChatFeed from '@/components/ChatFeed';
import TelemetryPanel from '@/components/TelemetryPanel';
import HMIPanel from '@/components/HMIPanel';
import PlaybackTimeline from '@/components/PlaybackTimeline';
import ContextPanel from '@/components/ContextPanel';
import { generateMockData } from '@/lib/mockData';

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <div className="text-white">Loading map...</div>
    </div>
  )
});

export default function OpsEchoDashboard() {
  const { state, dispatch } = useApp();

  // Initialize mock data on component mount
  useEffect(() => {
    const loadMockData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { section: 'incidents', loading: true } });
        dispatch({ type: 'SET_LOADING', payload: { section: 'humans', loading: true } });
        dispatch({ type: 'SET_LOADING', payload: { section: 'machines', loading: true } });
        dispatch({ type: 'SET_LOADING', payload: { section: 'telemetry', loading: true } });
        dispatch({ type: 'SET_LOADING', payload: { section: 'chat', loading: true } });

        // Generate mock data
        const mockData = generateMockData();
        
        // Simulate API loading delays
        setTimeout(() => {
          dispatch({ type: 'SET_INCIDENTS', payload: mockData.incidents });
          dispatch({ type: 'SET_LOADING', payload: { section: 'incidents', loading: false } });
        }, 500);

        setTimeout(() => {
          dispatch({ type: 'SET_HUMANS', payload: mockData.humans });
          dispatch({ type: 'SET_LOADING', payload: { section: 'humans', loading: false } });
        }, 700);

        setTimeout(() => {
          dispatch({ type: 'SET_MACHINES', payload: mockData.machines });
          dispatch({ type: 'SET_LOADING', payload: { section: 'machines', loading: false } });
        }, 600);

        setTimeout(() => {
          dispatch({ type: 'SET_TELEMETRY_CHANNELS', payload: mockData.telemetryChannels });
          dispatch({ type: 'SET_LOADING', payload: { section: 'telemetry', loading: false } });
        }, 800);

        setTimeout(() => {
          dispatch({ type: 'SET_CHAT_THREADS', payload: mockData.chatThreads });
          dispatch({ type: 'SET_HMI_INTERACTIONS', payload: mockData.humanMachineInteractions });
          dispatch({ type: 'SET_STATISTICS', payload: mockData.statistics });
          dispatch({ type: 'SET_LOADING', payload: { section: 'chat', loading: false } });
          dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
        }, 900);

      } catch (error) {
        console.error('Failed to load mock data:', error);
        dispatch({ type: 'SET_ERROR', payload: { section: 'incidents', error: 'Failed to load data' } });
      }
    };

    loadMockData();
  }, [dispatch]);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Header Bar */}
      <HeaderBar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail */}
        <LeftRail />
        
        {/* Central Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Section: Map and Incidents */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Interactive Map */}
            <div className="flex-1 min-h-0 relative">
              <InteractiveMap />
            </div>
            
            {/* Incidents Section */}
            <div className="h-48 border-t border-gray-800">
              <IncidentsTable />
            </div>
          </div>
          
          {/* Three-Panel Content Row */}
          <div className="h-80 border-t border-gray-800 flex">
            {/* Panel A: Live Chat Feed */}
            <div className="flex-1 border-r border-gray-800">
              <ChatFeed />
            </div>
            
            {/* Panel B: Machine Telemetry */}
            <div className="flex-1 border-r border-gray-800">
              <TelemetryPanel />
            </div>
            
            {/* Panel C: Human-Machine Interactions */}
            <div className="flex-1">
              <HMIPanel />
            </div>
          </div>
          
          {/* Playback Timeline */}
          <div className="h-16 border-t border-gray-800">
            <PlaybackTimeline />
          </div>
        </div>
        
        {/* Right Context Panel */}
        {state.isRightPanelOpen && (
          <div className="w-96 border-l border-gray-800">
            <ContextPanel />
          </div>
        )}
      </div>
    </div>
  );
}