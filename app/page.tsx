import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import NewsletterForm from './NewsletterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GrowthVault — Premium Guides. Pay What You Want.',
  description: '10 premium PDF guides covering AI, freelancing, finance, remote work, wellness, and more. Pay what you want. Instant download.',
};

export default function HomePage() {
  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-logo">Growth<span>Vault</span></div>
        <Link href="#products" className="nav-cta">Browse Guides</Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <p className="hero-eyebrow fade-up">10 Premium Guides · Instant PDF Download</p>
          <h1 className="fade-up" style={{ animationDelay: '0.1s' }}>
            Knowledge that <em>actually</em><br />moves the needle.
          </h1>
          <p className="hero-sub fade-up" style={{ animationDelay: '0.2s' }}>
            From AI workflows to freelance finance, remote careers to homeownership —
            every guide is research-backed, actionable, and yours for whatever price feels right.
          </p>
          <div className="hero-actions fade-up" style={{ animationDelay: '0.3s' }}>
            <Link href="#products" className="btn btn--primary btn--lg">↓ Browse All Guides</Link>
            <span className="badge badge--green badge--dot">No minimum. $0 is fine.</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div className="stats-bar reveal">
            <div className="stat-item">
              <div className="stat-num">10</div>
              <div className="stat-label">Premium Guides</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">80+</div>
              <div className="stat-label">Pages per Guide</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">$0+</div>
              <div className="stat-label">Pay What You Want</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">∞</div>
              <div className="stat-label">Instant Download</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products">
        <div className="container">
          <span className="section-label reveal">The Vault</span>
          <h2 className="reveal">All 10 Guides</h2>
          <p className="reveal" style={{ marginTop: 16, maxWidth: 520, color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            Each guide is a complete playbook — not fluff. Templates, worksheets,
            and step-by-step systems included.
          </p>

          <div className="products-grid reveal" style={{ marginTop: 48 }}>
            {PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/${product.slug}`}
                className="product-card"
                style={{ '--card-accent': product.accent } as React.CSSProperties}
              >
                <div className="product-card-num">{product.num}</div>
                <div className="product-card-tag">{product.tag}</div>
                <h3>{product.title}</h3>
                <p>{product.subtitle}</p>
                <div className="product-card-footer">
                  <span className="product-card-price">Pay what you want</span>
                  <span className="product-card-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="container">
          <hr className="divider" style={{ margin: '0 0 80px' }} />
          <span className="section-label reveal">How It Works</span>
          <h2 className="reveal">Simple by design.</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24, marginTop: 48 }}>
            {[
              { num: '01', title: 'Choose a guide', desc: 'Browse the vault. Every guide is built around a real problem real people are searching for answers to.' },
              { num: '02', title: 'Pay what you want', desc: '$0 is genuinely fine. If the guide changes your situation, pay what feels right.' },
              { num: '03', title: 'Instant download', desc: 'PDF lands on your device immediately. No account, no waiting, no DRM.' },
              { num: '04', title: 'Actually use it', desc: 'Each guide ends with a 30-day action plan. The knowledge is worthless without the doing.' },
            ].map((step) => (
              <div key={step.num} className="reveal" style={{ padding: '32px 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--border2)', marginBottom: 16 }}>{step.num}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#fff', marginBottom: 8, fontFamily: 'var(--font-body)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="container">
          <div className="newsletter-section reveal">
            <span className="section-label" style={{ marginBottom: 16 }}>Stay in the loop</span>
            <h2>New guides every month.</h2>
            <p>Get notified when new guides drop, plus weekly insights on the topics that matter most. No spam. Ever.</p>
            <NewsletterForm />
            <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--muted2)' }}>Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-logo">Growth<span>Vault</span></div>
            <div className="footer-links">
              <Link href="#products">Guides</Link>
              <a href="mailto:hello@growthvault.co">Contact</a>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted2)' }}>© 2026 GrowthVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
