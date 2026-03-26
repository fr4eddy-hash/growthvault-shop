import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getProduct } from '@/lib/products';
import { trackEvent } from '@/lib/tracking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Returns the Vercel Blob URL for a given product slug
function getBlobUrl(slug: string): string | null {
  // Check for env var set by upload-pdfs.mjs
  const envKey = `BLOB_URL_${slug.toUpperCase().replace(/-/g, '_')}`;
  const url = process.env[envKey];
  return url || null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const slug = searchParams.get('slug');
  const isFree = searchParams.get('free') === '1';

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const product = getProduct(slug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // FREE download — no payment verification needed
  if (isFree) {
    const blobUrl = getBlobUrl(slug);
    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Download not available yet. Please contact hello@growthvault.co' },
        { status: 503 }
      );
    }

    // Track free download (fire-and-forget)
    trackEvent('download_free', slug).catch(() => {});

    return NextResponse.json({
      url: blobUrl,
      title: product.title,
      filename: product.pdfFilename,
    });
  }

  // PAID — verify Stripe session
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not confirmed yet. Please wait a moment.' }, { status: 402 });
    }

    // Verify the slug matches what was purchased
    if (session.metadata?.slug !== slug) {
      return NextResponse.json({ error: 'Invalid session for this product.' }, { status: 403 });
    }

    const blobUrl = getBlobUrl(slug);
    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Download not available yet. Please contact hello@growthvault.co' },
        { status: 503 }
      );
    }

    // Track paid download with revenue (fire-and-forget)
    const amountCents = session.amount_total ?? 0;
    trackEvent('download_paid', slug, { amount_cents: amountCents }).catch(() => {});

    return NextResponse.json({
      url: blobUrl,
      title: product.title,
      filename: product.pdfFilename,
      customerEmail: session.customer_details?.email,
    });
  } catch (err) {
    console.error('Download verification error:', err);
    return NextResponse.json(
      { error: 'Could not verify payment. If you paid, please contact hello@growthvault.co' },
      { status: 500 }
    );
  }
}
