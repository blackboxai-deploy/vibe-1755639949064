import { NextResponse } from 'next/server';
import { generateMockData } from '@/lib/mockData';

export async function GET() {
  try {
    const mockData = generateMockData();
    
    return NextResponse.json({
      success: true,
      data: mockData.incidents,
      total: mockData.incidents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch incidents',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real application, this would save to a database
    const newIncident = {
      id: `incident_${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      data: newIncident,
      message: 'Incident created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create incident',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}