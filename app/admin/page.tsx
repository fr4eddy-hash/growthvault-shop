'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductStats {
  views: number;
  checkout_free: number;
  checkout_paid: number;
  download_free: number;
  download_paid: number;
  revenue_cents: number;
}

interface StatsStore {
  updated_at: string;
  products: Record<string, ProductStats>;
}

interface TrackingEvent {
  ts: string;
  type: string;
  slug: string;
  amount?: number;
}

interface AdminData {
  stats: StatsStore;
  events: TrackingEvent[];
}

// ─── Product display names (in order) ─────────────────────────────────────────

const PRODUCT_LABELS: Record<string, string> = {
  'ai-playbook':          '01 · AI Playbook',
  'freelancer-finance':   '02 · Freelancer Finance',
  'small-biz-ai':         '03 · Small Biz AI',
  'local-marketing':      '04 · Local Marketing',
  'remote-jobs':          '05 · Remote Jobs',
  'wellness-50':          '06 · Wellness 50+',
  'notion-os':            '07 · Notion OS',
  'etsy-guide':           '08 · Etsy Guide',
  'homeowner-guide':      '09 · Homeowner Guide',
  'career-pivot':         '10 · Career Pivot',
  'ai-agent-income':      '11 · AI Agent Income',
  'freelancer-to-ceo':    '12 · Freelancer to CEO',
  'first-digital-product':'13 · First Digital Product',
};

const SLUG_ORDER = Object.keys(PRODUCT_LABELS);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString(); }
function usd(cents: number) { return `$${(cents / 100).toFixed(2)}`; }
function pct(a: number, b: number) {
  if (b === 0) return '—';
  return `${Math.round((a / b) * 100)}%`;
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  view:           { label: 'View',           color: '#555' },
  checkout_free:  { label: 'Free checkout',  color: '#2980b9' },
  checkout_paid:  { label: 'Paid checkout',  color: '#8e44ad' },
  download_free:  { label: 'Free DL',        color: '#27ae60' },
  download_paid:  { label: '💰 Paid DL',     color: '#c9a84c' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async (password: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/stats?pw=${encodeURIComponent(password)}`);
      if (res.status === 401) {
        setError('Wrong password.');
        setAuthed(false);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Server error');
      const json = await res.json();
      setData(json);
      setAuthed(true);
      setLastRefresh(new Date());
    } catch {
      setError('Could not load data. Check connection.');
    }
    setLoading(false);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetchData(pw);
  }

  // Auto-refresh every 60s when logged in
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => fetchData(pw), 60000);
    return () => clearInterval(id);
  }, [authed, pw, fetchData]);

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#111', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif',
      }}>
        <form onSubmit={handleLogin} style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
          padding: '40px 48px', width: 340, textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c9a84c', marginBottom: 8 }}>
            GrowthVault
          </div>
          <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: 28 }}>Admin Dashboard</div>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #333', background: '#111', color: '#eee',
              fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', marginBottom: 12,
            }}
          />
          {error && <div style={{ color: '#e74c3c', fontSize: '0.82rem', marginBottom: 8 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '10px', borderRadius: 8,
            background: loading ? '#444' : '#c9a84c', color: '#111',
            border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'default' : 'pointer',
          }}>
            {loading ? 'Loading…' : 'Enter'}
          </button>
        </form>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  if (!data) return null;

  const { stats, events } = data;
  const products = stats.products;

  // Aggregate totals
  const totals = Object.values(products).reduce<ProductStats>((acc, p) => ({
    views:          acc.views + p.views,
    checkout_free:  acc.checkout_free + p.checkout_free,
    checkout_paid:  acc.checkout_paid + p.checkout_paid,
    download_free:  acc.download_free + p.download_free,
    download_paid:  acc.download_paid + p.download_paid,
    revenue_cents:  acc.revenue_cents + p.revenue_cents,
  }), { views: 0, checkout_free: 0, checkout_paid: 0, download_free: 0, download_paid: 0, revenue_cents: 0 });

  const sortedSlugs = SLUG_ORDER.filter(s => products[s]);
  // Add any slugs not in our known list
  Object.keys(products).forEach(s => { if (!SLUG_ORDER.includes(s)) sortedSlugs.push(s); });

  const cardStyle: React.CSSProperties = {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '20px 24px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#e0ddd6', fontFamily: 'system-ui, sans-serif', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c9a84c' }}>GrowthVault</div>
            <div style={{ color: '#666', fontSize: '0.8rem', marginTop: 2 }}>Admin · Analytics</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastRefresh && (
              <span style={{ color: '#555', fontSize: '0.78rem' }}>
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchData(pw)}
              disabled={loading}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid #333',
                background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '0.82rem',
              }}
            >
              {loading ? '…' : '↻ Refresh'}
            </button>
            <button
              onClick={() => { setAuthed(false); setData(null); setPw(''); }}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid #333',
                background: 'transparent', color: '#666', cursor: 'pointer', fontSize: '0.82rem',
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Totals row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Total Views',       value: fmt(totals.views),                        color: '#e0ddd6' },
            { label: 'Free Checkouts',    value: fmt(totals.checkout_free),                color: '#2980b9' },
            { label: 'Paid Checkouts',    value: fmt(totals.checkout_paid),                color: '#8e44ad' },
            { label: 'Free Downloads',    value: fmt(totals.download_free),                color: '#27ae60' },
            { label: 'Paid Downloads',    value: fmt(totals.download_paid),                color: '#c9a84c' },
            { label: 'Total Revenue',     value: usd(totals.revenue_cents),               color: '#c9a84c' },
          ].map(({ label, value, color }) => (
            <div key={label} style={cardStyle}>
              <div style={{ fontSize: '0.72rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Per-product table */}
        <div style={{ ...cardStyle, marginBottom: 32, overflowX: 'auto' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Per-Guide Funnel</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', color: '#666', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px 8px 0', fontWeight: 500 }}>Guide</th>
                <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>Views</th>
                <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>Free CO</th>
                <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>Paid CO</th>
                <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>Free DL</th>
                <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>Paid DL</th>
                <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>Revenue</th>
                <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>Conv%</th>
              </tr>
            </thead>
            <tbody>
              {sortedSlugs.map(slug => {
                const p = products[slug];
                const totalCheckouts = p.checkout_free + p.checkout_paid;
                const totalDownloads = p.download_free + p.download_paid;
                return (
                  <tr key={slug} style={{ borderBottom: '1px solid #1e1e1e' }}>
                    <td style={{ padding: '10px 12px 10px 0', color: '#ccc' }}>
                      {PRODUCT_LABELS[slug] || slug}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#e0ddd6' }}>{fmt(p.views)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#2980b9' }}>{fmt(p.checkout_free)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#8e44ad' }}>{fmt(p.checkout_paid)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#27ae60' }}>{fmt(p.download_free)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#c9a84c' }}>{fmt(p.download_paid)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#c9a84c', fontWeight: 600 }}>
                      {p.revenue_cents > 0 ? usd(p.revenue_cents) : '—'}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#888' }}>
                      {pct(totalDownloads, p.views)}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr style={{ borderTop: '1px solid #333' }}>
                <td style={{ padding: '10px 12px 10px 0', fontWeight: 700, color: '#c9a84c' }}>TOTAL</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700 }}>{fmt(totals.views)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#2980b9' }}>{fmt(totals.checkout_free)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#8e44ad' }}>{fmt(totals.checkout_paid)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#27ae60' }}>{fmt(totals.download_free)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#c9a84c' }}>{fmt(totals.download_paid)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#c9a84c' }}>{usd(totals.revenue_cents)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#888' }}>
                  {pct(totals.download_free + totals.download_paid, totals.views)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recent events */}
        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Recent Events <span style={{ color: '#444', fontWeight: 400 }}>({events.length} shown)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.slice(0, 100).map((ev, i) => {
              const meta = EVENT_LABELS[ev.type] || { label: ev.type, color: '#666' };
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '7px 0', borderBottom: '1px solid #1e1e1e',
                  fontSize: '0.82rem',
                }}>
                  <span style={{ color: '#444', minWidth: 80, fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {timeAgo(ev.ts)}
                  </span>
                  <span style={{
                    color: meta.color, minWidth: 110, fontWeight: 600,
                  }}>
                    {meta.label}
                  </span>
                  <span style={{ color: '#aaa' }}>
                    {PRODUCT_LABELS[ev.slug] || ev.slug}
                  </span>
                  {ev.amount != null && ev.amount > 0 && (
                    <span style={{ color: '#c9a84c', marginLeft: 'auto' }}>
                      {usd(ev.amount)}
                    </span>
                  )}
                </div>
              );
            })}
            {events.length === 0 && (
              <div style={{ color: '#555', padding: '20px 0', textAlign: 'center' }}>
                No events yet. Data will appear once the shop gets traffic.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', color: '#3a3a3a', fontSize: '0.75rem' }}>
          Data stored in Vercel Blob · Auto-refreshes every 60s · Stats updated at {stats.updated_at ? new Date(stats.updated_at).toLocaleString() : '—'}
        </div>
      </div>
    </div>
  );
}
