import {
  Incident,
  Human,
  Machine,
  TelemetryChannel,
  ChatThread,
  HumanMachineInteraction,
  PanelStatistics,
  Location
} from '@/types';

// Saudi Arabia oil & gas field locations
const saudiLocations: { name: string; location: Location; type: string }[] = [
  { name: 'Ghawar Field', location: { lat: 25.5000, lng: 49.5000 }, type: 'oil_field' },
  { name: 'Safaniya Field', location: { lat: 27.7000, lng: 48.8000 }, type: 'oil_field' },
  { name: 'Abqaiq Processing', location: { lat: 25.9358, lng: 49.6647 }, type: 'processing' },
  { name: 'Khursaniyah', location: { lat: 26.1500, lng: 49.8500 }, type: 'processing' },
  { name: 'Shaybah Field', location: { lat: 22.5000, lng: 53.0000 }, type: 'oil_field' },
  { name: 'Manifa Field', location: { lat: 27.2000, lng: 49.0000 }, type: 'oil_field' },
  { name: 'Berri Gas Plant', location: { lat: 26.7000, lng: 50.1000 }, type: 'gas_plant' },
  { name: 'Wasit Gas Plant', location: { lat: 24.8000, lng: 49.2000 }, type: 'gas_plant' }
];

// Generate random location near a base location
function generateRandomLocation(base: Location, radiusKm: number = 5): Location {
  const radiusInDegrees = radiusKm / 111; // Approximate conversion
  const lat = base.lat + (Math.random() - 0.5) * 2 * radiusInDegrees;
  const lng = base.lng + (Math.random() - 0.5) * 2 * radiusInDegrees;
  return { lat, lng };
}

// Generate mock humans
function generateMockHumans(): Human[] {
  const humans: Human[] = [];
  const roles: Human['role'][] = ['operator', 'supervisor', 'hse', 'maintenance', 'contractor'];
  const names = [
    'Ahmed Al-Rashid', 'Fatima Al-Zahra', 'Mohammed bin Salman', 'Sarah Al-Qahtani',
    'Abdullah Al-Mutairi', 'Nora Al-Dosari', 'Khalid Al-Harbi', 'Maryam Al-Shehri',
    'Omar Al-Ghamdi', 'Aisha Al-Malki', 'Sultan Al-Otaibi', 'Huda Al-Johani',
    'Fahad Al-Qahtani', 'Layla Al-Hariri', 'Nasser Al-Subai', 'Reem Al-Mansouri'
  ];

  names.forEach((name, index) => {
    const baseLocation = saudiLocations[index % saudiLocations.length];
    const human: Human = {
      id: `human_${index + 1}`,
      name,
      role: roles[index % roles.length],
      badgeId: `BADGE_${1000 + index}`,
      certifications: ['H2S Safety', 'Fire Safety', 'First Aid'],
      location: generateRandomLocation(baseLocation.location),
      lastSeen: new Date(Date.now() - Math.random() * 3600000), // Last hour
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      contact: {
        phone: `+966-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        radio: `CH_${Math.floor(Math.random() * 16) + 1}`,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@aramco.sa`
      },
      shift: {
        start: new Date(Date.now() - 8 * 3600000), // 8 hours ago
        end: new Date(Date.now() + 4 * 3600000), // 4 hours from now
        site: baseLocation.name
      }
    };
    humans.push(human);
  });

  return humans;
}

// Generate mock machines
function generateMockMachines(): Machine[] {
  const machines: Machine[] = [];
  const types: Machine['type'][] = ['pump', 'compressor', 'valve', 'tank', 'sensor', 'generator'];
  const statuses: Machine['status'][] = ['operational', 'maintenance', 'fault', 'offline'];

  saudiLocations.forEach((site, siteIndex) => {
    // Generate 8-12 machines per site
    const machineCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < machineCount; i++) {
      const machine: Machine = {
        id: `machine_${siteIndex}_${i + 1}`,
        name: `${types[i % types.length].toUpperCase()}-${siteIndex + 1}-${String(i + 1).padStart(3, '0')}`,
        type: types[i % types.length],
        model: `Model-${Math.floor(Math.random() * 1000) + 100}`,
        manufacturer: ['Siemens', 'GE', 'ABB', 'Schneider'][Math.floor(Math.random() * 4)],
        serialNumber: `SN${Math.floor(Math.random() * 1000000) + 100000}`,
        location: generateRandomLocation(site.location, 2),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        healthScore: Math.floor(Math.random() * 40) + 60, // 60-100
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 3600000), // Last 30 days
        nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 3600000), // Next 30 days
        tags: ['critical', 'monitored'],
        specifications: {
          capacity: `${Math.floor(Math.random() * 1000) + 100} m³/h`,
          pressure: `${Math.floor(Math.random() * 50) + 10} bar`,
          temperature: `${Math.floor(Math.random() * 200) + 50}°C`,
          power: `${Math.floor(Math.random() * 500) + 50} kW`
        }
      };
      machines.push(machine);
    }
  });

  return machines;
}

// Generate mock incidents
function generateMockIncidents(humans: Human[], machines: Machine[]): Incident[] {
  const incidents: Incident[] = [];
  const severities: Incident['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];
  const types: Incident['type'][] = ['safety', 'equipment', 'environmental', 'security', 'operational'];
  const statuses: Incident['status'][] = ['open', 'acknowledged', 'investigating', 'resolved'];

  const incidentTitles = [
    'High Pressure Alert on Compressor Unit',
    'Gas Leak Detected in Processing Area',
    'Temperature Anomaly in Pump Station',
    'Unauthorized Access Attempt',
    'Equipment Vibration Threshold Exceeded',
    'H2S Sensor Malfunction',
    'Fire Suppression System Test Failure',
    'Power Supply Voltage Fluctuation',
    'Cooling Water Temperature High',
    'Emergency Shutdown Valve Stuck',
    'Corrosion Detected in Pipeline',
    'Worker Proximity Alert',
    'Communication System Interference',
    'Instrument Air Pressure Low',
    'Environmental Discharge Limit Exceeded'
  ];

  for (let i = 0; i < 25; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 3600000); // Last 7 days

    const incident: Incident = {
      id: `incident_${i + 1}`,
      title: incidentTitles[i % incidentTitles.length],
      description: `Automated detection system identified anomalous conditions requiring immediate attention. Location: ${randomMachine.location.lat.toFixed(4)}, ${randomMachine.location.lng.toFixed(4)}`,
      severity,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: types[Math.floor(Math.random() * types.length)],
      priority: severity === 'critical' ? 1 : severity === 'high' ? 2 : 3,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 3600000),
      detectedBy: Math.random() > 0.7 ? 'ai' : 'sensor',
      location: randomMachine.location,
      site: saudiLocations[Math.floor(Math.random() * saudiLocations.length)].name,
      unit: `Unit-${Math.floor(Math.random() * 10) + 1}`,
      involvedHumans: humans.slice(0, Math.floor(Math.random() * 3) + 1).map(h => h.id),
      involvedMachines: [randomMachine.id],
      sla: {
        acknowledgeBy: new Date(createdAt.getTime() + (severity === 'critical' ? 15 : 60) * 60000),
        resolveBy: new Date(createdAt.getTime() + (severity === 'critical' ? 4 : 24) * 3600000),
        isOverdue: Math.random() > 0.8
      },
      riskScore: Math.floor(Math.random() * 100),
      evidenceUrls: [],
      tags: ['automated', 'monitoring']
    };
    incidents.push(incident);
  }

  return incidents;
}

// Generate mock telemetry channels
function generateMockTelemetryChannels(machines: Machine[]): TelemetryChannel[] {
  const channels: TelemetryChannel[] = [];
  const channelTypes: TelemetryChannel['type'][] = ['pressure', 'temperature', 'vibration', 'flow', 'power'];

  machines.forEach(machine => {
    channelTypes.forEach((type, index) => {
      const channel: TelemetryChannel = {
        id: `${machine.id}_${type}`,
        machineId: machine.id,
        name: `${machine.name} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
        unit: type === 'pressure' ? 'bar' : type === 'temperature' ? '°C' : type === 'vibration' ? 'mm/s' : type === 'flow' ? 'm³/h' : 'kW',
        minValue: 0,
        maxValue: type === 'pressure' ? 100 : type === 'temperature' ? 200 : type === 'vibration' ? 10 : 1000,
        warningThreshold: type === 'pressure' ? 80 : type === 'temperature' ? 150 : type === 'vibration' ? 7 : 800,
        criticalThreshold: type === 'pressure' ? 95 : type === 'temperature' ? 180 : type === 'vibration' ? 9 : 950,
        currentValue: Math.random() * (type === 'pressure' ? 100 : type === 'temperature' ? 200 : type === 'vibration' ? 10 : 1000),
        lastUpdate: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
        isAnomalous: Math.random() > 0.9,
        trendDirection: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
      };
      channels.push(channel);
    });
  });

  return channels;
}

// Generate mock chat threads
function generateMockChatThreads(): ChatThread[] {
  const threads: ChatThread[] = [];

  for (let i = 0; i < 8; i++) {
    const thread: ChatThread = {
      id: `thread_${i + 1}`,
      incidentId: i < 5 ? `incident_${i + 1}` : undefined,
      title: `Emergency Response Team ${i + 1}`,
      participants: [`human_${i + 1}`, `human_${i + 2}`, `human_${i + 3}`],
      createdAt: new Date(Date.now() - Math.random() * 24 * 3600000),
      lastActivity: new Date(Date.now() - Math.random() * 3600000),
      messageCount: Math.floor(Math.random() * 50) + 10,
      isActive: Math.random() > 0.3,
      summary: 'Coordinating response to equipment anomaly and safety assessment.'
    };
    threads.push(thread);
  }

  return threads;
}

// Generate mock human-machine interactions
function generateMockHMIInteractions(humans: Human[], machines: Machine[]): HumanMachineInteraction[] {
  const interactions: HumanMachineInteraction[] = [];
  const types: HumanMachineInteraction['type'][] = ['operation', 'inspection', 'maintenance', 'override', 'proximity'];
  const results: HumanMachineInteraction['result'][] = ['success', 'failure', 'partial', 'pending'];

  for (let i = 0; i < 30; i++) {
    const human = humans[Math.floor(Math.random() * humans.length)];
    const machine = machines[Math.floor(Math.random() * machines.length)];

    const interaction: HumanMachineInteraction = {
      id: `hmi_${i + 1}`,
      humanId: human.id,
      machineId: machine.id,
      type: types[Math.floor(Math.random() * types.length)],
      action: 'System check and parameter adjustment',
      result: results[Math.floor(Math.random() * results.length)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 3600000),
      duration: Math.floor(Math.random() * 3600), // 0-60 minutes
      notes: 'Routine maintenance procedure completed successfully'
    };
    interactions.push(interaction);
  }

  return interactions;
}

// Generate mock statistics
function generateMockStatistics(): PanelStatistics {
  return {
    chatFeed: {
      activeTeams: Math.floor(Math.random() * 10) + 5,
      activeParticipants: Math.floor(Math.random() * 30) + 15,
      messagesLast24h: Math.floor(Math.random() * 500) + 200
    },
    telemetry: {
      sitesActive: Math.floor(Math.random() * 8) + 6,
      machinesActive: Math.floor(Math.random() * 50) + 75,
      anomalyPercentage: Math.floor(Math.random() * 15) + 2,
      dataQuality: Math.floor(Math.random() * 10) + 90
    },
    humanMachineInteractions: {
      firstResponderTypePercentage: {
        human: Math.floor(Math.random() * 40) + 40,
        machine: Math.floor(Math.random() * 40) + 40
      },
      successRates: {
        human: Math.floor(Math.random() * 20) + 75,
        machine: Math.floor(Math.random() * 20) + 80
      },
      interactionsLast24h: Math.floor(Math.random() * 100) + 150
    }
  };
}

// Main function to generate all mock data
export function generateMockData() {
  const humans = generateMockHumans();
  const machines = generateMockMachines();
  const incidents = generateMockIncidents(humans, machines);
  const telemetryChannels = generateMockTelemetryChannels(machines);
  const chatThreads = generateMockChatThreads();
  const humanMachineInteractions = generateMockHMIInteractions(humans, machines);
  const statistics = generateMockStatistics();

  return {
    humans,
    machines,
    incidents,
    telemetryChannels,
    chatThreads,
    humanMachineInteractions,
    statistics
  };
}