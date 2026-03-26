import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/tracking';

/**
 * POST /api/track/view
 * Body: { slug: string }
 *
 * Called from a <script> tag on product pages (fire-and-forget fetch).
 * Never blocks page render. Always returns 200.
 */
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (slug && typeof slug === 'string') {
      // Non-blocking — don't await, respond immediately
      trackEvent('view', slug).catch(() => {});
    }
  } catch {
    // ignore malformed body
  }
  return NextResponse.json({ ok: true });
}
