import { NextRequest, NextResponse } from 'next/server';
import { getStats, getEvents } from '@/lib/tracking';

/**
 * GET /api/admin/stats?pw=YOUR_PASSWORD
 * Returns full stats + recent events for the admin dashboard.
 * Protected by ADMIN_PASSWORD env var.
 */
export async function GET(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get('pw');
  const adminPw = process.env.ADMIN_PASSWORD;

  if (!adminPw || pw !== adminPw) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [stats, eventsStore] = await Promise.all([
    getStats(),
    getEvents(),
  ]);

  return NextResponse.json({
    stats,
    events: eventsStore.events.slice().reverse(), // newest first
  });
}
