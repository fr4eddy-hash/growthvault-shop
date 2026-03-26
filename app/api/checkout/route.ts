import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getProduct } from '@/lib/products';
import { trackEvent } from '@/lib/tracking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { slug, amount, title } = await req.json();

    const product = getProduct(slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://growthvault.vercel.app';
    const numAmount = Math.max(0, parseFloat(amount) || 0);

    // FREE download — skip Stripe, go straight to download
    if (numAmount === 0) {
      // Track free checkout (fire-and-forget)
      trackEvent('checkout_free', slug).catch(() => {});

      return NextResponse.json({
        url: `${appUrl}/success?free=1&slug=${slug}`,
      });
    }

    // PAID — create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(numAmount * 100), // convert to cents
            product_data: {
              name: title || product.title,
              description: `${product.pages} pages · ${product.extras} · Instant PDF download`,
              metadata: { slug },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        slug,
        product_title: product.title,
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}`,
      cancel_url: `${appUrl}/${slug}`,
      // Collect email for sending download link
      customer_creation: 'always',
    });

    // Track paid checkout start (fire-and-forget)
    trackEvent('checkout_paid', slug).catch(() => {});

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
