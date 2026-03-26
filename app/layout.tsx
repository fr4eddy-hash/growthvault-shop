import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GrowthVault — Premium Guides. Pay What You Want.',
    template: '%s — GrowthVault',
  },
  description:
    '10 premium PDF guides covering AI, freelancing, finance, remote work, wellness, and more. Pay what you want. Instant download.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://growthvault.vercel.app'),
  openGraph: {
    siteName: 'GrowthVault',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Nav scroll effect
              const nav = document.querySelector('nav');
              if (nav) {
                window.addEventListener('scroll', () => {
                  nav.classList.toggle('scrolled', window.scrollY > 20);
                }, { passive: true });
              }

              // Scroll reveal (homepage cards etc.)
              const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                  if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    revealObserver.unobserve(e.target);
                  }
                });
              }, { threshold: 0.05, rootMargin: '100px 0px 0px 0px' });
              document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

              // ── Product page content check (runs 2x) ──────────────────────
              // Required sections on every product page
              var REQUIRED_SECTIONS = ['checkout', 'who', 'chapters', 'benefits', 'quote', 'faq', 'cta-bottom'];

              function gvCheckContent(pass) {
                var page = document.querySelector('[data-product-page]');
                if (!page) return; // not a product page
                var missing = [];
                var hidden  = [];
                REQUIRED_SECTIONS.forEach(function(s) {
                  var el = page.querySelector('[data-section="' + s + '"]');
                  if (!el) {
                    missing.push(s);
                  } else {
                    var style = window.getComputedStyle(el);
                    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) {
                      hidden.push(s);
                      // Force visible as fallback
                      el.style.opacity = '1';
                      el.style.visibility = 'visible';
                      el.style.display = el.style.display === 'none' ? 'block' : el.style.display;
                    }
                  }
                });
                var slug = page.getAttribute('data-product-page');
                if (missing.length === 0 && hidden.length === 0) {
                  console.log('[GrowthVault] Content check #' + pass + ' OK — all ' + REQUIRED_SECTIONS.length + ' sections visible on /' + slug);
                } else {
                  if (missing.length) console.warn('[GrowthVault] Content check #' + pass + ' MISSING sections on /' + slug + ':', missing);
                  if (hidden.length) console.warn('[GrowthVault] Content check #' + pass + ' force-showed hidden sections on /' + slug + ':', hidden);
                }
              }

              // Check 1: on DOMContentLoaded (or immediately if already ready)
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() { gvCheckContent(1); });
              } else {
                gvCheckContent(1);
              }
              // Check 2: after 2 seconds (catches late hydration or animation glitches)
              setTimeout(function() { gvCheckContent(2); }, 2000);
            `,
          }}
        />
      </body>
    </html>
  );
}
