'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  slug: string;
  title: string;
  suggestedPrice: number;
  accent: string;
  accentDim: string;
}

export default function CheckoutButton({ slug, title, suggestedPrice, accent, accentDim }: CheckoutButtonProps) {
  const [amount, setAmount] = useState<string>(suggestedPrice.toString());
  const [loading, setLoading] = useState(false);
  const [freeLoading, setFreeLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(suggestedPrice);
  const [error, setError] = useState('');

  const presets = [9, suggestedPrice, 49].filter((v, i, a) => a.indexOf(v) === i);

  const handlePreset = (val: number) => {
    setActivePreset(val);
    setAmount(val.toString());
    setError('');
  };

  const handlePay = async () => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount < 1) {
      setError('Minimum paid amount is $1. Use "Download free" below for $0.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, amount: numAmount, title }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFree = async () => {
    setFreeLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, amount: 0, title }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setFreeLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setActivePreset(null);
    setError('');
  };

  return (
    <div className="checkout-section" style={{ '--accent': accent, '--accent-dim': accentDim } as React.CSSProperties}>
      <h3>Get This Guide</h3>
      <p>Choose your price — or download free. Pay what feels right.</p>

      {/* Preset buttons */}
      <div className="price-suggestions">
        {presets.map((p) => (
          <button
            key={p}
            className={`price-btn${activePreset === p ? ' active' : ''}`}
            onClick={() => handlePreset(p)}
            style={activePreset === p ? { '--accent': accent, '--accent-dim': accentDim } as React.CSSProperties : undefined}
          >
            ${p}
            {p === 9 && ' — Fair'}
            {p === suggestedPrice && ' — Suggested ★'}
            {p === 49 && ' — Generous'}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="price-input-row">
        <div className="price-input-wrap">
          <input
            type="number"
            className="price-input"
            value={amount}
            onChange={handleAmountChange}
            min="1"
            step="1"
            placeholder={suggestedPrice.toString()}
          />
        </div>
        <button
          className="btn btn--accent btn--lg"
          style={{ '--accent': accent, '--accent-shadow': `${accent}40`, minWidth: 160 } as React.CSSProperties}
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" />Processing…</>
          ) : (
            `Pay $${amount || suggestedPrice} →`
          )}
        </button>
      </div>

      {error && (
        <p style={{ color: '#E05252', fontSize: '0.82rem', marginBottom: 12 }}>{error}</p>
      )}

      <div className="checkout-divider">or</div>

      {/* Free download */}
      <button className="free-btn" onClick={handleFree} disabled={freeLoading}>
        {freeLoading ? (
          <><span className="spinner" style={{ width: 14, height: 14 }} /> Getting your link…</>
        ) : (
          '↓ Download free ($0)'
        )}
      </button>

      <p className="checkout-note">
        🔒 Secure checkout via Stripe · Instant PDF download · No account required
      </p>
    </div>
  );
}
