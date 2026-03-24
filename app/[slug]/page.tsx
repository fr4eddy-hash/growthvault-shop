import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getAllSlugs } from '@/lib/products';
import CheckoutButton from './CheckoutButton';
import FaqSection from './FaqSection';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.subtitle,
  };
}

export default function ProductPage({ params }: Props) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const cssVars = {
    '--accent': product.accent,
    '--accent-dim': product.accentDim,
    '--accent-spine': product.accent,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">Growth<span>Vault</span></Link>
        <Link href="#get-it" className="nav-cta" style={{ borderColor: `${product.accent}50`, color: product.accent }}>
          Get This Guide
        </Link>
      </nav>

      {/* PRODUCT HERO */}
      <section className="product-hero">
        <div className="container">
          <div className="product-hero-grid">

            {/* Left: Copy */}
            <div>
              <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                ← All Guides
              </Link>
              <p className="hero-eyebrow fade-up" style={{ color: product.accent }}>{product.tag}</p>
              <h1 className="fade-up" style={{ animationDelay: '0.1s' }}>{product.title}</h1>
              <p className="hero-sub fade-up" style={{ animationDelay: '0.2s' }}>{product.subtitle}</p>
              <div className="hero-actions fade-up" style={{ animationDelay: '0.3s' }}>
                <Link href="#get-it" className="btn btn--accent btn--lg" style={{ '--accent': product.accent, '--accent-shadow': `${product.accent}40` } as React.CSSProperties}>
                  Get This Guide →
                </Link>
                <span className="badge" style={{ background: product.accentDim, color: product.accent }}>
                  ● Pay What You Want
                </span>
              </div>

              {/* Quick stats */}
              <div className="stats-bar fade-up" style={{ marginTop: 40, padding: '28px 0', animationDelay: '0.4s' }}>
                <div className="stat-item">
                  <div className="stat-num" style={{ fontSize: '1.6rem', color: product.accent }}>{product.pages}</div>
                  <div className="stat-label">Pages</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num" style={{ fontSize: '1.6rem', color: product.accent }}>{product.chapters}</div>
                  <div className="stat-label">Chapters</div>
                </div>
                <div className="stat-item" style={{ gridColumn: 'span 2' }}>
                  <div className="stat-num" style={{ fontSize: '1rem', color: product.accent, fontFamily: 'var(--font-body)' }}>+ {product.extras}</div>
                  <div className="stat-label">Included</div>
                </div>
              </div>
            </div>

            {/* Right: Book Cover Mockup */}
            <div>
              <div className="book-cover">
                <div className="book-cover-accent" />
                <div className="book-cover-num">{product.num}</div>
                <div className="book-cover-logo">GrowthVault</div>
                <div className="book-cover-tag">{product.tag}</div>
                <div className="book-cover-divider" style={{ background: product.accent, opacity: 0.3 }} />
                <h2>{product.title}</h2>
                <p className="book-cover-pages">{product.pages} pages · {product.extras}</p>
                <div style={{ marginTop: 24 }}>
                  <span className="badge" style={{ background: product.accentDim, color: product.accent, fontSize: '0.72rem' }}>
                    Pay What You Want
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section>
        <div className="container--sm">
          <hr className="divider" style={{ margin: '0 0 60px' }} />
          <span className="section-label reveal">Who This Is For</span>
          <p className="reveal" style={{ fontSize: '1.1rem', lineHeight: 1.9, color: '#bbb8b0', marginTop: 16 }}>
            {product.who}
          </p>

          <div className="quote-block reveal" style={{ marginTop: 40 }}>
            <blockquote>"{product.promise}"</blockquote>
            <cite>What you'll walk away with</cite>
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      <section>
        <div className="container">
          <div className="section-intro reveal">
            <span className="section-label">Inside the Guide</span>
            <h2>What you'll learn</h2>
            <p style={{ marginTop: 16, fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.8 }}>
              {product.chapters} chapters. Every one actionable. No padding, no filler.
            </p>
          </div>

          <div className="chapters-list">
            {product.chapters_list.map((ch, i) => (
              <div key={i} className="chapter-item reveal">
                <div className="chapter-num" style={{ color: product.accent, opacity: 0.6 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="chapter-content">
                  <h4>{ch.title}</h4>
                  <p>{ch.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{ background: 'var(--bg2)', padding: '80px 0' }}>
        <div className="container">
          <div className="section-intro reveal">
            <span className="section-label">What's Included</span>
            <h2>Everything you need</h2>
          </div>

          <div className="benefits-grid">
            {product.benefits.map((b, i) => (
              <div key={i} className="benefit-item reveal" style={{ '--accent-dim': product.accentDim, '--accent': product.accent } as React.CSSProperties}>
                <div className="benefit-check">✓</div>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section>
        <div className="container--sm">
          <div className="quote-block reveal" style={{ margin: 0 }}>
            <blockquote>"{product.quote.text}"</blockquote>
            <cite>— {product.quote.author}</cite>
          </div>
        </div>
      </section>

      {/* CHECKOUT */}
      <section id="get-it">
        <div className="container--xs">
          <span className="section-label reveal" style={{ textAlign: 'center', display: 'block' }}>Get The Guide</span>
          <h2 className="reveal" style={{ textAlign: 'center', marginBottom: 8 }}>Ready when you are.</h2>
          <p className="reveal" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 8 }}>
            Instant download. PDF. {product.pages} pages + {product.extras}.
          </p>

          <CheckoutButton
            slug={product.slug}
            title={product.title}
            suggestedPrice={product.price}
            accent={product.accent}
            accentDim={product.accentDim}
          />
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="container--sm">
          <hr className="divider" style={{ margin: '0 0 60px' }} />
          <span className="section-label reveal">FAQ</span>
          <h2 className="reveal" style={{ marginBottom: 8 }}>Questions answered.</h2>

          <FaqSection items={product.faq} />
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="container--xs" style={{ textAlign: 'center' }}>
          <h2 className="reveal" style={{ marginBottom: 16 }}>Don't overthink it.</h2>
          <p className="reveal" style={{ color: 'var(--muted)', marginBottom: 32, fontSize: '0.95rem', lineHeight: 1.8 }}>
            $0 is fine. Read it. If it changes something for you, come back and pay what it was worth.
          </p>
          <Link href="#get-it" className="btn btn--accent btn--lg reveal" style={{ '--accent': product.accent, '--accent-shadow': `${product.accent}40` } as React.CSSProperties}>
            Get This Guide →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <Link href="/" className="footer-logo">Growth<span>Vault</span></Link>
            <div className="footer-links">
              <Link href="/">← All Guides</Link>
              <a href="mailto:hello@growthvault.co">Contact</a>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted2)' }}>© 2026 GrowthVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
