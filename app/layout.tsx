import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
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
              // Scroll reveal
              const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                  if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    revealObserver.unobserve(e.target);
                  }
                });
              }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
              document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
            `,
          }}
        />
      </body>
    </html>
  );
}
