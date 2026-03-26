'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { track } from '@vercel/analytics';

interface DownloadData {
  url: string;
  title: string;
  filename: string;
  customerEmail?: string;
  amount?: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const slug = searchParams.get('slug');
  const isFree = searchParams.get('free') === '1';

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<DownloadData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Prevent double-tracking on React Strict Mode / re-renders
  const trackedConversion = useRef(false);

  useEffect(() => {
    if (!slug) {
      setStatus('error');
      setErrorMsg('Invalid download link. Please contact hello@growthvault.co');
      return;
    }

    let timeout: NodeJS.Timeout;

    const fetchDownload = async () => {
      try {
        const params = new URLSearchParams({ slug });
        if (isFree) params.set('free', '1');
        if (sessionId) params.set('session_id', sessionId);

        const res = await fetch(`/api/download?${params}`);
        const json = await res.json();

        if (res.ok && json.url) {
          setData(json);
          setStatus('ready');

          // Track: successful conversion (fires once per page load)
          if (!trackedConversion.current) {
            trackedConversion.current = true;
            if (isFree) {
              track('download_complete', {
                slug,
                title: json.title ?? '',
                type: 'free',
                amount: 0,
              });
            } else {
              track('checkout_complete', {
                slug,
                title: json.title ?? '',
                type: 'paid',
                amount: json.amount ?? 0,
              });
            }
          }
        } else if (res.status === 402 && attempts < 5) {
          // Payment processing — retry after delay
          setAttempts((a) => a + 1);
          timeout = setTimeout(fetchDownload, 2000);
        } else {
          setStatus('error');
          setErrorMsg(json.error || 'Something went wrong.');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Network error. Please try again or contact hello@growthvault.co');
      }
    };

    fetchDownload();
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadClick = () => {
    if (!slug || !data) return;
    // Track: user actually clicked the download button
    track('download_click', {
      slug,
      title: data.title ?? '',
      type: isFree ? 'free' : 'paid',
    });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="success-card">
        <div className="success-icon" style={{ background: 'rgba(232,160,32,0.1)' }}>⏳</div>
        <h1>Getting your link…</h1>
        <p>
          {attempts > 0
            ? `Confirming payment… (${attempts}/5)`
            : 'One moment while we prepare your download.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="success-card">
        <div className="success-icon" style={{ background: 'rgba(224,82,82,0.1)' }}>⚠️</div>
        <h1 style={{ fontSize: '1.6rem' }}>Something went wrong</h1>
        <p>{errorMsg}</p>
        <p style={{ marginTop: 0 }}>
          If you completed a payment, email us at{' '}
          <a href="mailto:hello@growthvault.co" style={{ color: 'var(--gold)' }}>
            hello@growthvault.co
          </a>{' '}
          and we'll sort it out immediately.
        </p>
        <Link href="/" className="btn btn--outline" style={{ marginTop: 8, display: 'inline-flex' }}>
          ← Back to Guides
        </Link>
      </div>
    );
  }

  // Ready state
  return (
    <div className="success-card">
      <div className="success-icon">🎉</div>
      <h1>
        {isFree ? 'Your guide is ready!' : 'Payment confirmed!'}
      </h1>
      <p>
        <strong style={{ color: '#fff' }}>{data?.title}</strong>
        <br />
        {data?.customerEmail
          ? `A download link was also sent to ${data.customerEmail}.`
          : 'Your PDF is ready to download instantly.'}
      </p>

      <a
        href={data?.url}
        download={data?.filename}
        className="download-btn"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownloadClick}
      >
        ↓ Download Your Guide
      </a>

      <p style={{ fontSize: '0.78rem', color: 'var(--muted2)', marginBottom: 0, marginTop: 12 }}>
        PDF · {data?.filename}
      </p>

      <hr className="divider" style={{ margin: '32px 0' }} />

      <p style={{ fontSize: '0.88rem', marginBottom: 0 }}>
        Questions? Reply to the confirmation email or contact{' '}
        <a href="mailto:hello@growthvault.co" style={{ color: 'var(--gold)' }}>
          hello@growthvault.co
        </a>
      </p>

      <Link
        href="/"
        style={{ display: 'inline-block', marginTop: 24, fontSize: '0.85rem', color: 'var(--muted)' }}
      >
        ← Browse more guides
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">Growth<span>Vault</span></Link>
      </nav>

      <section style={{ padding: '80px 0 120px' }}>
        <div className="container--xs">
          <Suspense
            fallback={
              <div className="success-card">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                </div>
              </div>
            }
          >
            <SuccessContent />
          </Suspense>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <Link href="/" className="footer-logo">Growth<span>Vault</span></Link>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted2)' }}>© 2026 GrowthVault.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
