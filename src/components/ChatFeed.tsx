"use client";

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Users, 
  Mic, 
  Paperclip, 
  Send, 
  Phone,
  Radio,
  AlertTriangle,
  Clock,
  Bot
} from 'lucide-react';

export default function ChatFeed() {
  const { state } = useApp();
  const [messageText, setMessageText] = useState('');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  // Mock messages for demonstration
  const mockMessages = [
    {
      id: 'msg_1',
      senderId: 'human_1',
      senderName: 'Ahmed Al-Rashid',
      senderRole: 'operator',
      timestamp: new Date(Date.now() - 5 * 60000),
      content: 'Pressure readings are showing anomalies in Compressor Unit C-101. Investigating now.',
      type: 'text' as const,
      threadId: 'thread_1',
      incidentId: 'incident_1',
      isRadioTranscript: false,
      isEmergency: false,
      mentions: [],
      tags: ['compressor', 'pressure'],
      attachments: []
    },
    {
      id: 'msg_2',
      senderId: 'human_2',
      senderName: 'Fatima Al-Zahra',
      senderRole: 'supervisor',
      timestamp: new Date(Date.now() - 3 * 60000),
      content: 'Copy that Ahmed. I\'m reviewing the telemetry data. Can you confirm the current pressure reading?',
      type: 'text' as const,
      threadId: 'thread_1',
      incidentId: 'incident_1',
      isRadioTranscript: true,
      isEmergency: false,
      mentions: ['human_1'],
      tags: [],
      attachments: []
    },
    {
      id: 'msg_3',
      senderId: 'ai_assistant',
      senderName: 'AI Assistant',
      senderRole: 'system',
      timestamp: new Date(Date.now() - 2 * 60000),
      content: 'Analysis complete: Pressure trend shows 15% increase over baseline in the last 30 minutes. Recommend immediate inspection of relief valve settings.',
      type: 'text' as const,
      threadId: 'thread_1',
      incidentId: 'incident_1',
      isRadioTranscript: false,
      isEmergency: false,
      mentions: [],
      tags: ['ai-analysis', 'recommendation'],
      attachments: []
    },
    {
      id: 'msg_4',
      senderId: 'human_1',
      senderName: 'Ahmed Al-Rashid',
      senderRole: 'operator',
      timestamp: new Date(Date.now() - 1 * 60000),
      content: 'Current reading is 85.3 bar. Relief valve appears to be functioning normally. Checking upstream conditions.',
      type: 'text' as const,
      threadId: 'thread_1',
      incidentId: 'incident_1',
      isRadioTranscript: true,
      isEmergency: false,
      mentions: [],
      tags: [],
      attachments: [
        {
          url: '#',
          type: 'image',
          name: 'pressure_gauge_reading.jpg',
          size: 245760
        }
      ]
    }
  ];

  // Get statistics
  const statistics = {
    activeTeams: state.statistics.chatFeed.activeTeams,
    activeParticipants: state.statistics.chatFeed.activeParticipants,
    messagesLast24h: state.statistics.chatFeed.messagesLast24h
  };

  // Filter messages based on selected incident
  const filteredMessages = useMemo(() => {
    if (state.selectedIncidentIds.length === 0) {
      return mockMessages;
    }
    return mockMessages.filter(msg => 
      state.selectedIncidentIds.includes(msg.incidentId || '')
    );
  }, [state.selectedIncidentIds]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'operator': return 'text-blue-400';
      case 'supervisor': return 'text-green-400';
      case 'hse': return 'text-orange-400';
      case 'maintenance': return 'text-purple-400';
      case 'system': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header with Statistics */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-white">Live Chat Feed</h3>
          </div>
          {state.selectedIncidentIds.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Incident {state.selectedIncidentIds[0]}
            </Badge>
          )}
        </div>
        
        {/* Statistics Bar */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">Active teams:</span>
            <span className="text-white font-medium">{statistics.activeTeams}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Active participants:</span>
            <span className="text-white font-medium">{statistics.activeParticipants}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400">Messages (24h):</span>
            <span className="text-white font-medium">{statistics.messagesLast24h}</span>
          </div>
        </div>
      </div>

      {/* AI Assist Section */}
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
        <Card className="bg-gray-750 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-300 flex items-center gap-2">
              <Bot className="w-3 h-3" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400">Rolling Summary:</span>
                <p className="text-gray-300 mt-1">
                  Pressure anomaly detected in C-101. Team investigating relief valve and upstream conditions. 
                  AI recommends immediate valve inspection.
                </p>
              </div>
              <div>
                <span className="text-gray-400">Next Steps:</span>
                <ul className="text-gray-300 mt-1 space-y-1">
                  <li>• Inspect relief valve settings</li>
                  <li>• Check upstream pressure sources</li>
                  <li>• Monitor pressure trend for next 15 minutes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 py-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="space-y-2">
              {/* Message Header */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {message.isRadioTranscript && <Radio className="w-3 h-3 text-blue-400" />}
                  {message.isEmergency && <AlertTriangle className="w-3 h-3 text-red-400" />}
                  {message.senderRole === 'system' && <Bot className="w-3 h-3 text-gray-400" />}
                  <span className={`font-medium ${getRoleColor(message.senderRole)}`}>
                    {message.senderName}
                  </span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {message.senderRole}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-300">{message.content}</p>
                
                {/* Attachments */}
                {message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-gray-750 rounded p-2">
                        <Paperclip className="w-3 h-3 text-gray-400" />
                        <span className="text-blue-400 hover:underline cursor-pointer">
                          {attachment.name}
                        </span>
                        <span className="text-gray-500">
                          ({Math.round(attachment.size / 1024)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {message.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* System Labels */}
                <div className="mt-2 flex gap-2">
                  {message.isRadioTranscript && (
                    <Badge variant="outline" className="text-xs bg-blue-900 text-blue-300 border-blue-600">
                      Radio Transcript
                    </Badge>
                  )}
                  {message.isEmergency && (
                    <Badge variant="outline" className="text-xs bg-red-900 text-red-300 border-red-600">
                      Emergency
                    </Badge>
                  )}
                  {message.senderRole === 'system' && (
                    <Badge variant="outline" className="text-xs bg-purple-900 text-purple-300 border-purple-600">
                      AI Analysis
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-gray-700" />

      {/* Message Composer */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            Quick Template
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Link SOP
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Mention Person
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-16 bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Button size="sm" variant="outline" className="p-2">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="p-2">
              <Mic className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleSendMessage} className="p-2">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 text-xs">
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            Mark as Decision
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            Elevate to Work Order
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            Emergency Call
          </Button>
        </div>
      </div>
    </div>
  );
}