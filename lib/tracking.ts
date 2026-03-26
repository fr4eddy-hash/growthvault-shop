/**
 * GrowthVault — Server-side tracking via Vercel Blob JSON storage
 *
 * All tracking is backend-only. No client-side code, no external analytics.
 * Data is stored in Vercel Blob as `tracking/stats.json` (counters) and
 * `tracking/events.json` (recent events log, capped at 500 entries).
 *
 * Event types:
 *   view          — product page was loaded
 *   checkout_free — user clicked "Get for Free" and submitted
 *   checkout_paid — user clicked checkout with $ amount and Stripe session created
 *   download_free — free download link served
 *   download_paid — paid download link served (payment verified)
 */

import { put } from '@vercel/blob';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductStats {
  views: number;
  checkout_free: number;
  checkout_paid: number;
  download_free: number;
  download_paid: number;
  revenue_cents: number; // total paid revenue in cents
}

export interface StatsStore {
  updated_at: string;
  products: Record<string, ProductStats>;
}

export interface TrackingEvent {
  ts: string;        // ISO timestamp
  type: string;      // event type
  slug: string;      // product slug
  amount?: number;   // cents (paid events only)
  ip?: string;       // hashed for privacy
}

export interface EventsStore {
  events: TrackingEvent[];
}

// ─── Blob keys ────────────────────────────────────────────────────────────────

const STATS_KEY = 'tracking/stats.json';
const EVENTS_KEY = 'tracking/events.json';
const MAX_EVENTS = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyStats(): StatsStore {
  return { updated_at: new Date().toISOString(), products: {} };
}

function emptyEvents(): EventsStore {
  return { events: [] };
}

function emptyProduct(): ProductStats {
  return {
    views: 0,
    checkout_free: 0,
    checkout_paid: 0,
    download_free: 0,
    download_paid: 0,
    revenue_cents: 0,
  };
}

async function readBlob<T>(key: string, fallback: T): Promise<T> {
  try {
    // Check if blob exists
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return fallback;

    // Construct the public URL to read from
    const storeName = token.match(/vercel_blob_rw_([a-z0-9]+)/i)?.[1]?.toLowerCase();
    if (!storeName) return fallback;

    const url = `https://${storeName}.public.blob.vercel-storage.com/${key}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function writeBlob(key: string, data: unknown): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;

  const json = JSON.stringify(data);
  await put(key, json, {
    access: 'public',
    contentType: 'application/json',
    token,
    // overwrite existing file
    addRandomSuffix: false,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Record a tracking event. Non-blocking — errors are swallowed so they never
 * affect the user-facing request.
 */
export async function trackEvent(
  type: string,
  slug: string,
  opts: { amount_cents?: number; ip?: string } = {}
): Promise<void> {
  try {
    // Read current data in parallel
    const [stats, eventsStore] = await Promise.all([
      readBlob<StatsStore>(STATS_KEY, emptyStats()),
      readBlob<EventsStore>(EVENTS_KEY, emptyEvents()),
    ]);

    // Ensure product entry exists
    if (!stats.products[slug]) {
      stats.products[slug] = emptyProduct();
    }
    const p = stats.products[slug];

    // Increment counter
    switch (type) {
      case 'view':           p.views++;           break;
      case 'checkout_free':  p.checkout_free++;   break;
      case 'checkout_paid':  p.checkout_paid++;   break;
      case 'download_free':  p.download_free++;   break;
      case 'download_paid':
        p.download_paid++;
        if (opts.amount_cents) p.revenue_cents += opts.amount_cents;
        break;
    }

    stats.updated_at = new Date().toISOString();

    // Append event to log, keep last MAX_EVENTS
    const event: TrackingEvent = {
      ts: new Date().toISOString(),
      type,
      slug,
      ...(opts.amount_cents ? { amount: opts.amount_cents } : {}),
    };
    eventsStore.events.push(event);
    if (eventsStore.events.length > MAX_EVENTS) {
      eventsStore.events = eventsStore.events.slice(-MAX_EVENTS);
    }

    // Write both blobs in parallel (fire-and-forget on error)
    await Promise.all([
      writeBlob(STATS_KEY, stats),
      writeBlob(EVENTS_KEY, eventsStore),
    ]);
  } catch {
    // Never throw — tracking failure must not break user flows
  }
}

/**
 * Read full stats (for admin dashboard).
 */
export async function getStats(): Promise<StatsStore> {
  return readBlob<StatsStore>(STATS_KEY, emptyStats());
}

/**
 * Read recent events (for admin dashboard).
 */
export async function getEvents(): Promise<EventsStore> {
  return readBlob<EventsStore>(EVENTS_KEY, emptyEvents());
}
