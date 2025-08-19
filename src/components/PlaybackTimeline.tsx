"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  FastForward,
  Rewind,
  Clock,
  Calendar,
  Activity,
  MessageSquare,
  AlertTriangle,
  Wrench
} from 'lucide-react';

export default function PlaybackTimeline() {
  const { state, dispatch } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timelinePosition, setTimelinePosition] = useState([50]); // 0-100 representing position in timeline

  // Timeline range (last 24 hours)
  const timelineStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const timelineEnd = new Date();
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();

  // Update current time based on timeline position
  useEffect(() => {
    const position = timelinePosition[0] / 100;
    const newTime = new Date(timelineStart.getTime() + position * timelineDuration);
    setCurrentTime(newTime);
  }, [timelinePosition, timelineStart, timelineDuration]);

  // Playback effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimelinePosition(prev => {
        const newPosition = prev[0] + (playbackSpeed * 0.1); // Adjust speed factor
        if (newPosition >= 100) {
          setIsPlaying(false);
          return [100];
        }
        return [newPosition];
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Generate timeline events based on incidents, chat, and HMI data
  const timelineEvents = [
    // Incident events
    ...state.incidents.map(incident => ({
      id: `incident-${incident.id}`,
      type: 'incident' as const,
      timestamp: incident.createdAt,
      title: incident.title,
      severity: incident.severity,
      position: ((incident.createdAt.getTime() - timelineStart.getTime()) / timelineDuration) * 100
    })),
    
    // Mock chat events
    {
      id: 'chat-1',
      type: 'chat' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      title: 'Emergency chat burst',
      count: 12,
      position: ((Date.now() - 2 * 60 * 60 * 1000 - timelineStart.getTime()) / timelineDuration) * 100
    },
    {
      id: 'chat-2',
      type: 'chat' as const,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      title: 'Shift handover discussion',
      count: 8,
      position: ((Date.now() - 6 * 60 * 60 * 1000 - timelineStart.getTime()) / timelineDuration) * 100
    },

    // Mock maintenance windows
    {
      id: 'maintenance-1',
      type: 'maintenance' as const,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      title: 'Scheduled maintenance - Compressor C-101',
      duration: 4 * 60 * 60 * 1000, // 4 hours
      position: ((Date.now() - 8 * 60 * 60 * 1000 - timelineStart.getTime()) / timelineDuration) * 100
    },

    // Mock anomaly markers
    {
      id: 'anomaly-1',
      type: 'anomaly' as const,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      title: 'Pressure anomaly detected',
      position: ((Date.now() - 3 * 60 * 60 * 1000 - timelineStart.getTime()) / timelineDuration) * 100
    },
    {
      id: 'anomaly-2',
      type: 'anomaly' as const,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      title: 'Temperature spike',
      position: ((Date.now() - 12 * 60 * 60 * 1000 - timelineStart.getTime()) / timelineDuration) * 100
    }
  ].filter(event => event.position >= 0 && event.position <= 100);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    dispatch({ type: 'SET_LIVE_MODE', payload: false });
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setTimelinePosition([0]);
    setCurrentTime(timelineStart);
  };

  const handleJumpToNow = () => {
    setIsPlaying(false);
    setTimelinePosition([100]);
    setCurrentTime(timelineEnd);
    dispatch({ type: 'SET_LIVE_MODE', payload: true });
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 2, 4, 8];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleSkipBack = () => {
    setTimelinePosition(prev => [Math.max(0, prev[0] - 5)]);
  };

  const handleSkipForward = () => {
    setTimelinePosition(prev => [Math.min(100, prev[0] + 5)]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'incident': return AlertTriangle;
      case 'chat': return MessageSquare;
      case 'maintenance': return Wrench;
      case 'anomaly': return Activity;
      default: return Clock;
    }
  };

  const getEventColor = (type: string, severity?: string) => {
    if (type === 'incident') {
      switch (severity) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    }
    switch (type) {
      case 'chat': return 'bg-purple-500';
      case 'maintenance': return 'bg-green-500';
      case 'anomaly': return 'bg-red-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-4">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleRestart}
          className="text-gray-400 hover:text-white p-2"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleSkipBack}
          className="text-gray-400 hover:text-white p-2"
        >
          <Rewind className="w-4 h-4" />
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handlePlayPause}
          className="text-white hover:bg-gray-700 p-2"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleSkipForward}
          className="text-gray-400 hover:text-white p-2"
        >
          <FastForward className="w-4 h-4" />
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleSpeedChange}
          className="text-xs px-2 py-1 h-7"
        >
          {playbackSpeed}x
        </Button>
      </div>

      {/* Current Time Display */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Time:</span>
          <span className="font-mono text-white">{formatTime(currentTime)}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-gray-300">{formatDate(currentTime)}</span>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="flex-1 relative">
        {/* Event markers */}
        <div className="absolute -top-8 left-0 right-0 h-6">
          {timelineEvents.map((event) => {
            const Icon = getEventIcon(event.type);
            return (
              <div
                key={event.id}
                className="absolute group"
                style={{ left: `${event.position}%` }}
              >
                <div className={`w-2 h-6 ${getEventColor(event.type, (event as any).severity)} opacity-70 hover:opacity-100 cursor-pointer`}>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-600">
                    <div className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {event.title}
                    </div>
                    <div className="text-gray-400">
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline track with layers */}
        <div className="space-y-1">
          {/* Main timeline */}
          <Slider
            value={timelinePosition}
            onValueChange={setTimelinePosition}
            max={100}
            step={0.1}
            className="w-full"
          />
          
          {/* Layer indicators */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Incidents</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Anomalies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Display */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{formatTime(timelineStart)}</span>
        <span>–</span>
        <span>{formatTime(timelineEnd)}</span>
      </div>

      {/* Jump to Now */}
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleJumpToNow}
        className="text-xs px-3 py-1 h-7"
      >
        Jump to Now
      </Button>

      {/* Playback Status */}
      {isPlaying && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-400">PLAYBACK</span>
        </div>
      )}

      {state.liveMode && !isPlaying && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">LIVE</span>
        </div>
      )}
    </div>
  );
}