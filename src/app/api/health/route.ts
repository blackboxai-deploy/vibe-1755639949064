import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'OpsEcho API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    components: {
      incidents: 'operational',
      telemetry: 'operational',
      chat: 'operational',
      map: 'operational'
    }
  });
}