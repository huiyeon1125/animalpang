import { NextResponse } from 'next/server';
import dbConnect from '@/db/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json(
      { message: 'Database connected successfully', status: 'healthy' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database health check error:', error);
    return NextResponse.json(
      { message: 'Database connection failed', status: 'unhealthy', error: String(error) },
      { status: 500 }
    );
  }
}
